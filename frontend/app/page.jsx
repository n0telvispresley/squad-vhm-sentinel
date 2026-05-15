'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loginRequest, verifyOtp, resendOtp, geoCheckin } from './lib/api';
import { validateCredentials } from './lib/data';
import { getDeviceHash, generateSessionId } from './lib/device';

const STEPS = { CREDENTIAL: 'credential', OTP: 'otp', BLOCKED: 'blocked' };

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.CREDENTIAL);
  const [ippis, setIppis] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [credError, setCredError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [geoPing, setGeoPing] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [deviceHash, setDeviceHash] = useState('');
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => { setDeviceHash(getDeviceHash()); }, []);

  // Silent geo-ping fires when OTP screen mounts
  useEffect(() => {
    if (step !== STEPS.OTP) return;
    const sid = sessionStorage.getItem('session_id');
    const pingDelay = setTimeout(() => {
      if (!navigator.geolocation) { handleGeoDenied(sid); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, ts: Date.now() };
          setGeoPing(coords);
          sessionStorage.setItem('otp_geo', JSON.stringify(coords));
          if (sid) geoCheckin(sid, coords.lat, coords.lng);
        },
        () => handleGeoDenied(sid),
        { timeout: 8000, maximumAge: 0, enableHighAccuracy: true }
      );
    }, 600);
    return () => clearTimeout(pingDelay);
  }, [step]);

  // OTP countdown
  useEffect(() => {
    if (step !== STEPS.OTP) return;
    setCountdown(300);
    timerRef.current = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const handleGeoDenied = (sid) => {
    setGeoDenied(true);
    sessionStorage.setItem('geo_denied', 'true');
    if (sid) geoCheckin(sid, null, null);
  };

  const formatCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setCredError('');
    if (!ippis.trim() || !password.trim()) return;
    setLoading(true);

    // Validate against local user database
    const user = validateCredentials(ippis.trim(), password.trim());
    if (!user) {
      setLoading(false);
      setCredError('Invalid IPPIS ID or password. Please check your credentials.');
      return;
    }

    const sid = generateSessionId();
    setSessionId(sid);
    setCurrentUser(user);
    sessionStorage.setItem('session_id', sid);
    sessionStorage.setItem('current_user', JSON.stringify(user));
    sessionStorage.setItem('device_hash', getDeviceHash());

    // Call backend to trigger OTP SMS send
    const result = await loginRequest(ippis.trim(), password.trim());
    setLoading(false);

    if (!result.ok) {
      // Backend unreachable — proceed with local flow, OTP fallback active
      console.warn('[VHM] Backend unreachable — local OTP fallback active');
    }

    setStep(STEPS.OTP);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpSubmit = async () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Please enter the complete 6-digit code.'); return; }
    if (countdown === 0) { setOtpError('OTP has expired. Please request a new code.'); return; }
    setLoading(true);
    setOtpError('');

    const sid = sessionStorage.getItem('session_id');

    // Try backend verification first
    const result = await verifyOtp(ippis.trim(), code, sid);

    if (result.ok) {
      sessionStorage.setItem('user_authenticated', 'true');
      router.push(currentUser?.role === 'admin' ? '/admin' : '/dashboard');
      return;
    }

    // Fallback: accept 123456 (demo) or last 6 digits of phone
    const phoneOtp = currentUser?.phone?.slice(-6);
    if (code === '123456' || code === phoneOtp) {
      sessionStorage.setItem('user_authenticated', 'true');
      setLoading(false);
      router.push(currentUser?.role === 'admin' ? '/admin' : '/dashboard');
      return;
    }

    setLoading(false);
    const newAttempts = otpAttempts + 1;
    setOtpAttempts(newAttempts);
    if (newAttempts >= 3) {
      setStep(STEPS.BLOCKED);
    } else {
      setOtpError(`Invalid OTP. ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? 's' : ''} remaining.`);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleResendOtp = async () => {
    const sid = sessionStorage.getItem('session_id');
    clearInterval(timerRef.current);
    setCountdown(300);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    timerRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    await resendOtp(ippis.trim(), sid);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const fillCredentials = (id, pw) => { setIppis(id); setPassword(pw); setCredError(''); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--navy)' }}>
        <div className="gov-stripe" />
        <div style={{ background: 'var(--navy-dark)', padding: '4px 24px', textAlign: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            FEDERAL REPUBLIC OF NIGERIA — INTEGRATED PAYROLL & PERSONNEL INFORMATION SYSTEM (IPPIS)
          </span>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,.25)', fontSize: '24px' }}>🦅</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '22px' }}>VHM Sentinel</div>
            <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Payroll Integrity & Verification System</div>
          </div>
        </div>
        <div className="gov-stripe" />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>

          {step === STEPS.CREDENTIAL && (
            <div className="fade-in">
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
                <div style={{ background: 'var(--navy)', padding: '20px 24px' }}>
                  <div style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>Secure System Login</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>Authorised personnel only. All access is logged and monitored.</div>
                </div>
                <form onSubmit={handleCredentialSubmit} style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={S.label}>IPPIS ID / Personnel Number</label>
                    <input type="text" value={ippis} onChange={e => { setIppis(e.target.value); setCredError(''); }} placeholder="e.g. IPPIS-20847-LG" style={{ ...S.input, fontFamily: 'var(--font-mono)' }} required />
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={S.label}>Password</label>
                    <input type="password" value={password} onChange={e => { setPassword(e.target.value); setCredError(''); }} placeholder="••••••••••" style={S.input} required />
                  </div>
                  {credError && <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '12px', color: '#991b1b', marginBottom: '12px' }}>⚠️ {credError}</div>}
                  <button type="submit" disabled={loading} style={{ ...S.btn, marginTop: '10px', background: loading ? '#94a3b8' : 'var(--navy)', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? <><Spinner /> Verifying credentials...</> : 'Proceed to OTP Verification'}
                  </button>
                </form>
                <div style={{ padding: '10px 24px 18px', borderTop: '1px solid var(--slate)', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.8 }}>
                  🔒 Multi-factor authentication active. Unauthorised access is reported to the EFCC.
                </div>
              </div>

              {/* Demo credentials table */}
              <div style={{ marginTop: '16px', background: 'white', border: '1px solid #93c5fd', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#1e40af', padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: 'white' }}>
                  👇 Demo Credentials — Click any row to auto-fill
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#eff6ff' }}>
                        {['IPPIS ID', 'Password', 'Name', 'Role', 'OTP'].map(h => (
                          <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#1e40af', fontWeight: 700, borderBottom: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['IPPIS-20847-LG', 'Sentinel@2026', 'Oluwaseun Adeyemi', 'Employee'],
                        ['IPPIS-33412-AB', 'Sentinel@2026', 'Amaka Okafor', 'Employee'],
                        ['IPPIS-71002-KD', 'Sentinel@2026', 'Ibrahim Musa', 'Employee'],
                        ['IPPIS-88234-KN', 'Sentinel@2026', 'Fatima Al-Rashid', 'Employee'],
                        ['HR-ADMIN-0041', 'Admin@Sentinel26', 'Mrs. R. Okonkwo', 'Admin'],
                      ].map(([id, pw, name, role], i) => (
                        <tr key={i} onClick={() => fillCredentials(id, pw)} style={{ borderBottom: '1px solid #eff6ff', cursor: 'pointer', background: i % 2 === 0 ? 'white' : '#f8fbff' }}>
                          <td style={{ padding: '7px 10px', fontFamily: 'var(--font-mono)', color: '#1e40af', fontWeight: 600 }}>{id}</td>
                          <td style={{ padding: '7px 10px', fontFamily: 'var(--font-mono)' }}>{pw}</td>
                          <td style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>{name}</td>
                          <td style={{ padding: '7px 10px' }}>
                            <span style={{ background: role === 'Admin' ? '#fef3c7' : '#f0fdf4', color: role === 'Admin' ? '#92400e' : '#166534', padding: '1px 8px', borderRadius: '3px', fontSize: '10px', fontWeight: 700 }}>{role}</span>
                          </td>
                          <td style={{ padding: '7px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy)' }}>123456</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '7px 12px', background: '#eff6ff', fontSize: '10px', color: '#1e40af' }}>
                  OTP is sent to the employee&apos;s registered phone. Use <strong>123456</strong> as fallback if SMS is not configured.
                </div>
              </div>
            </div>
          )}

          {step === STEPS.OTP && (
            <div className="fade-in">
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
                <div style={{ background: 'var(--navy)', padding: '20px 24px' }}>
                  <div style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>OTP Verification</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
                    A 6-digit code has been sent to {currentUser?.phone_display}
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '20px', padding: '10px 14px', background: geoDenied ? '#fff7ed' : geoPing ? '#f0fdf4' : '#f8faff', border: `1px solid ${geoDenied ? '#fdba74' : geoPing ? '#86efac' : '#e2e8f0'}`, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{geoDenied ? '⚠️' : geoPing ? '📍' : '⏳'}</span>
                    <div style={{ fontSize: '11px', color: geoDenied ? '#92400e' : geoPing ? '#166534' : 'var(--muted)' }}>
                      {geoDenied ? 'Location services are off. This has been noted on your session.'
                        : geoPing ? `Session location verified — (${geoPing.lat.toFixed(4)}°, ${geoPing.lng.toFixed(4)}°)`
                        : 'Establishing secure session location...'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                    {otp.map((digit, i) => (
                      <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)}
                        style={{ width: '48px', height: '54px', textAlign: 'center', fontSize: '22px', fontFamily: 'var(--font-mono)', fontWeight: 600, border: `2px solid ${digit ? 'var(--navy)' : otpError ? 'var(--red)' : 'var(--border)'}`, borderRadius: '6px', outline: 'none', background: digit ? '#f8faff' : 'white', transition: 'border-color 0.2s' }}
                      />
                    ))}
                  </div>

                  {otpError && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '12px', color: '#991b1b', textAlign: 'center', marginBottom: '14px' }}>⚠️ {otpError}</div>}

                  <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
                    Code expires in <span style={{ fontFamily: 'var(--font-mono)', color: countdown < 60 ? 'var(--red)' : 'var(--navy)', fontWeight: 600 }}>{formatCountdown(countdown)}</span>
                  </div>

                  <button onClick={handleOtpSubmit} disabled={loading || otp.join('').length < 6}
                    style={{ ...S.btn, background: otp.join('').length === 6 ? 'var(--green)' : '#94a3b8', cursor: otp.join('').length === 6 ? 'pointer' : 'not-allowed' }}>
                    {loading ? <><Spinner /> Verifying...</> : 'Verify & Enter System'}
                  </button>
                </div>
                <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--slate)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Didn&apos;t receive code?</span>
                  <button onClick={handleResendOtp} disabled={countdown > 240}
                    style={{ fontSize: '11px', color: countdown > 240 ? 'var(--muted)' : 'var(--navy)', background: 'none', border: 'none', cursor: countdown > 240 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                    {countdown > 240 ? `Resend in ${countdown - 240}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '14px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px' }}>Session Intelligence</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <SRow label="Session ID" value={sessionId.slice(0, 18) + '...'} ok />
                  <SRow label="Device Hash" value={deviceHash} ok />
                  <SRow label="Location" value={geoDenied ? 'Denied — flagged' : geoPing ? `${geoPing.lat.toFixed(4)}°, ${geoPing.lng.toFixed(4)}°` : 'Acquiring...'} ok={!geoDenied} />
                  <SRow label="Network" value="Secure" ok />
                </div>
              </div>
            </div>
          )}

          {step === STEPS.BLOCKED && (
            <div className="fade-in">
              <div style={{ background: 'white', border: '2px solid var(--red)', borderRadius: '8px', textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚫</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--red)', marginBottom: '8px' }}>Account Temporarily Locked</div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '20px' }}>Too many failed OTP attempts. Contact your HR officer or the IPPIS helpdesk to unlock your account.</p>
                <button onClick={() => { setStep(STEPS.CREDENTIAL); setOtp(['','','','','','']); setOtpAttempts(0); setCredError(''); }}
                  style={{ ...S.btn, background: 'var(--navy)', cursor: 'pointer' }}>Return to Login</button>
              </div>
            </div>
          )}

        </div>
      </div>

      <footer style={{ background: 'var(--navy-dark)', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          Office of the Accountant-General of the Federation | Federal Ministry of Finance | © 2026 Federal Republic of Nigeria
        </div>
      </footer>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const S = {
  label: { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '14px', background: 'var(--slate)', outline: 'none', marginBottom: '4px' },
  btn: { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
};

function Spinner() {
  return <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite', flexShrink: 0 }} />;
}
function SRow({ label, value, ok }) {
  const color = ok ? 'var(--green)' : 'var(--amber)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ color, fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{ok ? '● ' : '⚠ '}{value}</span>
    </div>
  );
}
