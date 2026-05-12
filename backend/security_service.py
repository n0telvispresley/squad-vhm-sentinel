import httpx
from fastapi import HTTPException, Request
from sklearn.ensemble import IsolationForest
import numpy as np

class SecurityService:
    def __init__(self):
        self.IP_API_KEY = "YOUR_IPXAPI_KEY"
        self.BASE_URL = "https://ipxapi.com/api/ip"
        # Dummy model for anomaly scoring; in production, load a pre-trained pickle
        self.anomaly_model = IsolationForest(contamination=0.1)

    async def verify_ip_integrity(self, request: Request):
        client_ip = request.client.host
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/{client_ip}", 
                headers={"Authorization": f"Bearer {self.IP_API_KEY}"}
            )
            data = response.json()
            
            is_vpn = data.get("is_vpn", False)
            is_proxy = data.get("is_proxy", False)
            country = data.get("country_code", "NG")

            if is_vpn or is_proxy or country != "NG":
                raise HTTPException(
                    status_code=403, 
                    detail="Access Denied: VPN/Proxy detected. Please connect via a local residential network."
                )
        return True

    def check_payroll_anomalies(self, record, median_salary, ipis_mapping):
        """
        Logic: Flag multi-linked IPPIS IDs or unauthorized jumps.
        """
        # 1. Check for duplicate bank account mapping
        if len(ipis_mapping.get(record['bank_account'], [])) > 1:
            return "FLAGGED: Linked to multiple IPPIS IDs"

        # 2. Check for unauthorized salary jump
        jump = (record['amount'] - median_salary) / median_salary
        if jump > 0.30:
            return "FLAGGED: Unauthorized salary jump > 30%"

        return "CLEAN"