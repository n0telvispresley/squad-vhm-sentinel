'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '../components/GovHeader';
import { SESSION_ANOMALIES } from '../lib/data';

const ADMIN_USER = { name: 'Mrs. R. Okonkwo', ippis_id: 'HR-ADMIN-0041', grade: 'GL-16', ministry: 'OAGF — HR Integrity Unit' };

export default function AlertPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('SA-001');
  const [actionTaken, setActionTaken] = useState(null);

  const session = SESSION_ANOMALIES.find(s => s.id === selectedId);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <GovHeader user={ADMIN_USER} role="admin" />

      <main style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <button onClick={() => router.push('/admin')} style={{ fontSize: '12px', color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginBottom: '6px', display: 'block' }}>← Back to Admin</button>
            <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>Anomaly Investigation</h1>
          </div>
          {/* Select session */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {SESSION_ANOMALIES.map(s => (
              <button key={s.id} onClick={() => { setSelectedId(s.id); setActionTaken(null); }} style={{
                padding: '8px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: selectedId === s.id ? 700 : 400,
                background: selectedId === s.id ? 'var(--navy)' : 'white',
                color: selectedId === s.id ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>
                {s.employee}
              </button>
            ))}
          </div>
        </div>

        {session && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>

            {/* LEFT — Timeline & details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Session header */}
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--red)' }}>{session.employee}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{session.emp_id}</div>
                  </div>
                  <span className="badge-blocked" style={{ fontSize: '11px' }}>SESSION BLOCKED</span>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', padding: '14px 20px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Session Timeline Reconstruction</div>
                <div style={{ padding: '20px' }}>
                  {session.timeline.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: i < session.timeline.length - 1 ? '20px' : '0' }}>
                      {/* Timeline connector */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '20px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: step.status === 'flagged' ? 'var(--red)' : 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: 'white', fontSize: '10px', fontWeight: 700 }}>{step.status === 'flagged' ? '!' : '✓'}</span>
                        </div>
                        {i < session.timeline.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--slate-dark)', marginTop: '4px', minHeight: '20px' }} />}
                      </div>
                      {/* Step content */}
                      <div style={{ paddingBottom: i < session.timeline.length - 1 ? '4px' : '0' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>{step.step}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{step.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: step.status === 'flagged' ? '#991b1b' : 'var(--text-secondary)', background: step.status === 'flagged' ? '#fef2f2' : 'var(--slate)', padding: '6px 10px', borderRadius: '4px', border: `1px solid ${step.status === 'flagged' ? '#fca5a5' : 'var(--slate-dark)'}` }}>
                          {step.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Velocity Check */}
              {session.velocity_check && (
                <div style={{ background: 'white', border: '2px solid var(--red)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--red)', padding: '12px 20px', color: 'white', fontSize: '13px', fontWeight: 700 }}>⚠️ Location Velocity Anomaly — CRITICAL</div>
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #86efac' }}>
                        <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Previous Verified Location</div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{session.velocity_check.prev_location}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{session.velocity_check.prev_time}</div>
                      </div>
                      <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                        <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Current Attempt Location</div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{session.otp_coords.label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>09:38 — {session.velocity_check.time_elapsed_min} min later</div>
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '6px', border: '1px solid var(--red)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Haversine Distance / Time Elapsed</div>
                      <div style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red)' }}>{session.velocity_check.distance_km.toLocaleString()}km in {session.velocity_check.time_elapsed_min} minutes</div>
                      <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px', fontWeight: 600 }}>Physically impossible travel — confirmed fraud indicator</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Geo Coordinate Delta */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy-light)', padding: '12px 20px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Coordinate Delta Analysis</div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ padding: '12px', background: 'var(--slate)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Silent OTP Geo-Ping</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700 }}>{session.otp_coords.lat}°N, {session.otp_coords.lng < 0 ? Math.abs(session.otp_coords.lng) + '°W' : session.otp_coords.lng + '°E'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{session.otp_coords.label}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--slate)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Liveness Geo-Ping</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700 }}>{session.liveness_coords.lat}°N, {session.liveness_coords.lng < 0 ? Math.abs(session.liveness_coords.lng) + '°W' : session.liveness_coords.lng + '°E'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{session.liveness_coords.label}</div>
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#166534' }}>Coordinate delta between OTP and liveness pings:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#166534' }}>{session.delta_km}km ✓ Consistent</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                    Note: Both pings originated from the same location, ruling out mid-session geo-spoofing. The anomaly is the overseas location itself, not a delta mismatch.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Action panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', padding: '14px 16px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Investigator Actions</div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {actionTaken ? (
                    <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #86efac', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: '#166534', marginBottom: '4px' }}>✓ Action Logged</div>
                      <div style={{ fontSize: '13px', color: '#166534' }}>{actionTaken}</div>
                    </div>
                  ) : (
                    <>
                      <ActionButton label="🚫 Suspend Account" color="var(--red)" onClick={() => setActionTaken('Account suspended. Employee notified via SMS.')} />
                      <ActionButton label="📋 Escalate to EFCC/Audit" color="var(--amber)" onClick={() => setActionTaken('Escalated. Evidence package generated and queued for EFCC.')} />
                      <ActionButton label="✅ Clear Flag (False Positive)" color="var(--green)" onClick={() => setActionTaken('Flag cleared. Reason logged for audit trail.')} />
                      <ActionButton label="📞 Request In-Person Verification" color="var(--navy)" onClick={() => setActionTaken('Notice sent. Employee required to present at MDG office.')} />
                    </>
                  )}
                </div>
              </div>

              {/* Evidence summary */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy-light)', padding: '12px 16px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Evidence Summary</div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Liveness Score', value: '0.120 — FAILED', flag: true },
                    { label: 'Anomaly Score', value: 'HIGH RISK (97%)', flag: true },
                    { label: 'Travel Order', value: 'None found', flag: true },
                    { label: 'OTP Geo Origin', value: session.otp_coords.label, flag: true },
                    ...(session.velocity_check ? [{ label: 'Velocity Check', value: 'IMPOSSIBLE (10,812km/86min)', flag: true }] : [{ label: 'Geo Delta', value: `${session.delta_km}km — OK`, flag: false }]),
                    { label: 'Device', value: 'Recognised device', flag: false },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid var(--slate)' }}>
                      <span style={{ color: 'var(--muted)' }}>{item.label}</span>
                      <span style={{ fontWeight: 600, color: item.flag ? 'var(--red)' : 'var(--green)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '14px 16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>⚠️ Compliance Notice</div>
                <div style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.7 }}>
                  This session has multiple critical fraud indicators. Salary disbursement has been automatically blocked. All actions on this page are recorded in the immutable audit log.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ActionButton({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: '10px 14px', background: color, color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
      {label}
    </button>
  );
}
