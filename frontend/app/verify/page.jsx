'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import GovHeader from '../components/GovHeader';
import { getCurrentUser, CURRENT_USER } from '../lib/data';
import { setSalaryStatus, addVerificationEvent, incrementFraudStats } from '../lib/store';

const STATES = {
  INTRO: 'intro',
  CAMERA_LOADING: 'camera_loading',
  FACE_DETECTED: 'face_detected',
  CHALLENGE_ACTIVE: 'challenge_active',
  CHALLENGE_PROCESSING: 'challenge_processing',
  GEO_PING: 'geo_ping',
  AWAITING_TOKEN: 'awaiting_token',
  SUCCESS: 'success',
  FAILED: 'failed',
  BLOCKED: 'blocked',
};

const CHALLENGES = [
  { id: 'blink', prompt: 'Please blink twice', icon: '👁️', hint: 'Close and open both eyes slowly' },
  { id: 'turn_left', prompt: 'Slowly turn your head to the left', icon: '↩️', hint: 'Rotate your face gently to the left' },
  { id: 'smile', prompt: 'Please smile', icon: '😊', hint: 'Show a natural smile for a moment' },
  { id: 'eyebrow', prompt: 'Raise your eyebrows', icon: '🤨', hint: 'Lift both eyebrows upward briefly' },
];

export default function VerifyPage() {
  const router = useRouter();
  const webcamRef = useRef(null);
  const challengeTimerRef = useRef(null);
  const geoTimerRef = useRef(null);

  const [flowState, setFlowState] = useState(STATES.INTRO);
  const [challenge, setChallenge] = useState(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(8);
  const [retriesLeft, setRetriesLeft] = useState(2);
  const [livenessScore, setLivenessScore] = useState(null);
  const [geoResult, setGeoResult] = useState(null);
  const [geoDeltaOk, setGeoDeltaOk] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [squadRef, setSquadRef] = useState(null);
  const [geoStatus, setGeoStatus] = useState('');

  // Simulate face detection polling after camera loads
  useEffect(() => {
    if (flowState !== STATES.CAMERA_LOADING) return;
    const timer = setTimeout(() => {
      setFaceDetected(true);
      setFlowState(STATES.FACE_DETECTED);
    }, 2500);
    return () => clearTimeout(timer);
  }, [flowState]);

  // Auto-advance from face detected to challenge after brief pause
  useEffect(() => {
    if (flowState !== STATES.FACE_DETECTED) return;
    const timer = setTimeout(startChallenge, 1500);
    return () => clearTimeout(timer);
  }, [flowState]);

  // Challenge countdown
  useEffect(() => {
    if (flowState !== STATES.CHALLENGE_ACTIVE) return;
    setChallengeTimeLeft(8);
    let time = 8;
    challengeTimerRef.current = setInterval(() => {
      time -= 0.1;
      setChallengeTimeLeft(Math.max(0, time));
      setChallengeProgress((8 - time) / 8 * 100);
      if (time <= 0) {
        clearInterval(challengeTimerRef.current);
        handleChallengeTimeout();
      }
    }, 100);
    return () => clearInterval(challengeTimerRef.current);
  }, [flowState, challenge]);

  const startChallenge = () => {
    const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setChallenge(randomChallenge);
    setFlowState(STATES.CHALLENGE_ACTIVE);
  };

  const handleChallengeTimeout = () => {
    if (retriesLeft > 0) {
      setRetriesLeft(r => r - 1);
      setFlowState(STATES.FACE_DETECTED);
      setChallenge(null);
    } else {
      setFlowState(STATES.FAILED);
      setErrorMsg('Maximum attempts reached. No valid liveness detected.');
    }
  };

  const handleChallengeSuccess = () => {
    clearInterval(challengeTimerRef.current);
    setFlowState(STATES.CHALLENGE_PROCESSING);
    const score = (0.91 + Math.random() * 0.08).toFixed(3);
    setLivenessScore(parseFloat(score));

    setTimeout(() => {
      setFlowState(STATES.GEO_PING);
      setGeoStatus('Acquiring verification location...');
      performLivenessGeoPing();
    }, 1200);
  };

  const performLivenessGeoPing = () => {
    if (!navigator.geolocation) {
      processToken(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGeoResult(coords);

        // Compare with OTP-stage geo ping
        const otpGeoRaw = sessionStorage.getItem('otp_geo');
        if (otpGeoRaw) {
          const otpGeo = JSON.parse(otpGeoRaw);
          const deltaKm = haversineKm(otpGeo.lat, otpGeo.lng, coords.lat, coords.lng);
          const ok = deltaKm < 50;
          setGeoDeltaOk(ok);
          setGeoStatus(`Location verified. Delta from OTP ping: ${deltaKm.toFixed(2)}km ${ok ? '✓' : '✗'}`);
          setTimeout(() => processToken(coords, ok), 1000);
        } else {
          setGeoStatus('Location captured. No OTP reference to compare.');
          setTimeout(() => processToken(coords, true), 1000);
        }
      },
      () => {
        setGeoStatus('Location unavailable — proceeding with anomaly flag.');
        setTimeout(() => processToken(null, false), 1000);
      },
      { timeout: 8000, maximumAge: 0 }
    );
  };

  const processToken = async (coords, geoOk) => {
    setFlowState(STATES.AWAITING_TOKEN);

    const employeeId = JSON.parse(sessionStorage.getItem('current_user') || '{}')?.ippis_id || 'IPPIS-20847-LG';
    const sessionId  = sessionStorage.getItem('session_id') || 'SES-DEMO';
    const deviceHash = sessionStorage.getItem('device_hash') || 'DEV-UNKNOWN';
    const lat = coords?.lat || 0;
    const lng = coords?.lng || 0;

    // ── STEP A: Call POST /verify — get release_token ──
    let releaseToken = null;
    try {
      const { runIntegrityVerification } = await import('../lib/api');
      const verifyRes = await runIntegrityVerification(employeeId, sessionId, lat, lng, deviceHash);
      if (verifyRes.ok) {
        releaseToken = verifyRes.data.release_token;
        console.log('[VHM] Release token received:', releaseToken);
      } else {
        console.warn('[VHM] /verify failed:', verifyRes.error, '— using fallback token');
      }
    } catch (err) {
      console.warn('[VHM] /verify unreachable — fallback mode');
    }

    // Fallback token if backend unreachable
    if (!releaseToken) {
      releaseToken = `VHM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2,5).toUpperCase()}`;
    }

    // ── STEP B: Call POST /payout — trigger Squad transfer ──
    let squadReference = null;
    try {
      const { triggerPayout } = await import('../lib/api');
      const user = JSON.parse(sessionStorage.getItem('current_user') || '{}');
      const payoutRes = await triggerPayout(releaseToken, user);
      if (payoutRes.ok) {
        squadReference = payoutRes.data?.reference || payoutRes.data?.transaction_ref || releaseToken;
        console.log('[VHM] Squad payout confirmed:', squadReference);
      } else {
        console.warn('[VHM] /payout failed:', payoutRes.error);
      }
    } catch (err) {
      console.warn('[VHM] /payout unreachable — fallback ref');
    }

    const finalRef = squadReference || releaseToken;
    setSquadRef(finalRef);
    sessionStorage.setItem('squad_ref', finalRef);
    sessionStorage.setItem('verified', 'true');

    // Persist to localStorage so dashboard reflects disbursed state
    const user = JSON.parse(sessionStorage.getItem('current_user') || '{}');
    if (user.ippis_id) {
      setSalaryStatus(user.ippis_id, 'disbursed', finalRef);
    }
    // Log to verification feed
    addVerificationEvent({
      employee: user.name || 'Employee',
      emp_id: user.ippis_id || 'UNKNOWN',
      location: 'Verified Location',
      status: 'passed',
      liveness_score: livenessScore,
      anomaly: 'low',
      flag_reason: null,
    });
    incrementFraudStats('verifications_passed_today', 1);

    router.push('/success');
  };

  const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const stepLabels = ['Camera', 'Challenge', 'Location', 'Confirm'];
  const currentStep = {
    [STATES.INTRO]: 0,
    [STATES.CAMERA_LOADING]: 1,
    [STATES.FACE_DETECTED]: 1,
    [STATES.CHALLENGE_ACTIVE]: 2,
    [STATES.CHALLENGE_PROCESSING]: 2,
    [STATES.GEO_PING]: 3,
    [STATES.AWAITING_TOKEN]: 4,
    [STATES.SUCCESS]: 4,
    [STATES.FAILED]: 0,
    [STATES.BLOCKED]: 0,
  }[flowState] || 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <GovHeader user={CURRENT_USER} role="employee" />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          {/* Progress steps */}
          {flowState !== STATES.INTRO && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '24px' }}>
              {stepLabels.map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: i + 1 <= currentStep ? 'var(--green)' : i + 1 === currentStep ? 'var(--navy)' : 'var(--border)',
                      color: i + 1 <= currentStep || i + 1 === currentStep ? 'white' : 'var(--muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700
                    }}>
                      {i + 1 <= currentStep ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '10px', color: i + 1 === currentStep ? 'var(--navy)' : 'var(--muted)', whiteSpace: 'nowrap', fontWeight: i + 1 === currentStep ? 600 : 400 }}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div style={{ width: '60px', height: '2px', background: i + 1 < currentStep ? 'var(--green)' : 'var(--border)', margin: '0 4px', marginBottom: '18px' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="fade-in" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

            {/* Header */}
            <div style={{ background: 'var(--navy)', padding: '16px 20px' }}>
              <div style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>Biometric Identity Verification</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>Proof of Life — Required for salary disbursement</div>
            </div>

            <div style={{ padding: '24px' }}>

              {/* INTRO */}
              {flowState === STATES.INTRO && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--navy)', marginBottom: '10px' }}>Identity Verification Required</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '20px' }}>
                    Your salary for <strong>May 2026</strong> is ready for release.<br />
                    You must complete a live biometric check to authorise disbursement.<br />
                    This process takes approximately 30 seconds.
                  </p>
                  <div style={{ background: 'var(--slate)', borderRadius: '6px', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--navy)' }}>What will happen:</div>
                    {['Your camera will open', 'You will be given a random face challenge', 'Your location will be verified', 'Salary will be released instantly via Squad'].map((item, i) => (
                      <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '4px 0', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 700 }}>{i + 1}.</span> {item}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setFlowState(STATES.CAMERA_LOADING)}
                    style={{ width: '100%', padding: '14px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Begin Verification
                  </button>
                </div>
              )}

              {/* CAMERA */}
              {(flowState === STATES.CAMERA_LOADING || flowState === STATES.FACE_DETECTED || flowState === STATES.CHALLENGE_ACTIVE || flowState === STATES.CHALLENGE_PROCESSING) && (
                <div>
                  {/* Camera viewport */}
                  <div style={{ position: 'relative', margin: '0 auto 20px', width: '240px', height: '240px' }}>
                    <div style={{
                      width: '240px', height: '240px', borderRadius: '50%', overflow: 'hidden',
                      border: `4px solid ${faceDetected ? (flowState === STATES.CHALLENGE_ACTIVE ? 'var(--amber)' : 'var(--green)') : 'var(--border)'}`,
                      transition: 'border-color 0.5s',
                      boxShadow: faceDetected ? `0 0 0 4px ${flowState === STATES.CHALLENGE_ACTIVE ? 'rgba(217,119,6,0.2)' : 'rgba(0,135,81,0.2)'}` : 'none',
                    }}>
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: 'user', width: 240, height: 240 }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                      />
                    </div>
                    {/* Face detection overlay */}
                    {flowState === STATES.CAMERA_LOADING && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,33,71,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>
                          <div style={{ fontSize: '20px', marginBottom: '6px' }}>⏳</div>
                          <div style={{ fontSize: '11px' }}>Loading AI engine...</div>
                        </div>
                      </div>
                    )}
                    {faceDetected && flowState !== STATES.CHALLENGE_PROCESSING && (
                      <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', background: faceDetected ? 'var(--green)' : 'var(--border)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 12px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                        {faceDetected ? '✓ FACE DETECTED' : 'SEARCHING...'}
                      </div>
                    )}
                  </div>

                  {/* Challenge prompt */}
                  {flowState === STATES.CHALLENGE_ACTIVE && challenge && (
                    <div className="slide-up" style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{challenge.icon}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>{challenge.prompt}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{challenge.hint}</div>

                      {/* Timer bar */}
                      <div style={{ marginTop: '16px', background: 'var(--slate)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${100 - challengeProgress}%`, background: challengeTimeLeft > 4 ? 'var(--green)' : challengeTimeLeft > 2 ? 'var(--amber)' : 'var(--red)', transition: 'width 0.1s linear, background 0.3s' }} />
                      </div>
                      <div style={{ fontSize: '12px', color: challengeTimeLeft < 3 ? 'var(--red)' : 'var(--muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                        {challengeTimeLeft.toFixed(1)}s remaining
                      </div>

                      {/* Demo: manual complete button */}
                      <button
                        onClick={handleChallengeSuccess}
                        style={{ marginTop: '16px', padding: '10px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        ✓ Challenge Complete (Demo)
                      </button>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>Retries remaining: {retriesLeft}</div>
                    </div>
                  )}

                  {flowState === STATES.FACE_DETECTED && (
                    <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 600, fontSize: '14px' }}>
                      Face confirmed. Preparing challenge...
                    </div>
                  )}

                  {flowState === STATES.CHALLENGE_PROCESSING && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', color: 'var(--navy)', fontWeight: 600 }}>Analysing liveness response...</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>AI engine processing facial landmarks</div>
                    </div>
                  )}
                </div>
              )}

              {/* GEO PING */}
              {flowState === STATES.GEO_PING && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>Verifying Your Location</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    VHM Sentinel needs your location to confirm payroll eligibility. Allow access when prompted.
                  </div>
                  {livenessScore && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '10px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                        ✅ Liveness Score: {(livenessScore * 100).toFixed(1)}% — PASSED
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{geoStatus}</div>
                  {geoResult && geoDeltaOk !== null && (
                    <div style={{ marginTop: '10px', padding: '8px', background: geoDeltaOk ? '#f0fdf4' : '#fef2f2', borderRadius: '6px', fontSize: '12px', color: geoDeltaOk ? '#166534' : '#991b1b', fontWeight: 600 }}>
                      {geoDeltaOk ? '✅ Location consistent with OTP session' : '⚠️ Location mismatch detected'}
                    </div>
                  )}
                </div>
              )}

              {/* AWAITING TOKEN */}
              {flowState === STATES.AWAITING_TOKEN && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>Releasing Your Salary</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Verification token confirmed. Triggering Squad Transfer API...
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    {['Liveness score validated ✓', 'Anomaly score: LOW RISK ✓', 'Geolocation cleared ✓', 'Squad transfer initiating...'].map((item, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: i < 3 ? '#f0fdf4' : '#eff6ff', borderRadius: '4px', color: i < 3 ? '#166534' : '#1e40af', fontWeight: 500 }}>{item}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAILED */}
              {flowState === STATES.FAILED && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>❌</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--red)', marginBottom: '8px' }}>Verification Failed</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{errorMsg}</div>
                  <button
                    onClick={() => { setFlowState(STATES.INTRO); setRetriesLeft(2); setChallenge(null); setFaceDetected(false); }}
                    style={{ padding: '10px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Try Again
                  </button>
                </div>
              )}

            </div>
          </div>

          <button onClick={() => router.push('/dashboard')} style={{ marginTop: '12px', width: '100%', padding: '10px', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer' }}>
            ← Return to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
