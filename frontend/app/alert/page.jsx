'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '../components/GovHeader';
import { SESSION_ANOMALIES, getCurrentUser } from '../lib/data';
import { getAlertActions, setAlertAction, incrementFraudStats } from '../lib/store';

const ADMIN_USER = { name: 'Mrs. R. Okonkwo', ippis_id: 'HR-ADMIN-0041', grade: 'GL-16', ministry: 'OAGF — HR Integrity Unit' };

export default function AlertPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('SA-001');
  const [actions, setActions] = useState({});

  useEffect(() => {
    setActions(getAlertActions());
  }, []);

  const session = SESSION_ANOMALIES.find(s => s.id === selectedId);

  const takeAction = (sessionId, actionLabel, empId) => {
    setAlertAction(sessionId, actionLabel);
    // Update fraud stats when suspending
    if (actionLabel.includes('Suspend')) incrementFraudStats('ghost_profiles_flagged', 0); // already counted
    setActions(getAlertActions());
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <GovHeader user={ADMIN_USER} role="admin" />
      <main style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <button onClick={() => router.push('/admin')} style={{ fontSize: '12px', color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginBottom: '6px', display: 'block' }}>← Back to Admin</button>
            <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>Anomaly Investigation</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {SESSION_ANOMALIES.map(s => (
              <button key={s.id} onClick={() => setSelectedId(s.id)} style={{ padding: '8px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: selectedId === s.id ? 700 : 400, background: selectedId === s.id ? 'var(--navy)' : 'white', color: selectedId === s.id ? 'white' : 'var(--muted)', border: '1px solid var(--border)' }}>
                {s.employee}
              </button>
            ))}
          </div>
        </div>

        {session && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
            {/* LEFT — Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--red)' }}>{session.employee}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{session.emp_id}</div>
                </div>
                <span className="badge-blocked" style={{ fontSize: '11px' }}>SESSION BLOCKED</span>
              </div>

              {/* Timeline */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', padding: '14px 20px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Session Timeline Reconstruction</div>
                <div style={{ padding: '20px' }}>
                  {session.timeline.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: i < session.timeline.length - 1 ? '20px' : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '20px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: t.status === 'flagged' ? 'var(--red)' : 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>{t.status === 'flagged' ? '!' : '✓'}</div>
                        {i < session.timeline.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--slate-dark)', marginTop: '4px', minHeight: '20px' }} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>{t.step}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{t.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '12px', background: t.status === 'flagged' ? '#fef2f2' : 'var(--slate)', padding: '6px 10px', borderRadius: '4px', border: `1px solid ${t.status === 'flagged' ? '#fca5a5' : 'var(--slate-dark)'}`, color: t.status === 'flagged' ? '#991b1b' : 'var(--muted)' }}>{t.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Velocity anomaly */}
              {session.velocity_check && (
                <div style={{ background: 'white', border: '2px solid var(--red)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--red)', padding: '12px 18px', color: 'white', fontSize: '13px', fontWeight: 700 }}>⚠️ Location Velocity Anomaly — CRITICAL</div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #86efac' }}>
                        <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Previous Location</div>
                        <div style={{ fontWeight: 700 }}>{session.velocity_check.prev_location}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{session.velocity_check.prev_time}</div>
                      </div>
                      <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                        <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Current Attempt</div>
                        <div style={{ fontWeight: 700 }}>{session.otp_coords.label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{session.velocity_check.time_elapsed_min} min later</div>
                      </div>
                    </div>
                    <div style={{ padding: '14px', background: '#fef2f2', borderRadius: '6px', border: '1px solid var(--red)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Haversine Distance / Elapsed</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '24px', color: 'var(--red)' }}>{session.velocity_check.distance_km.toLocaleString()}km in {session.velocity_check.time_elapsed_min} min</div>
                      <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px', fontWeight: 600 }}>Physically impossible — confirmed fraud indicator</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coordinate delta */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy-light)', padding: '12px 18px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Coordinate Delta Analysis</div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    {[['Silent OTP Geo-Ping', session.otp_coords], ['Liveness Geo-Ping', session.liveness_coords]].map(([label, coords]) => (
                      <div key={label} style={{ padding: '12px', background: 'var(--slate)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>{coords.lat}°, {Math.abs(coords.lng)}°{coords.lng < 0 ? 'W' : 'E'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{coords.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#166534' }}>
                    <span>OTP → Liveness coordinate delta:</span><span>{session.delta_km}km ✓ Consistent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', padding: '14px 16px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Investigator Actions</div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {actions[selectedId] ? (
                    <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #86efac' }}>
                      <div style={{ fontWeight: 700, color: '#166534', marginBottom: '4px', fontSize: '13px' }}>✓ Action Logged</div>
                      <div style={{ fontSize: '12px', color: '#166534' }}>{actions[selectedId].action}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{new Date(actions[selectedId].timestamp).toLocaleString()}</div>
                    </div>
                  ) : (
                    <>
                      {[
                        { label: '🚫 Suspend Account', bg: 'var(--red)', action: 'Account suspended. Employee notified via SMS. Salary hold activated.' },
                        { label: '📋 Escalate to EFCC/Audit', bg: 'var(--amber)', action: 'Escalated to EFCC. Evidence package generated and queued.' },
                        { label: '✅ Clear Flag (False Positive)', bg: 'var(--green)', action: 'Flag cleared. Reason logged for audit trail.' },
                        { label: '📞 Request In-Person Verification', bg: 'var(--navy)', action: 'Notice sent. Employee required to present at MDG office.' },
                      ].map(({ label, bg, action }) => (
                        <button key={label} onClick={() => takeAction(selectedId, action, session.emp_id)} style={{ padding: '10px 14px', background: bg, color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                          {label}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Evidence summary */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy-light)', padding: '12px 16px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Evidence Summary</div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {session.evidence.map(e => (
                    <div key={e.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '7px 0', borderBottom: '1px solid var(--slate-dark)' }}>
                      <span style={{ color: 'var(--muted)' }}>{e.label}</span>
                      <span style={{ fontWeight: 600, color: e.bad ? 'var(--red)' : 'var(--green)' }}>{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '14px 16px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>⚠️ Compliance Notice</div>
                <div style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.7 }}>Multiple critical fraud indicators. Salary disbursement automatically blocked. All actions are recorded in the immutable audit log.</div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer style={{ background: 'var(--navy-dark)', padding: '12px 24px', textAlign: 'center' }}>
        <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>VHM Sentinel Forensics | All evidence is immutably logged</span>
      </footer>
    </div>
  );
}
