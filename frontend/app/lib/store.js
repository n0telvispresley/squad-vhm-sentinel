// VHM Sentinel — localStorage State Manager
// All persistent state lives here. Works like a mini local database.

const KEYS = {
  USERS: 'vhm_users',
  SALARY_STATUS: 'vhm_salary_status',      // per-user salary cycle status
  DISPUTES: 'vhm_disputes',                // all submitted disputes
  PAYROLL_CHANGES: 'vhm_payroll_changes',  // payroll modification log
  GHOST_ACTIONS: 'vhm_ghost_actions',      // admin actions on ghost queue
  ALERT_ACTIONS: 'vhm_alert_actions',      // admin actions on anomaly alerts
  DEVICE_REGISTRY: 'vhm_devices',          // registered devices
  TRAVEL_ORDERS: 'vhm_travel_orders',      // active travel orders
  VERIFICATION_FEED: 'vhm_ver_feed',       // live verification events
  FRAUD_STATS: 'vhm_fraud_stats',          // running fraud totals
};

// Safe localStorage read
function lsGet(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

// Safe localStorage write
function lsSet(key, value) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─────────────────────────────────────────────
// SALARY STATUS (per user, persists across sessions)
// ─────────────────────────────────────────────
export function getSalaryStatus(ippis_id) {
  const all = lsGet(KEYS.SALARY_STATUS, {});
  return all[ippis_id] || 'locked';
}

export function setSalaryStatus(ippis_id, status, squadRef = null) {
  const all = lsGet(KEYS.SALARY_STATUS, {});
  all[ippis_id] = status;
  lsSet(KEYS.SALARY_STATUS, all);
  if (squadRef) {
    const refs = lsGet('vhm_squad_refs', {});
    refs[ippis_id] = squadRef;
    lsSet('vhm_squad_refs', refs);
  }
}

export function getSquadRef(ippis_id) {
  const refs = lsGet('vhm_squad_refs', {});
  return refs[ippis_id] || null;
}

// ─────────────────────────────────────────────
// DISPUTES
// ─────────────────────────────────────────────
export function getAllDisputes() {
  return lsGet(KEYS.DISPUTES, []);
}

export function getDisputesByUser(ippis_id) {
  return getAllDisputes().filter(d => d.employee_id === ippis_id);
}

export function addDispute(dispute) {
  const all = getAllDisputes();
  const newDispute = {
    ...dispute,
    id: `DS-${Date.now()}`,
    ref: `DSP-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    filed: new Date().toISOString().split('T')[0],
    status: 'pending',
    outcome: null,
    officer: 'Mrs. R. Okonkwo',
    timestamp: new Date().toISOString(),
  };
  all.unshift(newDispute);
  lsSet(KEYS.DISPUTES, all);
  return newDispute;
}

export function updateDisputeStatus(id, status, outcome = null) {
  const all = getAllDisputes();
  const idx = all.findIndex(d => d.id === id);
  if (idx !== -1) {
    all[idx].status = status;
    if (outcome) all[idx].outcome = outcome;
    lsSet(KEYS.DISPUTES, all);
  }
}

// ─────────────────────────────────────────────
// PAYROLL CHANGES
// ─────────────────────────────────────────────
export function getPayrollChanges(ippis_id = null) {
  const all = lsGet(KEYS.PAYROLL_CHANGES, null);
  if (!all) return null; // null = use seed data
  return ippis_id ? all.filter(c => c.emp_id === ippis_id) : all;
}

export function addPayrollChange(change) {
  const all = lsGet(KEYS.PAYROLL_CHANGES, []);
  all.unshift({ ...change, id: `PA-${Date.now()}`, timestamp: new Date().toISOString() });
  lsSet(KEYS.PAYROLL_CHANGES, all);
}

// ─────────────────────────────────────────────
// GHOST QUEUE ACTIONS
// ─────────────────────────────────────────────
export function getGhostActions() {
  return lsGet(KEYS.GHOST_ACTIONS, {});
}

export function setGhostAction(ghostId, action) {
  const all = getGhostActions();
  all[ghostId] = { action, timestamp: new Date().toISOString() };
  lsSet(KEYS.GHOST_ACTIONS, all);
}

// ─────────────────────────────────────────────
// ALERT ACTIONS
// ─────────────────────────────────────────────
export function getAlertActions() {
  return lsGet(KEYS.ALERT_ACTIONS, {});
}

export function setAlertAction(sessionId, action) {
  const all = getAlertActions();
  all[sessionId] = { action, timestamp: new Date().toISOString(), officer: 'Mrs. R. Okonkwo' };
  lsSet(KEYS.ALERT_ACTIONS, all);
}

// ─────────────────────────────────────────────
// DEVICE REGISTRY
// ─────────────────────────────────────────────
export function getDeviceRegistry() {
  return lsGet(KEYS.DEVICE_REGISTRY, null); // null = use seed data
}

export function registerDevice(ippis_id, fingerprint, os) {
  const all = lsGet(KEYS.DEVICE_REGISTRY, []);
  const exists = all.find(d => d.emp_id === ippis_id && d.fingerprint === fingerprint);
  if (!exists) {
    all.push({ id: `DEV-${Date.now()}`, emp_id: ippis_id, fingerprint, os, first_seen: new Date().toISOString().split('T')[0], last_seen: new Date().toISOString().split('T')[0], status: 'primary' });
    lsSet(KEYS.DEVICE_REGISTRY, all);
  } else {
    exists.last_seen = new Date().toISOString().split('T')[0];
    lsSet(KEYS.DEVICE_REGISTRY, all);
  }
}

export function updateDeviceStatus(id, status) {
  const all = lsGet(KEYS.DEVICE_REGISTRY, []);
  const d = all.find(d => d.id === id);
  if (d) { d.status = status; lsSet(KEYS.DEVICE_REGISTRY, all); }
}

// ─────────────────────────────────────────────
// VERIFICATION FEED
// ─────────────────────────────────────────────
export function getVerificationFeed() {
  return lsGet(KEYS.VERIFICATION_FEED, null); // null = use seed
}

export function addVerificationEvent(event) {
  const all = lsGet(KEYS.VERIFICATION_FEED, []);
  all.unshift({
    ...event,
    id: `VF-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });
  lsSet(KEYS.VERIFICATION_FEED, all.slice(0, 50)); // keep last 50
}

// ─────────────────────────────────────────────
// TRAVEL ORDERS
// ─────────────────────────────────────────────
export function getTravelOrders() {
  return lsGet(KEYS.TRAVEL_ORDERS, null); // null = use seed
}

export function addTravelOrder(order) {
  const all = lsGet(KEYS.TRAVEL_ORDERS, []);
  all.unshift({ ...order, id: `TO-${Date.now()}`, status: 'active' });
  lsSet(KEYS.TRAVEL_ORDERS, all);
}

// ─────────────────────────────────────────────
// FRAUD STATS (running total)
// ─────────────────────────────────────────────
export function getFraudStats() {
  return lsGet(KEYS.FRAUD_STATS, {
    blocked_fraud_ngn: 428750000,
    ghost_profiles_flagged: 247,
    verifications_passed_today: 6218,
    verifications_failed_today: 134,
    pending_verifications_today: 1842,
    active_travel_orders: 23,
  });
}

export function incrementFraudStats(field, amount = 1) {
  const stats = getFraudStats();
  stats[field] = (stats[field] || 0) + amount;
  lsSet(KEYS.FRAUD_STATS, stats);
}

// ─────────────────────────────────────────────
// CLEAR ALL (for dev/testing)
// ─────────────────────────────────────────────
export function clearAllAppState() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  localStorage.removeItem('vhm_squad_refs');
}
