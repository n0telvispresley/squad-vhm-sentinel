# 🛡️ VHM Sentinel — Backend Core

This is the FastAPI backend for the **VHM Sentinel Payroll Integrity System**.  
It handles:

- Geo-location anomaly detection
- Velocity & impossible-travel analysis
- Device verification
- Audit trail logging
- Secure Squad API payout orchestration

The backend acts as the **Intelligent Security Layer** between employee verification and salary disbursement.

---

# 🛠️ Setup & Installation

## 1. Environment Configuration

Create a `.env` file in the root directory (copy from `.env.example`):

```env
SQUAD_SECRET_KEY=sandbox_sk_...
SQUAD_MERCHANT_ID=SBABCKDY_...
SQUAD_URL=https://sandbox-api-d.squadco.com/payout/transfer
FRONTEND_URL=http://localhost:3000
```

---

## 2. Install Dependencies

Ensure your virtual environment is active:

### Mac/Linux

```bash
source venv/bin/activate
```

### Install Requirements

```bash
pip install -r requirements.txt
```

---

# 🚀 Running the Server

Because the source files are located inside the `backend/` directory, run the server from the root of the project to ensure all modules are discoverable.

```bash
uvicorn backend.main:app --reload
```

---

# 📖 Interactive API Documentation

Once the server is running, visit:

| Documentation | URL                         |
| ------------- | --------------------------- |
| Swagger UI    | http://127.0.0.1:8000/docs  |
| ReDoc         | http://127.0.0.1:8000/redoc |

> The root endpoint (`/`) automatically redirects to Swagger UI for easier API testing during development.

---

# 🔒 Security Gate Logic

## 1. Geo-Checkin

Silently captures and logs the employee’s baseline coordinates during authentication.

### Endpoint

```http
POST /session/geo-checkin
```

### Purpose

- Prevent coordinate spoofing
- Establish baseline verification location
- Build audit trail history

---

## 2. Verify

Runs the core integrity analysis engine.

### Endpoint

```http
POST /verify
```

### Verification Checks

#### 🌍 Geo Velocity (Haversine)

Calculates travel speed between:

- Last successful verification
- Current verification request

Flags impossible travel events exceeding safe thresholds.

Example:

```text
Abuja → Houston in 86 minutes = Fraud Risk
```

---

#### 🌐 IP Intelligence

Checks:

- Country lock enforcement
- VPN detection
- Proxy anonymization
- Suspicious IP routing

---

#### 📱 Device Binding

Validates the submitted:

```text
device_hash
```

against the registered device fingerprint.

---

## 3. Payout Authorization

### Endpoint

```http
POST /payout
```

Requires a valid:

```text
release_token
```

generated only after successful verification.

This token acts as the secure handshake between:

- Verification success state
- Squad payout execution

---

# 🧠 Fraud Detection Architecture

| Layer                | Function                       |
| -------------------- | ------------------------------ |
| Geo Intelligence     | Detect spoofed coordinates     |
| Velocity Engine      | Detect impossible travel       |
| Device Fingerprint   | Prevent account sharing        |
| VPN Guard            | Block anonymized traffic       |
| Audit Trail          | Log every verification attempt |
| Release Token System | Prevent unauthorized payouts   |

---

# ⚠️ Demo Environment Note

For the hackathon demonstration:

```python
is_within_release_window = True
```

is enabled by default to simplify payout testing and live demonstrations.

In production, this should enforce:

- Expiry windows
- One-time payout authorization
- Replay attack prevention

---

# 📂 Suggested Backend Structure

```text
backend/
├── main.py               # FastAPI entrypoint
├── security.py           # Velocity & fraud logic
├── squad.py              # Squad payout integration
├── models.py             # Pydantic schemas
├── database.py           # Session & audit storage
├── middleware.py         # Security middleware
├── requirements.txt
└── .env
```

---

# 🏆 Purpose

VHM Sentinel transforms payroll systems from:

> Reactive annual audits

into:

> Real-time intelligent verification architecture.

Every payout is backed by:

- Geospatial validation
- Device integrity
- Human liveness
- Cryptographic authorization

---

# 👥 Developed By

**VHM Corp**  
Built for **Squad Hackathon 3.0 (2026)**
