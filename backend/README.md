# 🛡️ VHM Sentinel — Backend Core

This is the FastAPI backend for the **VHM Sentinel Payroll Integrity System**.

It handles:

- Geo-location anomaly detection
- Velocity & impossible-travel analysis
- Device verification
- Audit trail logging
- Secure Squad API disbursement
- USSD accessibility via Africa's Talking

The backend acts as the **Intelligent Security Layer** between employee verification and salary release.

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

Ensure your virtual environment is active.

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

Run the following command from the root of the project:

```bash
uvicorn backend.main:app --reload
```

---

# 📖 Interactive Documentation

| Documentation | URL                        |
| ------------- | -------------------------- |
| Swagger UI    | http://127.0.0.1:8000/docs |

> The root endpoint (`/`) redirects automatically to Swagger UI for easier development and testing.

---

# 📱 USSD Testing (Africa's Talking)

VHM Sentinel includes a lightweight USSD interface for accessibility on low-bandwidth devices.

## Local Testing Workflow

### 1. Start the Backend

```bash
uvicorn backend.main:app --reload
```

---

### 2. Expose Localhost Using a Tunnel

Example using LocalTunnel:

```bash
lt --port 8000
```

Or using Ngrok:

```bash
ngrok http 8000
```

---

### 3. Configure Africa's Talking Callback URL

Set your callback URL to:

```text
{tunnel_url}/ussd
```

Example:

```text
https://example.loca.lt/ussd
```

---

## 🔐 USSD Security Lock

USSD payout access is restricted.

A user must complete a successful:

```http
POST /verify
```

session within the last **24 hours** before USSD payout requests are allowed.

This prevents unauthorized offline payout attempts.

---

# 🔒 Security Gate Logic

## 1. Verify (`/verify`)

Runs the core integrity verification engine.

### Checks Performed

#### 🌍 Geo Velocity (Haversine)

Calculates travel speed between:

- Last known location
- Current verification request

Flags impossible travel scenarios.

Example:

```text
Lagos → London in 45 minutes = Fraud Risk
```

---

#### 🌐 IP Intelligence

Checks for:

- Country lock violations
- VPN usage
- Proxy anonymization
- Suspicious IP routing

---

#### 📱 Device Binding

Validates the submitted:

```text
device_hash
```

against the employee’s registered device fingerprint.

---

## 2. Payout (`/payout`)

Requires a valid:

```text
release_token
```

generated only after a successful `/verify` session.

This creates a secure handshake between:

- Identity verification
- Financial disbursement

---

## 3. Dispute Portal (`/dispute`)

Allows employees to report suspicious or unauthorized payroll changes.

### Endpoint

```http
POST /dispute
```

Submitted disputes are visible to administrators at:

```http
GET /admin/disputes
```

---

# 🧪 Demo Data

## ✅ Standard User

| Field       | Value            |
| ----------- | ---------------- |
| Employee ID | `emp_001`        |
| Phone       | `+2348012345678` |

---

## 🚨 Fraud Scenario

| Field           | Value                     |
| --------------- | ------------------------- |
| Employee ID     | `emp_002`                 |
| Scenario        | Last seen in London       |
| Expected Result | Velocity breach triggered |

---

# 🧠 Fraud Detection Architecture

| Layer                | Function                       |
| -------------------- | ------------------------------ |
| Geo Intelligence     | Detect spoofed coordinates     |
| Velocity Engine      | Detect impossible travel       |
| Device Fingerprint   | Prevent credential sharing     |
| VPN Guard            | Block anonymized traffic       |
| Audit Trail          | Log verification activity      |
| USSD Session Lock    | Prevent offline fraud attempts |
| Release Token System | Prevent unauthorized payouts   |

---

# 📂 Backend Structure

```text
backend/
├── main.py                 # FastAPI entrypoint
├── security_service.py             # Velocity & fraud logic
├── squad_integration.py                # Squad payout integration
├── .env
├── requirements.txt
├── README.md

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
- Human verification
- Cryptographic authorization

---

# 👥 Developed By

**VHM Corp**  
Built for **Squad Hackathon 3.0 (2026)**
