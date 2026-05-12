import httpx
import os
from fastapi import HTTPException

SQUAD_SECRET_KEY = os.getenv("SQUAD_SECRET_KEY")
SQUAD_URL = "https://sandbox-api-d.squadco.com/transfer"

async def initiate_squad_payout(payout_data: dict, is_unlocked: bool):
    if not is_unlocked:
        raise HTTPException(
            status_code=400, 
            detail="Gatekeeper Error: Salary state is LOCKED. Complete liveness and security checks."
        )

    headers = {
        "Authorization": f"Bearer {SQUAD_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(SQUAD_URL, json=payout_data, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Squad API Error")
        return response.json()