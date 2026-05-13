from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from security_service import SecurityService
from squad_integration import initiate_squad_payout
import os, datetime
from dotenv import load_dotenv

load_dotenv() 

app = FastAPI(title="VHM Sentinel Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)

sec_service = SecurityService()

# --- 1. DATA STORES (In-Memory for Hackathon) ---
sessions = {} # View 1.2 [cite: 24]
verification_events = [] # View 5.2 [cite: 179]
dispute_tickets = [] # View 6.2 [cite: 233]

# Unified Employee Database
user_db = {
    "emp_001": {
        "name": "Stephen Ebenuwah",
        "last_lat": 9.0765, 
        "last_long": 7.3986,
        "last_verify_time": datetime.datetime.now() - datetime.timedelta(hours=2),
        "device_fingerprint": "macbook_air_v1",
        "salary_amount": 185000,
        "salary_history": [ # View 2.4 [cite: 73, 75]
            {
                "id": "mod_01", 
                "date": "2026-05-01", 
                "type": "Grade Sync", 
                "old": 180000, 
                "new": 185000, 
                "by": "System"
            }
        ]
    }
}

# --- 2. HELPER LOGIC ---
def is_within_release_window():
    # Feature 5: Only allow 25th-28th [cite: 82]
    # Set to 'return True' for active testing during hackathon development
    return True 

def log_event(emp_id, status, reason=None):
    # View 5.2: Live Feed entry [cite: 179]
    event = {
        "employee_id": emp_id,
        "timestamp": datetime.datetime.now().isoformat(),
        "status": status, # Passed, Failed, or Flagged 
        "reason": reason
    }
    verification_events.insert(0, event)

# --- 3. ROUTES ---

@app.post("/session/geo-checkin")
async def silent_geo_ping(data: dict):
    # View 1.2: Background coordinate capture [cite: 24]
    session_id = data.get("session_id")
    sessions[session_id] = {
        "otp_coords": (data['lat'], data['lng']),
        "timestamp": datetime.datetime.now()
    }
    return {"status": "success"}

@app.post("/verify")
async def verify_integrity(data: dict, request: Request):
    # Feature 5 Guard [cite: 85]
    if not is_within_release_window():
        raise HTTPException(status_code=403, detail="Outside salary release window.")

    emp_id = data.get("employee_id")
    current_coords = (data['lat'], data['lng'])
    device_hash = data.get("device_hash")
    client_ip = request.client.host

    if emp_id not in user_db:
        raise HTTPException(status_code=404, detail="Employee not found")

    user = user_db[emp_id]

    # IP Intelligence Check [cite: 5]
    ip_intel = await sec_service.get_ip_intel(client_ip)
    if ip_intel.get("status") == "success":
        if ip_intel.get("countryCode") != "NG" or ip_intel.get("proxy"):
            log_event(emp_id, "Flagged", "VPN/Proxy Detected")
            raise HTTPException(status_code=403, detail="VPN/Proxy detected.")

    # Feature 3: Device Binding [cite: 216]
    device_status = sec_service.verify_device_binding(device_hash, user.get("device_fingerprint"))

    # Feature 7: Velocity Check [cite: 259, 260]
    last_coords = (user["last_lat"], user["last_long"])
    time_diff = (datetime.datetime.now() - user["last_verify_time"]).total_seconds() / 3600
    speed, distance = sec_service.calculate_velocity(last_coords, current_coords, time_diff)

    if speed > 900:
        log_event(emp_id, "Flagged", f"Velocity Breach: {speed:.0f}km/h")
        raise HTTPException(status_code=403, detail="Impossible travel detected.")

    # Final Success [cite: 138]
    user["last_lat"], user["last_long"] = data['lat'], data['lng']
    user["last_verify_time"] = datetime.datetime.now()
    log_event(emp_id, "Passed")
    
    return {
        "status": "SUCCESS", 
        "device_status": device_status,
        "release_token": "SQUAD_VHM_RELEASE_001"
    }

@app.get("/admin/stats")
async def get_admin_metrics():
    # View 5.1: Summary KPI Metrics [cite: 170, 171]
    blocked_fraud = sum([user_db[e['employee_id']]['salary_amount'] for e in verification_events if e['status'] == 'Flagged'])
    return {
        "total_blocked_fraud": blocked_fraud, # 
        "flagged_profiles": len([e for e in verification_events if e['status'] == 'Flagged']), # [cite: 173]
        "pending_verifications": len(sessions) # [cite: 174]
    }

@app.get("/admin/feed")
async def get_verification_feed():
    return verification_events # [cite: 179]

@app.post("/dispute")
async def submit_dispute(data: dict):
    # View 6.1: Submission logic [cite: 229, 231]
    ticket_id = f"DISP-{datetime.datetime.now().strftime('%M%S')}"
    new_dispute = {
        "ticket_id": ticket_id,
        "employee_id": data.get("employee_id"),
        "reason": data.get("reason"),
        "status": "Submitted", # [cite: 234]
        "timestamp": datetime.datetime.now().isoformat()
    }
    dispute_tickets.insert(0, new_dispute)
    log_event(data.get("employee_id"), "Flagged", f"Dispute Raised: {ticket_id}")
    return {"status": "SUCCESS", "ticket_id": ticket_id}

@app.post("/payout")
async def process_squad_payout(request: dict):
    if request.get("token") != "SQUAD_VHM_RELEASE_001":
         raise HTTPException(status_code=401, detail="Invalid Release Token")
    
    # 1. Trigger the actual Squad Transfer
    response = await initiate_squad_payout(request["payout_details"])
    
    # 2. Log the disbursement for the Admin Feed (View 5.2)
    # This allows the HR officer to see that the money actually moved!
    log_event(
        emp_id="System", 
        status="Passed", 
        reason=f"Disbursement Successful: {response['data']['transaction_reference']}"
    )
    
    return response