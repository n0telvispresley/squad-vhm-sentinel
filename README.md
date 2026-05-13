# 🛡️ VHM Sentinel (VHM Corp)

### _AI-Driven Payroll Integrity & Fraud Prevention Wrapper_

**VHM Sentinel** is a high-integrity payroll security layer built for the Nigerian corporate ecosystem. It acts as an **Intelligent Gatekeeper** between an organization’s human resource records (IPPIS) and financial disbursement via the **Squad API**, ensuring that salaries are only released to verified, physically present, and authenticated employees.

---

## 🌟 The Problem: The $18B Crisis

Traditional payroll systems like IPPIS rely on **episodic audits** (once-a-year checks). This creates massive loopholes for:

- **The "Japa" Ghost:** Employees who have relocated abroad but remain on the payroll.
- **Impossible Travel:** Fraudsters spoofing locations or sharing credentials across borders.
- **Administrative Malice:** Insiders downgrading colleagues' pay grades for personal gain.

---

## 🚀 Key Features

- **Shadow Geo-Capture**: Silently logs location data at the OTP stage to create a baseline before the final verification.
- **Velocity Check (Impossible Travel)**: AI-driven Haversine analysis that flags and blocks payouts if an employee appears to have "teleported" (e.g., Abuja to Houston in 86 minutes).
- **Active Liveness Gate**: A 30-second camera challenge that must be passed to issue a `release_token`.
- **VPN/Proxy Guard**: Integrated IP intelligence to block access from anonymized networks or non-Nigerian regions.
- **Squad-Native Disbursement**: Directly integrated with **Squad Transfer API** for instant, conditional salary release.
- **Transparency & Dispute Portal**: A secure view for employees to audit their own salary modifications and challenge unauthorized changes.

---

## 🛠️ Technical Stack

| Layer            | Technology                                             |
| ---------------- | ------------------------------------------------------ |
| **Frontend**     | Next.js 14, Tailwind CSS, Mediapipe (FaceMesh)         |
| **Backend**      | Python (FastAPI), Scikit-Learn (Anomaly Detection)     |
| **Disbursement** | Squad API (Sandbox)                                    |
| **Security**     | Haversine Formula (Velocity Logic), IP-API (Geo-Intel) |

---

## 📡 API Integration Map

| Endpoint               | Method | Role                                                           |
| ---------------------- | ------ | -------------------------------------------------------------- |
| `/session/geo-checkin` | `POST` | **Baseline**: Captures initial location during OTP entry.      |
| `/verify`              | `POST` | **Audit**: Runs Velocity, Device, and VPN integrity checks.    |
| `/payout`              | `POST` | **Handshake**: Triggers real-world transfer via **Squad API**. |
| `/admin/feed`          | `GET`  | **Transparency**: Populates the HR live audit feed.            |
| `/admin/stats`         | `GET`  | **Metrics**: Displays fraud prevention statistics.             |
| `/dispute`             | `POST` | **Integrity**: Flags unauthorized payroll modifications.       |

---

## 🔒 The VHM Security Workflow (The Gatekeeper)

### 1. Baseline Capture

Location is captured silently at the Login/OTP screen to prevent coordinate spoofing.

### 2. Integrity Audit

During the Liveness challenge, the backend checks:

- Device fingerprint consistency
- VPN/Proxy usage
- Geo-location mismatch
- Travel velocity (> 900km/h triggers fraud detection)

### 3. Release Authorization

Only a successful audit issues a secure:

```text
SQUAD_VHM_RELEASE_TOKEN
```

### 4. Salary Disbursement

The frontend submits the release token to the `/payout` endpoint, triggering the **Squad Transfer API**.

---

## ⚙️ Local Installation & Setup

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/vhm-corp/vhm-sentinel.git

# 2. Navigate into backend
cd backend

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# .env
SQUAD_SECRET_KEY=sandbox_sk_...
SQUAD_MERCHANT_ID=...

# 5. Run development server
uvicorn main:app --reload
```

---

### Frontend Setup

```bash
# 1. Navigate into frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

---

## 📂 Project Structure

```text
vhm-sentinel/
├── backend/                  # FastAPI, AI Anomaly Engine, Squad Logic
│   ├── main.py               # Entry point & API routes
│   ├── security.py           # VPN Detection & Velocity Logic
│   └── services/
│       └── squad.py          # Squad API integration
│
├── frontend/                 # Next.js, Liveness UI, Dashboard
│   ├── app/                  # Login, Verify, Admin, Success pages
│   ├── components/           # UI Components
│   └── lib/                  # API handlers & utilities
│
├── docs/                     # Architecture diagrams & specifications
├── README.md                 # Master project documentation
└── .env.example              # Environment variable template
```

---

## 🧠 Fraud Detection Logic

VHM Sentinel introduces a **behavioral verification layer** into payroll systems.

### Key Detection Signals

| Signal                | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| Geo-Velocity          | Detect impossible movement between login and verification |
| Device Fingerprinting | Prevent credential sharing                                |
| VPN Detection         | Block anonymized or spoofed traffic                       |
| Liveness Verification | Ensure a real human is present                            |
| Payroll Audit Trail   | Detect unauthorized administrative edits                  |

---

## 🏆 Hackathon Impact

By shifting payroll security from **episodic audits** to **real-time architectural enforcement**, VHM Sentinel ensures that every Naira disbursed is backed by cryptographic, biometric, and geospatial proof of life.

A single prevented "impossible travel" payout can save millions in public funds, proving that:

> **Integrity is the best ROI.**

---

## 👥 Developed By

**VHM Corp**  
Built for **Squad Hackathon 3.0 (2026)**

---

## 📜 License

MIT License — For hackathon demonstration and educational purposes.
