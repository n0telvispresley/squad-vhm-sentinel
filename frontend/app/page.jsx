'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENT_USER } from './lib/data';

const STEPS = { CREDENTIAL: 'credential', OTP: 'otp', ANOMALY_BLOCK: 'anomaly_block' };

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.CREDENTIAL);
  const [ippis, setIppis] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [geoPing, setGeoPing] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const [sessionGeo, setSessionGeo] = useState(null);
  const [anomalyCheck, setAnomalyCheck] = useState({ ip: '105.112.44.22', device: 'Recognised', network: 'Normal' });
  const [showDemoTip, setShowDemoTip] = useState(false);
  const otpRefs = useRef([]);

  // Silent geo-ping fires when OTP screen mounts
  useEffect(() => {
    if (step !== STEPS.OTP) return;

    const pingTimeout = setTimeout(() => {
      if (!navigator.geolocation) {
        setGeoDenied(true);
        logGeoDenial();
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, ts: Date.now() };
          setGeoPing(coords);
          // Store in sessionStorage for downstream use
          sessionStorage.setItem('otp_geo', JSON.stringify(coords));
          // Simulate shadow backend checkin
          console.log('[VHM Sentinel] Silent geo-ping sent:', coords);
        },
        (err) => {
          setGeoDenied(true);
          sessionStorage.setItem('geo_denied', 'true');
          console.log('[VHM Sentinel] Geo denied — logged as soft risk flag');
        },
        { timeout: 8000, maximumAge: 0, enableHighAccuracy: true }
      );
    }, 600); // slight delay after mount so user doesn't see a prompt flash

    return () => clearTimeout(pingTimeout);
  }, [step]);

  // OTP countdown timer
  useEffect(() => {
    if (step !== STEPS.OTP) return;
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatCountdown = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const handleCredentialSubmit = (e) => {
    e.preventDefault();
    if (!ippis || !password) return;
    setLoading(true);

    // Simulate anomaly check
    setTimeout(() => {
      setLoading(false);
      // Demo: any credentials work, anomaly check passes
      setStep(STEPS.OTP);
      setCountdown(300);
      otpRefs.current[0]?.focus();
    }, 1800);
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
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Demo OTP: 123456 or any 6 digits for demo
      if (code === '000000') {
        setOtpError('Invalid OTP. ' + (2) + ' attempts remaining.');
        return;
      }
      // Store geo ping result in session
      if (geoPing) sessionStorage.setItem('otp_geo', JSON.stringify(geoPing));
      sessionStorage.setItem('user_authenticated', 'true');
      router.push('/dashboard');
    }, 1200);
  };

  const logGeoDenial = () => {
    console.log('[VHM Sentinel] Geo denial logged for session risk scoring.');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      {/* Gov header */}
      <div style={{ background: 'var(--navy)' }}>
        <div className="gov-stripe" />
        <div style={{ background: 'var(--navy-dark)', padding: '4px 24px', textAlign: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            FEDERAL REPUBLIC OF NIGERIA — INTEGRATED PAYROLL & PERSONNEL INFORMATION SYSTEM
          </span>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.25)', fontSize: '24px' }}>🦅</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '22px' }}>VHM Sentinel</div>
            <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Payroll Integrity & Verification System</div>
          </div>
        </div>
        <div className="gov-stripe" />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {step === STEPS.CREDENTIAL && (
            <div className="fade-in">
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ background: 'var(--navy)', padding: '20px 24px' }}>
                  <div style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>Secure System Login</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>Authorised personnel only. All access is logged and monitored.</div>
                </div>

                <form onSubmit={handleCredentialSubmit} style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>IPPIS ID / Personnel Number</label>
                    <input
                      type="text"
                      value={ippis}
                      onChange={e => setIppis(e.target.value)}
                      placeholder="e.g. IPPIS-20847-LG"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '14px', fontFamily: 'var(--font-mono)', background: 'var(--slate)', outline: 'none' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '14px', background: 'var(--slate)', outline: 'none' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', background: loading ? '#94a3b8' : 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.02em', transition: 'background 0.2s' }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                        Verifying identity...
                      </span>
                    ) : 'Proceed to OTP Verification'}
                  </button>
                </form>

                <div style={{ padding: '12px 24px 20px', borderTop: '1px solid var(--slate)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.7 }}>
                    🔒 This system uses multi-factor authentication including biometric liveness verification. Unauthorised access attempts are reported to the EFCC and relevant security agencies.
                  </div>
                </div>
              </div>

              {/* Demo tip */}
              <div style={{ marginTop: '16px', padding: '12px 16px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '12px', color: '#1e40af' }}>
                <strong>Demo:</strong> Enter any IPPIS ID and password, then use OTP <code style={{ background: '#dbeafe', padding: '1px 4px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>123456</code> to proceed.
              </div>
            </div>
          )}

          {step === STEPS.OTP && (
            <div className="fade-in">
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ background: 'var(--navy)', padding: '20px 24px' }}>
                  <div style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>OTP Verification</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>A 6-digit code has been sent to {CURRENT_USER.phone}</div>
                </div>

                <div style={{ padding: '24px' }}>
                  {/* Geo status — subtle indicator */}
                  <div style={{ marginBottom: '20px', padding: '10px 14px', background: geoDenied ? '#fff7ed' : '#f0fdf4', border: `1px solid ${geoDenied ? '#fdba74' : '#86efac'}`, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{geoDenied ? '⚠️' : geoPing ? '📍' : '⏳'}</span>
                    <div style={{ fontSize: '11px', color: geoDenied ? '#92400e' : '#166534' }}>
                      {geoDenied
                        ? 'Location services are off. This has been noted on your session.'
                        : geoPing
                          ? `Session location verified (${geoPing.lat.toFixed(4)}°, ${geoPing.lng.toFixed(4)}°)`
                          : 'Establishing secure session location...'
                      }
                    </div>
                  </div>

                  {/* OTP inputs */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        style={{
                          width: '48px', height: '54px',
                          textAlign: 'center', fontSize: '22px',
                          fontFamily: 'var(--font-mono)', fontWeight: 600,
                          border: `2px solid ${digit ? 'var(--navy)' : 'var(--border)'}`,
                          borderRadius: '6px', outline: 'none',
                          background: digit ? '#f8faff' : 'white',
                          transition: 'border-color 0.2s'
                        }}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div style={{ color: 'var(--red)', fontSize: '12px', textAlign: 'center', marginBottom: '14px', padding: '8px', background: 'var(--red-light)', borderRadius: '4px' }}>
                      {otpError}
                    </div>
                  )}

                  <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
                    Code expires in <span style={{ fontFamily: 'var(--font-mono)', color: countdown < 60 ? 'var(--red)' : 'var(--navy)', fontWeight: 600 }}>{formatCountdown(countdown)}</span>
                  </div>

                  <button
                    onClick={handleOtpSubmit}
                    disabled={loading || otp.join('').length < 6}
                    style={{ width: '100%', padding: '12px', background: otp.join('').length === 6 ? 'var(--green)' : '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: otp.join('').length === 6 ? 'pointer' : 'not-allowed' }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Enter System'}
                  </button>
                </div>

                <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--slate)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Didn&apos;t receive code?</span>
                  <button onClick={() => setCountdown(300)} style={{ fontSize: '11px', color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Resend OTP</button>
                </div>
              </div>

              {/* Session intelligence panel */}
              <div style={{ marginTop: '16px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Session Intelligence</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <SessionRow label="IP Address" value={anomalyCheck.ip} status="ok" />
                  <SessionRow label="Device" value={anomalyCheck.device} status="ok" />
                  <SessionRow label="Location" value={geoDenied ? 'Denied — flagged' : geoPing ? 'Captured' : 'Acquiring...'} status={geoDenied ? 'warn' : 'ok'} />
                  <SessionRow label="Network" value={anomalyCheck.network} status="ok" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--navy-dark)', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          Office of the Accountant-General of the Federation | Federal Ministry of Finance | © 2026 Federal Republic of Nigeria
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function SessionRow({ label, value, status }) {
  const color = status === 'ok' ? 'var(--green)' : status === 'warn' ? 'var(--amber)' : 'var(--red)';
  const dot = status === 'ok' ? '●' : '⚠';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color }}>
        <span style={{ fontSize: '8px' }}>{dot}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{value}</span>
      </span>
    </div>
  );
}
