// VHM Sentinel — Master Data Layer
// Single source of truth for both frontend display and backend mapping.
// Real users match the backend user_db in main.py.

// ─────────────────────────────────────────────
// USER DATABASE — 5 real employees + 1 admin
// Mirrors backend user_db; emp_id maps to backend keys
// ─────────────────────────────────────────────
export const USER_DATABASE = [
  {
    id: 'EMP-20847',
    backend_id: 'emp_001',           // maps to backend user_db key
    ippis_id: 'IPPIS-20847-LG',
    password: 'Sentinel@2026',
    name: 'Elvis Ebenuwah',
    grade: 'GL-14', step: 'Step 4',
    ministry: 'Federal Ministry of Finance',
    department: 'Debt Management Office',
    phone: '08139085365',
    phone_display: '0813 908 **65',
    email: 'e.ebenuwah@finance.gov.ng',
    salary: 185000,
    salary_kobo: 18500000,
    bank: 'Zenith Bank', bank_code: '057',
    account_number: '2234567890', account: '****7890',
    bvn: '22345678901',
    device_id: 'DEV-FP-8847A',
    role: 'employee',
    last_lat: 6.5244, last_lng: 3.3792, // Lagos default
  },
  {
    id: 'EMP-33412',
    backend_id: 'emp_003',
    ippis_id: 'IPPIS-33412-AB',
    password: 'Sentinel@2026',
    name: 'Michael Atuorah',
    grade: 'GL-12', step: 'Step 2',
    ministry: 'Federal Ministry of Works',
    department: 'Highways & Infrastructure',
    phone: '09042878714',
    phone_display: '0904 287 **14',
    email: 'm.atuorah@works.gov.ng',
    salary: 198000,
    salary_kobo: 19800000,
    bank: 'Access Bank', bank_code: '044',
    account_number: '0123456789', account: '****6789',
    bvn: '22987654321',
    device_id: 'DEV-FP-2210B',
    role: 'employee',
    last_lat: 9.0579, last_lng: 7.4951, // Abuja
  },
  {
    id: 'EMP-71002',
    backend_id: 'emp_004',
    ippis_id: 'IPPIS-71002-KD',
    password: 'Sentinel@2026',
    name: 'Mohammed Al-Hameen',
    grade: 'GL-10', step: 'Step 3',
    ministry: 'Federal Ministry of Education',
    department: 'Basic & Secondary Education',
    phone: '07069484903',
    phone_display: '0706 948 **03',
    email: 'm.alhameen@education.gov.ng',
    salary: 142000,
    salary_kobo: 14200000,
    bank: 'First Bank', bank_code: '011',
    account_number: '3098765432', account: '****5432',
    bvn: '22112233445',
    device_id: 'DEV-FP-9901C',
    role: 'employee',
    last_lat: 11.1059, last_lng: 7.7247, // Kaduna
  },
  {
    id: 'EMP-88234',
    backend_id: 'emp_005',
    ippis_id: 'IPPIS-88234-KN',
    password: 'Sentinel@2026',
    name: 'Fatima Al-Rashid',
    grade: 'GL-13', step: 'Step 1',
    ministry: 'Federal Ministry of Health',
    department: 'Primary Healthcare',
    phone: '08077223344',
    phone_display: '0807 722 **44',
    email: 'f.alrashid@health.gov.ng',
    salary: 218000,
    salary_kobo: 21800000,
    bank: 'GTBank', bank_code: '058',
    account_number: '0056781234', account: '****1234',
    bvn: '22556677889',
    device_id: 'DEV-FP-4412D',
    role: 'employee',
    last_lat: 12.0022, last_lng: 8.5919, // Kano
  },
  {
    id: 'ADM-0041',
    backend_id: 'emp_admin',
    ippis_id: 'HR-ADMIN-0041',
    password: 'Admin@Sentinel26',
    name: 'Mrs. R. Okonkwo',
    grade: 'GL-16', step: 'Step 2',
    ministry: 'OAGF',
    department: 'HR Integrity Unit',
    phone: '08099887766',
    phone_display: '0809 988 **66',
    email: 'r.okonkwo@oagf.gov.ng',
    salary: 380000,
    salary_kobo: 38000000,
    bank: 'UBA', bank_code: '033',
    account_number: '2087654321', account: '****4321',
    bvn: '22998877665',
    device_id: 'DEV-FP-7700E',
    role: 'admin',
    last_lat: 9.0579, last_lng: 7.4951,
  },
];

// Lookup helpers
export const getUserByIppis = (id) => USER_DATABASE.find(u => u.ippis_id === id) || null;
export const getUserByBackendId = (id) => USER_DATABASE.find(u => u.backend_id === id) || null;
export const validateCredentials = (ippis_id, password) => {
  const u = getUserByIppis(ippis_id);
  return u && u.password === password ? u : null;
};
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return USER_DATABASE[0];
  const s = sessionStorage.getItem('current_user');
  return s ? JSON.parse(s) : USER_DATABASE[0];
};
// Legacy
export const CURRENT_USER = USER_DATABASE[0];

// ─────────────────────────────────────────────
// SALARY CYCLES SEED (per user override via store)
// ─────────────────────────────────────────────
export const SALARY_CYCLES_SEED = [
  { month: 'May 2026', amount: null, status: 'locked', window_start: '2026-05-25', window_end: '2026-05-28', verified_at: null, squad_ref: null },
  { month: 'April 2026', amount: null, status: 'disbursed', window_start: '2026-04-25', window_end: '2026-04-28', verified_at: '2026-04-25T10:22:14Z', squad_ref: 'SQD-APR-928471' },
  { month: 'March 2026', amount: null, status: 'disbursed', window_start: '2026-03-25', window_end: '2026-03-28', verified_at: '2026-03-26T09:11:44Z', squad_ref: 'SQD-MAR-771234' },
];


// Legacy
export const SALARY_CYCLES = SALARY_CYCLES_SEED.map(c => ({ ...c, amount: 185000 }));

// ─────────────────────────────────────────────
// PAYROLL CHANGES SEED DATA
// ─────────────────────────────────────────────
export const PAYROLL_CHANGES_SEED = [
  { id: 'PC-001', emp_id: 'IPPIS-20847-LG', date: '2026-04-01', type: 'Grade Upgrade', old_value: 'GL-13 Step 4 — ₦168,000', new_value: 'GL-14 Step 4 — ₦185,000', officer: 'Mrs. R. Okonkwo', risk: 'low' },
  { id: 'PC-002', emp_id: 'IPPIS-20847-LG', date: '2026-01-15', type: 'Bank Account Update', old_value: 'GTBank ****1122', new_value: 'Zenith Bank ****7890', officer: 'Mr. A. Babatunde', risk: 'medium' },
  { id: 'PC-003', emp_id: 'IPPIS-20847-LG', date: '2025-10-01', type: 'Step Increment', old_value: 'GL-13 Step 3 — ₦162,000', new_value: 'GL-13 Step 4 — ₦168,000', officer: 'Mrs. R. Okonkwo', risk: 'low' },
  { id: 'PC-004', emp_id: 'IPPIS-33412-AB', date: '2026-03-01', type: 'Step Increment', old_value: 'GL-12 Step 1 — ₦190,000', new_value: 'GL-12 Step 2 — ₦198,000', officer: 'System Auto', risk: 'low' },
  { id: 'PC-005', emp_id: 'IPPIS-71002-KD', date: '2026-02-14', type: 'Bank Account Update', old_value: 'Access ****0011', new_value: 'First Bank ****5432', officer: 'Mr. K. Eze', risk: 'medium' },
];
// Legacy alias
export const PAYROLL_CHANGES = PAYROLL_CHANGES_SEED;

// ─────────────────────────────────────────────
// ADMIN SEED DATA
// ─────────────────────────────────────────────
export const ADMIN_STATS = {
  blocked_fraud_ngn: 428750000,
  ghost_profiles_flagged: 247,
  pending_verifications_today: 1842,
  active_travel_orders: 23,
  verifications_passed_today: 6218,
  verifications_failed_today: 134,
};

export const LIVE_FEED_SEED = [
  { id: 'VF-001', employee: 'Michael Atuorah', emp_id: 'IPPIS-33412-AB', location: 'Abuja, FCT', status: 'passed', timestamp: '09:42:18', liveness_score: 0.97, anomaly: 'low', flag_reason: null },
  { id: 'VF-002', employee: 'Ghost Entry 441', emp_id: 'IPPIS-44100-LA', location: 'London, UK', status: 'blocked', timestamp: '09:41:55', liveness_score: 0.12, anomaly: 'high', flag_reason: 'Overseas attempt — no travel order. Geo-spoofing detected.' },
  { id: 'VF-003', employee: 'Elvis Ebenuwah', emp_id: 'IPPIS-20847-LG', location: 'Lagos, LA', status: 'passed', timestamp: '09:41:30', liveness_score: 0.94, anomaly: 'low', flag_reason: null },
  { id: 'VF-004', employee: 'Fatima Al-Rashid', emp_id: 'IPPIS-88234-KN', location: 'Kano, KN', status: 'passed', timestamp: '09:40:59', liveness_score: 0.96, anomaly: 'low', flag_reason: null },
  { id: 'VF-005', employee: 'Unknown Device', emp_id: 'IPPIS-22871-LA', location: 'Lagos, LA', status: 'flagged', timestamp: '09:40:22', liveness_score: null, anomaly: 'high', flag_reason: 'Unrecognised device fingerprint. Previous: DEV-A1293. New: DEV-UNKNOWN.' },
  { id: 'VF-006', employee: 'Mohammed Al-Hameen', emp_id: 'IPPIS-71002-KD', location: 'Kaduna, KD', status: 'passed', timestamp: '09:39:44', liveness_score: 0.93, anomaly: 'low', flag_reason: null },
  { id: 'VF-007', employee: 'Ghost Entry 118', emp_id: 'IPPIS-30981-LA', location: 'Houston, USA', status: 'blocked', timestamp: '09:38:50', liveness_score: 0.08, anomaly: 'high', flag_reason: 'No travel order. Velocity anomaly: Abuja 08:12 → Houston 09:38 (10,812km/86min).' },
];
// Legacy alias
export const LIVE_FEED = LIVE_FEED_SEED;

export const GHOST_QUEUE_SEED = [
  { id: 'GH-001', emp_id: 'IPPIS-44100-LA', name: 'Ghost Entry 441', anomaly_score: 0.97, first_flagged: '2026-05-13', last_attempt: 'London, UK', reason: 'Overseas login, no travel order, failed liveness (score: 0.12)', status: 'under_review' },
  { id: 'GH-002', emp_id: 'IPPIS-30981-LA', name: 'Ghost Entry 118', anomaly_score: 0.99, first_flagged: '2026-05-13', last_attempt: 'Houston, USA', reason: 'Velocity anomaly (10,812km/86min). No travel order. Liveness failed.', status: 'suspended' },
  { id: 'GH-003', emp_id: 'IPPIS-22871-LA', name: 'Unknown Device', anomaly_score: 0.81, first_flagged: '2026-05-13', last_attempt: 'Lagos, LA', reason: 'Unrecognised device fingerprint. OTP to unregistered number.', status: 'under_review' },
  { id: 'GH-004', emp_id: 'IPPIS-91002-OY', name: 'Babatunde Adisa', anomaly_score: 0.72, first_flagged: '2026-05-10', last_attempt: 'Dubai, UAE', reason: 'Duplicate BVN with IPPIS-91003-OY. Salary spike 340% in 1 month.', status: 'escalated' },
  { id: 'GH-005', emp_id: 'IPPIS-67221-KW', name: 'Halima Usman', anomaly_score: 0.68, first_flagged: '2026-05-08', last_attempt: 'Ilorin, KW', reason: 'Geo-mismatch: OTP ping (Abuja) vs liveness (Ilorin) — 306km delta.', status: 'under_review' },
];
export const GHOST_QUEUE = GHOST_QUEUE_SEED;

export const TRAVEL_ORDERS_SEED = [
  { id: 'TO-001', emp_id: 'IPPIS-12004-AB', employee: 'Dr. Chukwuemeka Obi', destination: 'Washington DC, USA', hotel: 'Marriott Georgetown', lat: 38.9072, lng: -77.0369, radius: 800, start: '2026-05-10', end: '2026-05-20', purpose: 'IMF Spring Meetings', approved_by: 'Director Aliyu M.', status: 'active' },
  { id: 'TO-002', emp_id: 'IPPIS-44821-LA', employee: 'Mrs. Adaeze Nwosu', destination: 'London, UK', hotel: 'Hilton Paddington', lat: 51.5161, lng: -0.1779, radius: 500, start: '2026-05-12', end: '2026-05-18', purpose: "Commonwealth Finance Ministers' Meeting", approved_by: 'Director Aliyu M.', status: 'active' },
  { id: 'TO-003', emp_id: 'IPPIS-88912-KN', employee: 'Alhaji Sule Ibrahim', destination: 'Dubai, UAE', hotel: 'Four Points Sheraton DIFC', lat: 25.2048, lng: 55.2708, radius: 600, start: '2026-05-15', end: '2026-05-22', purpose: 'OPEC+ Budget Forum', approved_by: 'DG Okafor C.', status: 'active' },
];
export const TRAVEL_ORDERS = TRAVEL_ORDERS_SEED;

export const PAYROLL_AUDIT_SEED = [
  { id: 'PA-001', employee: 'Oghenekevwe Uti', emp_id: 'IPPIS-55221-DT', change_type: 'Grade Downgrade', old_val: 'GL-14 — ₦247,500', new_val: 'GL-10 — ₦142,000', officer: 'Mr. K. Eze', timestamp: '2026-05-12 14:22', risk: 'high' },
  { id: 'PA-002', employee: 'Olawale Adeyemi', emp_id: 'IPPIS-33412-OS', change_type: 'Bank Account Update', old_val: 'UBA ****9912', new_val: 'Access ****0021', officer: 'Mrs. R. Okonkwo', timestamp: '2026-05-11 10:18', risk: 'medium' },
  { id: 'PA-003', employee: 'Hauwa Musa', emp_id: 'IPPIS-71884-BN', change_type: 'Allowance Addition', old_val: '₦0', new_val: '₦85,000/mo', officer: 'Mr. K. Eze', timestamp: '2026-05-10 16:45', risk: 'high' },
  { id: 'PA-004', employee: 'Temitope Olusanya', emp_id: 'IPPIS-28831-EK', change_type: 'Step Increment', old_val: 'GL-12 Step 2', new_val: 'GL-12 Step 3', timestamp: '2026-05-09 09:00', officer: 'System Auto', risk: 'low' },
  { id: 'PA-005', employee: 'Danjuma Salihu', emp_id: 'IPPIS-90012-SO', change_type: 'Grade Upgrade', old_val: 'GL-09 — ₦98,000', new_val: 'GL-15 — ₦310,000', officer: 'Mr. K. Eze', timestamp: '2026-05-08 11:33', risk: 'high' },
];
export const PAYROLL_AUDIT = PAYROLL_AUDIT_SEED;

export const DEVICES_SEED = [
  { id: 'DEV-001', emp_id: 'IPPIS-20847-LG', fingerprint: 'DEV-FP-8847A', os: 'Android 14 / Chrome 122', first_seen: '2025-10-14', last_seen: '2026-05-12', status: 'primary' },
  { id: 'DEV-002', emp_id: 'IPPIS-33412-AB', fingerprint: 'DEV-FP-2210B', os: 'iPhone iOS 17 / Safari', first_seen: '2025-11-02', last_seen: '2026-05-11', status: 'primary' },
  { id: 'DEV-003', emp_id: 'IPPIS-71002-KD', fingerprint: 'DEV-FP-9901C', os: 'Android 13 / Chrome 120', first_seen: '2026-01-08', last_seen: '2026-05-10', status: 'primary' },
  { id: 'DEV-004', emp_id: 'IPPIS-88234-KN', fingerprint: 'DEV-FP-4412D', os: 'Android 14 / Chrome 123', first_seen: '2025-09-20', last_seen: '2026-05-12', status: 'primary' },
  { id: 'DEV-UNKNOWN', emp_id: 'IPPIS-22871-LA', fingerprint: 'DEV-UNKNOWN', os: 'Windows 11 / Edge 121', first_seen: '2026-05-13', last_seen: '2026-05-13', status: 'unrecognised' },
];
export const DEVICES = DEVICES_SEED;

export const DISPUTES_SEED = [
  { id: 'DS-001', employee_id: 'IPPIS-20847-LG', ref: 'DSP-2026-0041', change_id: 'PC-002', type: 'Bank Account Update', filed: '2026-04-02', status: 'resolved', outcome: 'Change confirmed legitimate. Employee initiated via HR portal.', officer: 'Mrs. R. Okonkwo' },
];
export const DISPUTES = DISPUTES_SEED;

export const SESSION_ANOMALIES = [
  {
    id: 'SA-001', emp_id: 'IPPIS-44100-LA', employee: 'Ghost Entry 441',
    timeline: [
      { step: 'Login Attempt', timestamp: '09:41:22', detail: 'IP: 185.220.101.47 (London, UK)', status: 'flagged' },
      { step: 'OTP Delivered', timestamp: '09:41:23', detail: 'Sent to registered number +234803****114', status: 'ok' },
      { step: 'Silent Geo-Ping (OTP Stage)', timestamp: '09:41:23', detail: 'Coordinates: 51.5074°N, 0.1278°W — London, United Kingdom', status: 'flagged' },
      { step: 'OTP Entered', timestamp: '09:41:55', detail: 'Correct OTP entered. Session proceeded.', status: 'ok' },
      { step: 'Liveness Geo-Ping', timestamp: '09:41:56', detail: 'Coordinates: 51.5079°N, 0.1281°W. Delta from OTP ping: 0.06km ✓', status: 'ok' },
      { step: 'Liveness Challenge', timestamp: '09:42:01', detail: 'Challenge: "Blink twice". Liveness score: 0.12. FAILED — Static image detected.', status: 'flagged' },
      { step: 'Final Decision', timestamp: '09:42:01', detail: 'Session BLOCKED. No travel order found for UK. HR notified.', status: 'flagged' },
    ],
    otp_coords: { lat: 51.5074, lng: -0.1278, label: 'London, UK' },
    liveness_coords: { lat: 51.5079, lng: -0.1281, label: 'London, UK' },
    delta_km: 0.06, velocity_check: null,
    evidence: [
      { label: 'Liveness Score', value: '0.120 — FAILED', bad: true },
      { label: 'Anomaly Score', value: 'HIGH RISK (97%)', bad: true },
      { label: 'Travel Order', value: 'None found', bad: true },
      { label: 'OTP Geo Origin', value: 'London, UK', bad: true },
      { label: 'Geo Delta', value: '0.06km — Consistent', bad: false },
      { label: 'Device', value: 'Recognised', bad: false },
    ],
  },
  {
    id: 'SA-002', emp_id: 'IPPIS-30981-LA', employee: 'Ghost Entry 118',
    timeline: [
      { step: 'Login Attempt', timestamp: '09:38:22', detail: 'IP: 104.28.44.12 (Houston, USA). Previous session: Abuja 08:12.', status: 'flagged' },
      { step: 'Silent Geo-Ping (OTP Stage)', timestamp: '09:38:23', detail: 'Coordinates: 29.7604°N, 95.3698°W — Houston, Texas, USA', status: 'flagged' },
      { step: 'OTP Entered', timestamp: '09:38:50', detail: 'OTP entered. Session proceeded.', status: 'ok' },
      { step: 'Liveness Geo-Ping', timestamp: '09:38:51', detail: 'Coordinates: 29.7609°N, 95.3701°W. Delta: 0.04km ✓', status: 'ok' },
      { step: 'Liveness Challenge', timestamp: '09:38:55', detail: 'Challenge: "Turn head left". Liveness score: 0.08. FAILED.', status: 'flagged' },
      { step: 'Velocity Check', timestamp: '09:38:55', detail: 'Last verified: Abuja 08:12. Current: Houston 09:38. Distance: 10,812km in 86 min. IMPOSSIBLE.', status: 'flagged' },
      { step: 'Final Decision', timestamp: '09:38:55', detail: 'Session BLOCKED. Velocity anomaly confirmed. HR + Compliance notified.', status: 'flagged' },
    ],
    otp_coords: { lat: 29.7604, lng: -95.3698, label: 'Houston, USA' },
    liveness_coords: { lat: 29.7609, lng: -95.3701, label: 'Houston, USA' },
    delta_km: 0.04,
    velocity_check: { prev_location: 'Abuja, FCT', prev_time: '08:12', distance_km: 10812, time_elapsed_min: 86 },
    evidence: [
      { label: 'Liveness Score', value: '0.080 — FAILED', bad: true },
      { label: 'Anomaly Score', value: 'HIGH RISK (99%)', bad: true },
      { label: 'Travel Order', value: 'None found', bad: true },
      { label: 'OTP Geo Origin', value: 'Houston, USA', bad: true },
      { label: 'Velocity Check', value: '10,812km / 86min — IMPOSSIBLE', bad: true },
      { label: 'Device', value: 'Recognised', bad: false },
    ],
  },
];

export const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
