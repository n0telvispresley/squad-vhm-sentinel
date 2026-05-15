// Generates a stable browser/device fingerprint hash
// Used to bind sessions to recognised devices

export function getDeviceHash() {
  const stored = localStorage.getItem('vhm_device_hash');
  if (stored) return stored;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || '',
    navigator.platform || '',
  ].join('|');

  // Simple deterministic hash (djb2)
  let hash = 5381;
  for (let i = 0; i < components.length; i++) {
    hash = ((hash << 5) + hash) + components.charCodeAt(i);
    hash = hash & hash; // convert to 32-bit int
  }
  const fingerprint = 'DEV-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  localStorage.setItem('vhm_device_hash', fingerprint);
  return fingerprint;
}

// Generate a session ID for this login attempt
export function generateSessionId() {
  return 'SES-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}
