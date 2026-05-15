// VHM Sentinel — API Client
// All calls to the FastAPI backend at http://127.0.0.1:8000

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Generic fetch wrapper with error handling
async function apiCall(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || `HTTP ${res.status}`);
    return { ok: true, data };
  } catch (err) {
    console.error(`[VHM API] ${endpoint} failed:`, err.message);
    return { ok: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

/**
 * Step 1: Validate IPPIS credentials, trigger OTP send
 * POST /auth/login
 */
export async function loginRequest(ippis_id, password) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ ippis_id, password }),
  });
}

/**
 * Step 2: Verify OTP entered by user
 * POST /auth/verify-otp
 */
export async function verifyOtp(ippis_id, otp_code, session_id) {
  return apiCall('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ ippis_id, otp_code, session_id }),
  });
}

/**
 * Resend OTP to registered number
 * POST /auth/resend-otp
 */
export async function resendOtp(ippis_id, session_id) {
  return apiCall('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ ippis_id, session_id }),
  });
}

// ─────────────────────────────────────────────
// SESSION GEO-CHECKIN (Silent Ping)
// ─────────────────────────────────────────────

/**
 * Silent geo-ping fired when OTP screen mounts
 * POST /session/geo-checkin
 */
export async function geoCheckin(session_id, lat, lng) {
  return apiCall('/session/geo-checkin', {
    method: 'POST',
    body: JSON.stringify({ session_id, lat, lng }),
  });
}

// ─────────────────────────────────────────────
// VERIFICATION GATE
// ─────────────────────────────────────────────

/**
 * Core integrity verification — AI anomaly check + geofencing
 * POST /verify
 * Returns: { release_token, anomaly_score, geo_status, message }
 */
export async function runIntegrityVerification(employee_id, session_id, lat, lng, device_hash) {
  return apiCall('/verify', {
    method: 'POST',
    body: JSON.stringify({ employee_id, session_id, lat, lng, device_hash }),
  });
}

// ─────────────────────────────────────────────
// SQUAD PAYOUT
// ─────────────────────────────────────────────

/**
 * Trigger Squad salary disbursement
 * POST /payout
 */
export async function triggerPayout(token, employee) {
  return apiCall('/payout', {
    method: 'POST',
    body: JSON.stringify({
      token,
      payout_details: {
        amount: employee.salary * 100,        // kobo
        bank_code: employee.bank_code,
        account_number: employee.account_number,
        account_name: employee.name,
        remark: 'VHM Salary Release',
      },
    }),
  });
}

// ─────────────────────────────────────────────
// ADMIN FEED
// ─────────────────────────────────────────────

/**
 * Live audit trail
 * GET /admin/feed
 */
export async function getAdminFeed() {
  return apiCall('/admin/feed');
}

/**
 * Fraud metrics
 * GET /admin/stats
 */
export async function getAdminStats() {
  return apiCall('/admin/stats');
}

// ─────────────────────────────────────────────
// DISPUTES
// ─────────────────────────────────────────────

/**
 * Submit a payroll dispute
 * POST /disputes
 */
export async function submitDisputeApi(employee_id, change_id, reason, notes) {
  return apiCall('/disputes', {
    method: 'POST',
    body: JSON.stringify({ employee_id, change_id, reason, notes }),
  });
}

/**
 * Get disputes for an employee
 * GET /disputes/:employee_id
 */
export async function getDisputes(employee_id) {
  return apiCall(`/disputes/${employee_id}`);
}
