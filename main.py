from fastapi import FastAPI, Depends, Request, Header
from security_service import SecurityService
from squad_integration import initiate_squad_payout
import datetime

app = FastAPI(title="VHM Sentinel: Payroll Integrity Wrapper")
sec_service = SecurityService()

# Mock Database State
database = {
    "salary_status": "LOCKED",
    "audit_logs": [],
    "median_salary": 150000.0,
    "ippis_map": {"0012345678": ["IPPIS_99", "IPPIS_102"]} # Example of flagged account
}

@app.middleware("http")
async def ip_security_middleware(request: Request, call_next):
    # Only protect sensitive verification/payout routes
    if request.url.path in ["/verify", "/payout"]:
        await sec_service.verify_ip_integrity(request)
    response = await call_next(request)
    return response

@app.post("/verify")
async def verify_integrity(payroll_record: dict):
    # ML Anomaly Check
    status = sec_service.check_payroll_anomalies(
        payroll_record, 
        database["median_salary"], 
        database["ippis_map"]
    )
    
    if status != "CLEAN":
        return {"status": "REJECTED", "reason": status}

    # Simulate AI Liveness Verification (Condition 2)
    # In production, this would be an SDK callback or biometric token check
    liveness_passed = True 
    
    if liveness_passed:
        database["salary_status"] = "UNLOCKED"
        return {"status": "SUCCESS", "message": "Gatekeeper Unlocked"}

@app.post("/payout")
async def process_payout(payout_request: dict):
    is_unlocked = database["salary_status"] == "UNLOCKED"
    result = await initiate_squad_payout(payout_request, is_unlocked)
    
    # Re-lock immediately after payout attempt
    database["salary_status"] = "LOCKED"
    return result

@app.patch("/admin/salary-grade")
async def update_salary_grade(update: dict, admin_user: str = Header(...)):
    """
    Immutable Audit Trail Implementation
    """
    old_value = 200000 # Mock lookup
    new_value = update['new_amount']
    
    log_entry = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "admin": admin_user,
        "action": "UPDATE_GRADE",
        "before": old_value,
        "after": new_value,
        "integrity_hash": hash(f"{admin_user}{new_value}") # Simplified for example
    }
    
    database["audit_logs"].append(log_entry)
    return {"status": "Success", "log_id": len(database["audit_logs"])}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)