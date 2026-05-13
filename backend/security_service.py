import httpx
from haversine import haversine, Unit
from fastapi import HTTPException

class SecurityService:
    def __init__(self):
        # Using ip-api.com (Free for development, no key needed)
        self.ip_api_url = "http://ip-api.com/json"

    async def get_ip_intel(self, ip: str):
        async with httpx.AsyncClient() as client:
            # Standard IP lookup to check country and hosting/proxy status
            # Note: 127.0.0.1 will return 'fail' locally; the code handles this gracefully.
            try:
                response = await client.get(f"{self.ip_api_url}/{ip}?fields=status,countryCode,proxy,hosting")
                return response.json()
            except Exception:
                return {"status": "fail"}

    def verify_device_binding(self, provided_hash, registered_hash):
        """
        Feature 3: Device Fingerprint Binding[cite: 216].
        Compares the hardware hash from the frontend to the one in the registry.
        """
        if not registered_hash:
            return "NEW_DEVICE"
        return "RECOGNIZED" if provided_hash == registered_hash else "UNRECOGNIZED"

    def calculate_velocity(self, last_loc, current_loc, time_delta_hours):
        # Feature 7: Impossible Travel logic [cite: 259, 264]
        distance = haversine(last_loc, current_loc, unit=Unit.KILOMETERS)
        if time_delta_hours <= 0: return 0, distance
        speed = distance / time_delta_hours
        return speed, distance