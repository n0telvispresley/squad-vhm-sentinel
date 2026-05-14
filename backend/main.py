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
    "+2348139085365": "emp_001",
    "+2349042878714": "emp_002",
    "+2347069484903": "emp_003",
    "+2348077223344": "emp_004",
    "+2348099887766": "emp_admin",
    "+2348099999999": "emp_fraud",
}

user_db = {
    "emp_001": {
        "ippis_id": "IPPIS-20847-LG",
        "password": "Sentinel@2026",
        "name": "Elvis Ebenuwah",
        "phone": "+2348139085365",
        "phone_display": "0813 908 **65",
        "last_lat": 6.5244,
        "last_long": 3.3792,
        "last_verify_time": datetime.datetime.now() - datetime.timedelta(hours=2),
        "device_fingerprint": "DEV-FP-8847A",
        "salary_amount": 185000,
        "bank_code": "057",
        "account_number": "2234567890",
        "account_name": "Elvis Ebenuwah",
        "role": "employee",
        "salary_history": [
            {"id": "mod_01", "date": "2026-04-01", "type": "Grade Upgrade", "old": 168000, "new": 185000, "by": "Mrs. R. Okonkwo"}
        ]
    },
    "emp_002": {
        "ippis_id": "IPPIS-33412-AB",
        "password": "Sentinel@2026",
        "name": "Michael Atuorah",
        "phone": "+2349042878714",
        "phone_display": "0904 287 **14",
        "last_lat": 9.0579,
        "last_long": 7.4951,
        "last_verify_time": datetime.datetime.now() - datetime.timedelta(hours=3),
        "device_fingerprint": "DEV-FP-2210B",
        "salary_amount": 198000,
        "bank_code": "044",
        "account_number": "0123456789",
        "account_name": "Michael Atuorah",
        "role": "employee",
        "salary_history": [
            {"id": "mod_02", "date": "2026-03-01", "type": "Step Increment", "old": 190000, "new": 198000, "by": "System Auto"}
        ]
    },
    "emp_003": {
        "ippis_id": "IPPIS-71002-KD",
        "password": "Sentinel@2026",
        "name": "Mohammed Al-Hameen",
        "phone": "+2347069484903",
        "phone_display": "0706 948 **03",
        "last_lat": 11.1059,
        "last_long": 7.7247,
        "last_verify_time": datetime.datetime.now() - datetime.timedelta(hours=5),
        "device_fingerprint": "DEV-FP-9901C",
        "salary_amount": 142000,
        "bank_code": "011",
        "account_number": "3098765432",
        "account_name": "Mohammed Al-Hameen",
        "role": "employee",
        "salary_history": [
            {"id": "mod_03", "date": "2026-02-14", "type": "Bank Account Update", "old": "Access ****0011", "new": "First Bank ****5432", "by": "Mr. K. Eze"}
        ]
    },
    "emp_004": {
        "ippis_id": "IPPIS-88234-KN",
        "password": "Sentinel@2026",
        "name": "Fatima Al-Rashid",
        "phone": "+2348077223344",
        "phone_display": "0807 722 **44",
        "last_lat": 12.0022,
        "last_long": 8.5919,
        "last_verify_time": datetime.datetime.now() - datetime.timedelta(hours=1),
        "device_fingerprint": "DEV-FP-4412D",
        "salary_amount": 218000,
        "bank_code": "058",
        "account_number": "0056781234",
        "account_name": "Fatima Al-Rashid",
        "role": "employee",
        "salary_history": [
            {"id": "mod_04", "date": "2026-01-10", "type": "Step Increment", "old": 210000, "new": 218000, "by": "Mrs. R. Okonkwo"}
        ]
    },
    "emp_admin": {
        "ippis_id": "HR-ADMIN-0041",
        "password": "Admin@Sentinel26",
        "name": "Mrs. R. Okonkwo",
        "phone": "+2348099887766",
        "phone_display": "0809 988 **66",
        "last_lat": 9.0579,
        "last_long": 7.4951,
        "last_verify_time": datetime.datetime.now() - datetime.timedelta(minutes=30),
        "device_fingerprint": "DEV-FP-7700E",
        "salary_amount": 380000,
        "bank_code": "033",
        "account_number": "2087654321",
        "account_name": "Mrs R Okonkwo",
        "role": "admin",
        "salary_history": []
    },
    "emp_fraud": {
        "ippis_id": "IPPIS-30981-LA",
        "password": "Sentinel@2026",
        "name": "Ghost Worker (Fraud Test)",
        "phone": "+2348099999999",
        "phone_display": "0809 999 **99",
        "last_lat": 51.5074,
        "last_long": -0.1278,
        "last_verify_time": datetime.datetime.now() - datetime.timedelta(days=5),
        "device_fingerprint": "unknown_device",
        "salary_amount": 500000,
        "bank_code": "000013",
        "account_number": "0123456789",
        "account_name": "Ghost Worker",
        "role": "employee",
        "salary_history": [
            {"id": "mod_99", "date": "2026-05-10", "type": "Manual Hike", "old": 50000, "new": 500000, "by": "Stolen_Admin_Creds"}
        ]
    },
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

import random

# In-memory OTP store (replace with Redis in production)
otp_store = {}

@app.post("/auth/login")
async def auth_login(data: dict):
    """
    Validate IPPIS credentials and trigger OTP send.
    In production: integrate Termii or Africa's Talking SMS here.
    """
    ippis_id = data.get("ippis_id")
    password = data.get("password")

    # Validate against user_db
    user = None
    for emp_id, emp in user_db.items():
        if emp.get("ippis_id") == ippis_id and emp.get("password") == password:
            user = emp
            break

    if not user:
        raise HTTPException(status_code=401, detail="Invalid IPPIS ID or password.")

    # Generate OTP
    otp_code = str(random.randint(100000, 999999))
    otp_store[ippis_id] = {
        "code": otp_code,
        "expires": datetime.datetime.now() + datetime.timedelta(minutes=5),
        "attempts": 0
    }

    # TODO: Send via Termii SMS
    # await send_sms(user["phone"], f"Your VHM Sentinel OTP is {otp_code}")
    print(f"[VHM OTP] {ippis_id} → {otp_code}")  # Dev only — remove in production

    return {
        "status": "OTP_SENT",
        "message": f"OTP sent to registered number",
        "phone_display": user.get("phone_display", "****")
    }


@app.post("/auth/verify-otp")
async def auth_verify_otp(data: dict):
    """Verify the OTP entered by the user."""
    ippis_id = data.get("ippis_id")
    otp_code = data.get("otp_code")
    session_id = data.get("session_id")

    record = otp_store.get(ippis_id)

    if not record:
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one.")

    if datetime.datetime.now() > record["expires"]:
        del otp_store[ippis_id]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    record["attempts"] += 1
    if record["attempts"] > 3:
        del otp_store[ippis_id]
        raise HTTPException(status_code=429, detail="Too many attempts. Account locked.")

    if otp_code != record["code"]:
        raise HTTPException(status_code=401, detail=f"Invalid OTP. {3 - record['attempts']} attempts remaining.")

    del otp_store[ippis_id]  # OTP consumed — single use
    log_event(ippis_id, "Passed", "OTP Verified")

    return {"status": "VERIFIED", "session_id": session_id}


@app.post("/auth/resend-otp")
async def auth_resend_otp(data: dict):
    """Resend OTP to the registered number."""
    ippis_id = data.get("ippis_id")

    otp_code = str(random.randint(100000, 999999))
    otp_store[ippis_id] = {
        "code": otp_code,
        "expires": datetime.datetime.now() + datetime.timedelta(minutes=5),
        "attempts": 0
    }

    print(f"[VHM OTP RESEND] {ippis_id} → {otp_code}")

    return {"status": "OTP_RESENT"}

@app.post("/session/geo-checkin")
async def silent_geo_ping(data: dict):
    session_id = data.get("session_id")
    sessions[session_id] = {
        "otp_coords": (data['lat'], data['lng']),
        "timestamp": datetime.datetime.now()
    }
    return {"status": "success"}

@app.post("/verify")
@app.post("/verify")
async def verify_integrity(data: dict, request: Request):
    ippis_id = data.get("employee_id")  # frontend sends IPPIS ID string
    current_coords = (data.get('lat', 0), data.get('lng', 0))
    device_hash = data.get("device_hash")
    client_ip = request.client.host

    # ── Find employee by IPPIS ID (not by dict key) ──
    emp_id = None
    user = None
    for key, emp in user_db.items():
        if emp.get("ippis_id") == ippis_id:
            emp_id = key
            user = emp
            break

    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    # rest of your verify logic continues unchanged...
    ip_intel = await sec_service.get_ip_intel(client_ip)
    # ...etc
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