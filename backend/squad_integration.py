import httpx
import os
import uuid
from fastapi import HTTPException

async def initiate_squad_payout(payout_data: dict):
    # 1. Define missing variables from environment
    secret_key = os.getenv("SQUAD_SECRET_KEY")
    url = os.getenv("SQUAD_URL")
    merchant_id = os.getenv("SQUAD_MERCHANT_ID")
    
    # 2. Requirement: Reference MUST contain the Merchant ID
    unique_ref = f"{merchant_id}_{uuid.uuid4().hex[:8]}"
    
    # 3. Construct the payload exactly as Squad expects
    payload = {
        "remark": payout_data.get("remark", "VHM Sentinel Payout"),
        "bank_code": payout_data.get("bank_code"), # e.g., "000013"
        "currency_id": "NGN",
        "amount": str(payout_data.get("amount")), # Must be a string
        "account_number": payout_data.get("account_number"),
        "transaction_reference": unique_ref,
        "account_name": payout_data.get("account_name", "VHM USER")
    }

    # 4. Set Headers
    headers = {
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json"
    }

    # 5. Execute Request
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code != 200:
                # Provides detailed error if Squad rejects the request
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Squad Error: {response.text}"
                )
                
            return response.json()
            
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, 
                detail=f"Squad Service Unavailable: {str(exc)}"
            )