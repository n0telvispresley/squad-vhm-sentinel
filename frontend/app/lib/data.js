// Dummy data for VHM Sentinel — replaces all backend API calls

export const CURRENT_USER = {
  id: 'EMP-20847',
  ippis_id: 'IPPIS-20847-LG',
  name: 'Oluwaseun Adeyemi',
  grade: 'GL-14',
  step: 'Step 4',
  ministry: 'Federal Ministry of Finance',
  department: 'Debt Management Office',
  phone: '08033****721',
  email: 'o.adeyemi@finance.gov.ng',
  salary: 247500,
  bank: 'Zenith Bank',
  account: '****3821',
  device_id: 'DEV-FP-8847A',
  registered_phone: '+2348033000721',
};

export const SALARY_CYCLES = [
  { month: 'May 2026', amount: 247500, status: 'locked', window_start: '2026-05-25', window_end: '2026-05-28', verified_at: null, squad_ref: null },
  { month: 'April 2026', amount: 247500, status: 'disbursed', window_start: '2026-04-25', window_end: '2026-04-28', verified_at: '2026-04-25T10:22:14Z', squad_ref: 'SQD-APR-928471' },
  { month: 'March 2026', amount: 235000, status: 'disbursed', window_start: '2026-03-25', window_end: '2026-03-28', verified_at: '2026-03-26T09:11:44Z', squad_ref: 'SQD-MAR-771234' },
];

export const PAYROLL_CHANGES = [
  { id: 'PC-001', date: '2026-04-01', type: 'Grade Upgrade', old_value: 'GL-13 Step 4 — ₦218,000', new_value: 'GL-14 Step 4 — ₦247,500', officer: 'Mrs. R. Okonkwo', risk: 'low' },
  { id: 'PC-002', date: '2026-01-15', type: 'Bank Account Update', old_value: 'GTBank ****1122', new_value: 'Zenith Bank ****3821', officer: 'Mr. A. Babatunde', risk: 'medium' },
  { id: 'PC-003', date: '2025-10-01', type: 'Step Increment', old_value: 'GL-13 Step 3 — ₦211,000', new_value: 'GL-13 Step 4 — ₦218,000', officer: 'Mrs. R. Okonkwo', risk: 'low' },
];

export const ADMIN_STATS = {
  blocked_fraud_ngn: 428750000,
  ghost_profiles_flagged: 247,
  pending_verifications_today: 1842,
  active_travel_orders: 23,
  verifications_passed_today: 6218,
  verifications_failed_today: 134,
};

export const LIVE_FEED = [
  { id: 'VF-001', employee: 'Amaka Okafor', emp_id: 'IPPIS-33412-AB', location: 'Abuja, FCT', status: 'passed', timestamp: '09:42:18', liveness_score: 0.97, anomaly: 'low' },
  { id: 'VF-002', employee: 'Ghost Entry 441', emp_id: 'IPPIS-44100-LA', location: 'London, UK', status: 'blocked', timestamp: '09:41:55', liveness_score: 0.12, anomaly: 'high', flag_reason: 'Overseas attempt — no travel order. Geo-spoofing detected.' },
  { id: 'VF-003', employee: 'Emeka Chukwu', emp_id: 'IPPIS-19021-EN', location: 'Enugu, EN', status: 'passed', timestamp: '09:41:30', liveness_score: 0.94, anomaly: 'low' },
  { id: 'VF-004', employee: 'Fatima Al-Rashid', emp_id: 'IPPIS-88234-KN', location: 'Kano, KN', status: 'passed', timestamp: '09:40:59', liveness_score: 0.96, anomaly: 'low' },
  { id: 'VF-005', employee: 'Unknown Device', emp_id: 'IPPIS-22871-LA', location: 'Lagos, LA', status: 'flagged', timestamp: '09:40:22', liveness_score: null, anomaly: 'high', flag_reason: 'Unrecognised device fingerprint. Previous device: DEV-A1293. New device: DEV-UNKNOWN.' },
  { id: 'VF-006', employee: 'Ngozi Eze', emp_id: 'IPPIS-55612-IM', location: 'Owerri, IM', status: 'passed', timestamp: '09:39:44', liveness_score: 0.91, anomaly: 'low' },
  { id: 'VF-007', employee: 'Ibrahim Musa', emp_id: 'IPPIS-71002-KD', location: 'Kaduna, KD', status: 'passed', timestamp: '09:39:11', liveness_score: 0.93, anomaly: 'low' },
  { id: 'VF-008', employee: 'Ghost Entry 118', emp_id: 'IPPIS-30981-LA', location: 'Houston, USA', status: 'blocked', timestamp: '09:38:50', liveness_score: 0.08, anomaly: 'high', flag_reason: 'No travel order. Velocity anomaly: Last seen Abuja 08:12, Houston 09:38 (10,812km in 86 min).' },
];

export const GHOST_QUEUE = [
  { id: 'GH-001', emp_id: 'IPPIS-44100-LA', name: 'Ghost Entry 441', anomaly_score: 0.97, first_flagged: '2026-05-13', last_attempt: 'London, UK', reason: 'Overseas login, no travel order, failed liveness (score: 0.12)', status: 'under_review' },
  { id: 'GH-002', emp_id: 'IPPIS-30981-LA', name: 'Ghost Entry 118', anomaly_score: 0.99, first_flagged: '2026-05-13', last_attempt: 'Houston, USA', reason: 'Velocity anomaly (10,812km/86min). No travel order. Liveness failed.', status: 'suspended' },
  { id: 'GH-003', emp_id: 'IPPIS-22871-LA', name: 'Unknown Device', anomaly_score: 0.81, first_flagged: '2026-05-13', last_attempt: 'Lagos, LA', reason: 'Unrecognised device. Device hash mismatch. OTP delivered to unregistered number.', status: 'under_review' },
  { id: 'GH-004', emp_id: 'IPPIS-91002-OY', name: 'Babatunde Adisa', anomaly_score: 0.72, first_flagged: '2026-05-10', last_attempt: 'Dubai, UAE', reason: 'Duplicate BVN detected with IPPIS-91003-OY. Salary spike of 340% in 1 month.', status: 'escalated' },
  { id: 'GH-005', emp_id: 'IPPIS-67221-KW', name: 'Halima Usman', anomaly_score: 0.68, first_flagged: '2026-05-08', last_attempt: 'Ilorin, KW', reason: 'Geo-mismatch between OTP ping (Abuja) and liveness ping (Ilorin) — 306km delta.', status: 'under_review' },
];

export const TRAVEL_ORDERS = [
  { id: 'TO-001', emp_id: 'IPPIS-12004-AB', employee: 'Dr. Chukwuemeka Obi', destination: 'Washington DC, USA', hotel: 'Marriott Georgetown', lat: 38.9072, lng: -77.0369, radius: 800, start: '2026-05-10', end: '2026-05-20', purpose: 'IMF Spring Meetings', approved_by: 'Director Aliyu M.' },
  { id: 'TO-002', emp_id: 'IPPIS-44821-LA', employee: 'Mrs. Adaeze Nwosu', destination: 'London, UK', hotel: 'Hilton Paddington', lat: 51.5161, lng: -0.1779, radius: 500, start: '2026-05-12', end: '2026-05-18', purpose: 'Commonwealth Finance Ministers\' Meeting', approved_by: 'Director Aliyu M.' },
  { id: 'TO-003', emp_id: 'IPPIS-88912-KN', employee: 'Alhaji Sule Ibrahim', destination: 'Dubai, UAE', hotel: 'Four Points Sheraton DIFC', lat: 25.2048, lng: 55.2708, radius: 600, start: '2026-05-15', end: '2026-05-22', purpose: 'OPEC+ Budget Coordination Forum', approved_by: 'DG Okafor C.' },
];

export const PAYROLL_AUDIT = [
  { id: 'PA-001', employee: 'Oghenekevwe Uti', emp_id: 'IPPIS-55221-DT', change_type: 'Grade Downgrade', old_val: 'GL-14 — ₦247,500', new_val: 'GL-10 — ₦142,000', officer: 'Mr. K. Eze', timestamp: '2026-05-12 14:22', risk: 'high' },
  { id: 'PA-002', employee: 'Olawale Adeyemi', emp_id: 'IPPIS-33412-OS', change_type: 'Bank Account Update', old_val: 'UBA ****9912', new_val: 'Access ****0021', officer: 'Mrs. R. Okonkwo', timestamp: '2026-05-11 10:18', risk: 'medium' },
  { id: 'PA-003', employee: 'Hauwa Musa', emp_id: 'IPPIS-71884-BN', change_type: 'Allowance Addition', old_val: '₦0', new_val: '₦85,000/mo', officer: 'Mr. K. Eze', timestamp: '2026-05-10 16:45', risk: 'high' },
  { id: 'PA-004', employee: 'Temitope Olusanya', emp_id: 'IPPIS-28831-EK', change_type: 'Step Increment', old_val: 'GL-12 Step 2', new_val: 'GL-12 Step 3', timestamp: '2026-05-09 09:00', officer: 'System Auto', risk: 'low' },
  { id: 'PA-005', employee: 'Danjuma Salihu', emp_id: 'IPPIS-90012-SO', change_type: 'Grade Upgrade', old_val: 'GL-09 — ₦98,000', new_val: 'GL-15 — ₦310,000', officer: 'Mr. K. Eze', timestamp: '2026-05-08 11:33', risk: 'high' },
];

export const DISPUTES = [
  { id: 'DS-001', ref: 'DSP-2026-0041', change_id: 'PC-002', type: 'Bank Account Update', filed: '2026-04-02', status: 'resolved', outcome: 'Change confirmed legitimate. Employee initiated via HR portal.', officer: 'Mrs. R. Okonkwo' },
];

export const DEVICES = [
  { id: 'DEV-001', emp_id: 'IPPIS-20847-LG', fingerprint: 'DEV-FP-8847A', os: 'Android 14 / Chrome 122', first_seen: '2025-10-14', last_seen: '2026-05-12', status: 'primary' },
];

export const SESSION_ANOMALIES = [
  {
    id: 'SA-001',
    emp_id: 'IPPIS-44100-LA',
    employee: 'Ghost Entry 441',
    timeline: [
      { step: 'Login Attempt', timestamp: '09:41:22', detail: 'IP: 185.220.101.47 (London, UK)', status: 'flagged' },
      { step: 'OTP Delivered', timestamp: '09:41:23', detail: 'Sent to registered number +234803****114', status: 'ok' },
      { step: 'Silent Geo-Ping (OTP Stage)', timestamp: '09:41:23', detail: 'Coordinates: 51.5074°N, 0.1278°W — London, United Kingdom', status: 'flagged' },
      { step: 'OTP Entered', timestamp: '09:41:55', detail: 'Correct OTP entered. Session proceeded.', status: 'ok' },
      { step: 'Liveness Geo-Ping', timestamp: '09:41:56', detail: 'Coordinates: 51.5079°N, 0.1281°W — London, UK. Delta from OTP ping: 0.06km ✓', status: 'ok' },
      { step: 'Liveness Challenge', timestamp: '09:42:01', detail: 'Challenge: "Blink twice". Liveness score: 0.12. FAILED — Static image detected.', status: 'flagged' },
      { step: 'Final Decision', timestamp: '09:42:01', detail: 'Session BLOCKED. No travel order found for UK. HR notified.', status: 'flagged' },
    ],
    otp_coords: { lat: 51.5074, lng: -0.1278, label: 'London, UK' },
    liveness_coords: { lat: 51.5079, lng: -0.1281, label: 'London, UK' },
    delta_km: 0.06,
    velocity_check: null,
  },
  {
    id: 'SA-002',
    emp_id: 'IPPIS-30981-LA',
    employee: 'Ghost Entry 118',
    timeline: [
      { step: 'Login Attempt', timestamp: '09:38:22', detail: 'IP: 104.28.44.12 (Houston, USA). Previous session: Abuja 08:12.', status: 'flagged' },
      { step: 'Silent Geo-Ping (OTP Stage)', timestamp: '09:38:23', detail: 'Coordinates: 29.7604°N, 95.3698°W — Houston, Texas, USA', status: 'flagged' },
      { step: 'OTP Entered', timestamp: '09:38:50', detail: 'OTP entered. Session proceeded.', status: 'ok' },
      { step: 'Liveness Geo-Ping', timestamp: '09:38:51', detail: 'Coordinates: 29.7609°N, 95.3701°W — Houston, USA. Delta: 0.04km ✓', status: 'ok' },
      { step: 'Liveness Challenge', timestamp: '09:38:55', detail: 'Challenge: "Turn head left". Liveness score: 0.08. FAILED.', status: 'flagged' },
      { step: 'Velocity Check', timestamp: '09:38:55', detail: 'Last verified: Abuja 08:12. Current: Houston 09:38. Distance: 10,812km in 86 minutes. IMPOSSIBLE.', status: 'flagged' },
      { step: 'Final Decision', timestamp: '09:38:55', detail: 'Session BLOCKED. Velocity anomaly confirmed. HR + Compliance notified.', status: 'flagged' },
    ],
    otp_coords: { lat: 29.7604, lng: -95.3698, label: 'Houston, USA' },
    liveness_coords: { lat: 29.7609, lng: -95.3701, label: 'Houston, USA' },
    delta_km: 0.04,
    velocity_check: { prev_location: 'Abuja, FCT', prev_time: '08:12', distance_km: 10812, time_elapsed_min: 86 },
  },
];

export const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
