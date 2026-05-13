import sys
import os
from pathlib import Path

# --- PATH INJECTION ---
# Ensures 'security_service' and 'squad_integration' are discoverable
# when running uvicorn from the root project directory.
backend_path = str(Path(__file__).parent)
if backend_path not in sys.path:
    sys.path.append(backend_path)

from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.responses import RedirectResponse 
from fastapi.middleware.cors import CORSMiddleware
from security_service import SecurityService
from squad_integration import initiate_squad_payout
import datetime
from dotenv import load_dotenv

load_dotenv() 

app = FastAPI(title="VHM Sentinel Backend")

# Enable CORS for the Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For Hackathon: Allow all for easier frontend testing
    allow_methods=["*"],
    allow_headers=["*"],
)

sec_service = SecurityService()

# --- 1. DATA STORES (In-Memory for Hackathon) ---
sessions = {} 
verification_events = [] 
dispute_tickets = [] 
phone_to_emp = {
    "+2348012345678": "emp_001", # Africa's Talking Sandbox mapping
    "+2348099999999": "emp_002"  # Fraud Test mapping
} 

# Unified Employee Database
user_db = {
    "emp_001": {
        "name": "Stephen Ebenuwah",
        "last_lat": 9.0765, 
        "last_long": 7.3986,
        "last_verify_time": datetime.datetime.now() - datetime.timedelta(hours=2),
        "device_fingerprint": "macbook_air_v1",
        "salary_amount": 185000,
        "salary_history": [
            {"id": "mod_01", "date": "2026-05-01", "type": "Grade Sync", "old": 180000, "new": 185000, "by": "System"}
        ]
    },
    "emp_002": {
        "name": "Ghost Worker (Fraud Test)",
        "last_lat": 51.5074, # London (Trigger Velocity Check)
        "last_long": -0.1278,
        "last_verify_time": datetime.datetime.now() - datetime.timedelta(days=5),
        "device_fingerprint": "unknown_device",
        "salary_amount": 500000,
        "salary_history": [
            {"id": "mod_99", "date": "2026-05-10", "type": "Manual Hike", "old": 50000, "new": 500000, "by": "Stolen_Admin_Creds"}
        ]
    }
}

# --- 2. HELPER LOGIC ---
def is_within_release_window():
    return True 

def log_event(emp_id, status, reason=None):
    event = {
        "employee_id": emp_id,
        "employee_name": user_db.get(emp_id, {}).get("name", "Unknown"),
        "timestamp": datetime.datetime.now().isoformat(),
        "status": status, 
        "reason": reason
    }
    verification_events.insert(0, event)

# --- 3. ROUTES ---

@app.get("/")
async def root():
    """Redirects the root URL to the interactive documentation."""
    return RedirectResponse(url="/docs")

@app.post("/ussd")
async def ussd_handler(request: Request):
    """
    Africa's Talking USSD Implementation.
    - Uses form-data (x-www-form-urlencoded)
    - Responds with text/plain (CON/END)
    - Implements 24h Web-Verification Lock for Security
    """
    form_data = await request.form()
    phone_number = form_data.get("phoneNumber")
    text = form_data.get("text", "") 

    levels = text.split("*")
    current_choice = levels[-1] if text else ""

    emp_id = phone_to_emp.get(phone_number)
    if not emp_id:
        return Response(content="END Error: Phone number not registered.", media_type="text/plain")

    user = user_db.get(emp_id)

    if text == "":
        response = f"CON VHM Sentinel\nHello, {user['name'].split()[0]}\n1. Verify & Release Salary\n2. Check Last Pay Update"
    
    elif current_choice == "1":
        last_verify = user.get("last_verify_time")
        time_since_last_web_verify = (datetime.datetime.now() - last_verify).total_seconds() / 3600
        
        if time_since_last_web_verify > 24:
            log_event(emp_id, "Flagged", "USSD Attempt - No recent Web-Verify")
            response = "END Security: Please verify via VHM Web Portal first."
        else:
            payout_details = {
                "bank_code": "000013",
                "account_number": "0123456789",
                "amount": user["salary_amount"],
                "account_name": user["name"]
            }
            try:
                await initiate_squad_payout(payout_details)
                log_event(emp_id, "Passed", "USSD-Triggered Release")
                response = f"END Success! ₦{user['salary_amount']} released.\nRef: SQUAD-USSD-{datetime.datetime.now().strftime('%M%S')}"
            except Exception as e:
                response = f"END System Error: {str(e)[:30]}"

    elif current_choice == "2":
        last_mod = user["salary_history"][0]
        response = f"END Last Update: {last_mod['type']}\nBy: {last_mod['by']}\nNew Pay: ₦{last_mod['new']}"
    
    else:
        response = "END Invalid selection."

    return Response(content=response, media_type="text/plain")

@app.post("/session/geo-checkin")
async def silent_geo_ping(data: dict):
    session_id = data.get("session_id")
    sessions[session_id] = {
        "otp_coords": (data['lat'], data['lng']),
        "timestamp": datetime.datetime.now()
    }
    return {"status": "success"}

@app.post("/verify")
async def verify_integrity(data: dict, request: Request):
    emp_id = data.get("employee_id")
    current_coords = (data['lat'], data['lng'])
    device_hash = data.get("device_hash")
    client_ip = request.client.host

    if emp_id not in user_db:
        raise HTTPException(status_code=404, detail="Employee not found")

    user = user_db[emp_id]

    ip_intel = await sec_service.get_ip_intel(client_ip)
    if ip_intel.get("status") == "success":
        if ip_intel.get("countryCode") != "NG" or ip_intel.get("proxy"):
            log_event(emp_id, "Flagged", "VPN/Proxy Detected")
            raise HTTPException(status_code=403, detail="Security: VPN/Proxy detected.")

    device_status = sec_service.verify_device_binding(device_hash, user.get("device_fingerprint"))

    last_coords = (user["last_lat"], user["last_long"])
    time_diff = (datetime.datetime.now() - user["last_verify_time"]).total_seconds() / 3600
    speed, _ = sec_service.calculate_velocity(last_coords, current_coords, max(time_diff, 0.01))

    if speed > 900:
        log_event(emp_id, "Flagged", f"Velocity Breach: {speed:.0f}km/h")
        raise HTTPException(status_code=403, detail="Impossible travel detected.")

    user["last_lat"], user["last_long"] = data['lat'], data['lng']
    user["last_verify_time"] = datetime.datetime.now()
    log_event(emp_id, "Passed")
    
    return {"status": "SUCCESS", "release_token": "SQUAD_VHM_RELEASE_001"}

@app.get("/admin/disputes")
async def get_all_disputes():
    """Admin View: List all tickets raised by users."""
    return dispute_tickets

@app.post("/dispute")
async def submit_dispute(data: dict):
    ticket_id = f"DISP-{datetime.datetime.now().strftime('%M%S')}"
    new_dispute = {
        "ticket_id": ticket_id,
        "employee_id": data.get("employee_id"),
        "reason": data.get("reason"),
        "status": "Pending Review",
        "timestamp": datetime.datetime.now().isoformat()
    }
    dispute_tickets.insert(0, new_dispute)
    log_event(data.get("employee_id"), "Flagged", f"Dispute Ticket: {ticket_id}")
    return {"status": "SUCCESS", "ticket_id": ticket_id}

@app.get("/admin/feed")
async def get_verification_feed():
    return verification_events

@app.post("/payout")
async def process_squad_payout(request: dict):
    if request.get("token") != "SQUAD_VHM_RELEASE_001":
         raise HTTPException(status_code=401, detail="Invalid Release Token")
    
    response = await initiate_squad_payout(request["payout_details"])
    
    log_event(
        emp_id="System", 
        status="Passed", 
        reason=f"Disbursement Successful: {response['data']['transaction_reference']}"
    )
    
    return response