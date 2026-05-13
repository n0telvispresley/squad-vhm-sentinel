# VHM Sentinel — Frontend Setup Guide
## Squad Hackathon 3.0

---

## Prerequisites
- Node.js 18+ 
- npm 9+

---

## Installation

```bash
# 1. Clone or extract the project
cd vhm-sentinel

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
vhm-sentinel/
├── app/
│   ├── globals.css          # Design system (VHM colour tokens, IPPIS-style)
│   ├── layout.jsx           # Root layout
│   ├── page.jsx             # VIEW 1: Login + OTP + Silent Geo-Ping
│   ├── dashboard/
│   │   └── page.jsx         # VIEW 2: Employee Dashboard
│   ├── verify/
│   │   └── page.jsx         # VIEW 3: AI Liveness Verification
│   ├── success/
│   │   └── page.jsx         # VIEW 4: Verification Success + Confetti
│   ├── admin/
│   │   └── page.jsx         # VIEW 5: Admin/HR Dashboard (6 tabs)
│   ├── dispute/
│   │   └── page.jsx         # VIEW 6: Employee Dispute Portal
│   ├── alert/
│   │   └── page.jsx         # VIEW 7: Anomaly Investigation Detail
│   ├── components/
│   │   └── GovHeader.jsx    # Shared government nav header
│   └── lib/
│       └── data.js          # All dummy data + utility functions
├── package.json
└── README.md
```

---

## Page Routes

| Route | View | Role |
|---|---|---|
| `/` | Login + OTP + Silent Geo-Ping | All |
| `/dashboard` | Employee Salary Dashboard | Employee |
| `/verify` | Liveness Verification (Camera) | Employee |
| `/success` | Disbursement Success | Employee |
| `/admin` | HR/Admin Control Centre | Admin |
| `/dispute` | Employee Dispute Portal | Employee |
| `/alert` | Anomaly Investigation | Admin |

---

## Active Features

### 1. Silent Geo-Ping (OTP Stage)
- **File:** `app/page.jsx`
- Fires `navigator.geolocation.getCurrentPosition()` silently when OTP screen mounts
- Stores coordinates to `sessionStorage` as `otp_geo`
- Geo denial is logged as a soft risk flag
- No visible prompt — runs in the background

### 2. Device Fingerprint Binding
- **File:** `app/page.jsx`
- Simulated device hash shown in session intelligence panel
- Admin view (`/admin` → Devices tab) shows registered vs. unrecognised devices

### 3. Liveness Location Lock (Feature 4)
- **File:** `app/verify/page.jsx`
- Second geo-ping fires when liveness verification challenge completes
- Delta between OTP-stage ping and liveness ping calculated via Haversine formula
- If delta > 50km: session flagged for geo-mismatch

### 4. Salary Release Window (Feature 5)
- **File:** `app/dashboard/page.jsx`
- Verify button is only active between the 25th–28th of each month
- Live window countdown shown on dashboard

### 5. Anomaly Velocity Check (Feature 7)
- **File:** `app/alert/page.jsx` + `app/lib/data.js`
- Session SA-002 demonstrates velocity anomaly: Abuja → Houston in 86 minutes
- Haversine distance (10,812km) displayed with clear "physically impossible" verdict

---

## Demo Flow

### Employee Flow (Ghost Worker passes)
1. Go to `/` → enter any IPPIS ID + password → click Proceed
2. OTP screen: location ping fires silently → enter `123456`
3. Dashboard: salary shows as LOCKED → click Verify Identity
4. Camera opens → complete the random challenge → click "Challenge Complete (Demo)"
5. Location verified → token issued → redirected to Success screen with confetti
6. Dashboard now shows salary as DISBURSED with Squad reference

### Admin Investigation Flow
1. Go to `/admin` → Overview tab shows live KPIs
2. Live Feed tab → click Investigate on a blocked entry → opens `/alert`
3. Alert page: choose between the two anomaly sessions
   - SA-001: London ghost worker with failed liveness
   - SA-002: Houston velocity anomaly (impossible travel)
4. Take action: Suspend / Escalate / Clear

### Employee Dispute Flow
1. From `/dashboard` → click Dispute on any payroll change row
2. Or navigate to `/dispute` directly
3. Select change, pick reason, submit → get reference number

---

## Connecting Real Backend

Replace dummy data in `app/lib/data.js` with actual API calls:

```js
// Replace static exports with API fetchers
export const fetchCurrentUser = async () => await fetch('/api/user/me').then(r => r.json());
export const fetchSalaryCycles = async (userId) => await fetch(`/api/salary/${userId}`).then(r => r.json());
```

For Squad API integration, the token from `/verify/page.jsx` should hit your Python FastAPI backend which then calls `POST /transfer`.

---

## Environment Variables (for production)

```env
NEXT_PUBLIC_API_URL=https://your-backend.com
NEXT_PUBLIC_SQUAD_ENV=sandbox
```

