'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '../components/GovHeader';
import { CURRENT_USER, SALARY_CYCLES, PAYROLL_CHANGES, formatNaira } from '../lib/data';

export default function DashboardPage() {
  const router = useRouter();
  const [geoPing, setGeoPing] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('Recognised');
  const [networkStatus, setNetworkStatus] = useState('Normal');
  const today = new Date();
  const currentCycle = SALARY_CYCLES[0];
  const isInWindow = today.getDate() >= 25 && today.getDate() <= 28;
  const daysToWindow = Math.max(0, 25 - today.getDate());

  useEffect(() => {
    const stored = sessionStorage.getItem('otp_geo');
    if (stored) setGeoPing(JSON.parse(stored));
  }, []);

  const statusConfig = {
    locked: { label: '🔒 LOCKED', class: 'badge-locked', desc: 'Awaiting identity verification' },
    pending: { label: '⏳ PENDING', class: 'badge-pending', desc: 'Transfer in progress' },
    disbursed: { label: '✅ DISBURSED', class: 'badge-disbursed', desc: 'Salary released via Squad' },
    blocked: { label: '🚫 BLOCKED', class: 'badge-blocked', desc: 'Contact HR immediately' },
  };

  const status = statusConfig[currentCycle.status];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <GovHeader user={CURRENT_USER} role="employee" />

      <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>IPPIS Employee Portal</div>
          <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--navy)', marginTop: '2px' }}>My Payroll Dashboard</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Salary Status Card */}
            <div className="fade-in" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ background: 'var(--navy)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>Salary Status</div>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8', fontSize: '12px' }}>{currentCycle.month}</span>
              </div>
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Net Monthly Salary</div>
                    <div style={{ fontSize: '32px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy)' }}>{formatNaira(currentCycle.amount)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{CURRENT_USER.grade} • {CURRENT_USER.step} • {CURRENT_USER.ministry}</div>
                  </div>
                  <div>
                    <span className={status.class} style={{ fontSize: '12px', padding: '4px 12px' }}>{status.label}</span>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textAlign: 'right' }}>{status.desc}</div>
                  </div>
                </div>

                {/* Release Window */}
                <div style={{ background: 'var(--slate)', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', border: '1px solid var(--slate-dark)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Window</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--navy)', fontWeight: 600 }}>25th – 28th {currentCycle.month}</span>
                    {isInWindow
                      ? <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>✓ WINDOW OPEN</span>
                      : <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Opens in {daysToWindow} day{daysToWindow !== 1 ? 's' : ''}</span>
                    }
                  </div>
                </div>

                {/* CTA Button */}
                {currentCycle.status === 'locked' ? (
                  <button
                    onClick={() => router.push('/verify')}
                    className="pulse-green"
                    style={{ width: '100%', padding: '14px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em' }}
                  >
                    🔐 Verify Identity to Release Funds
                  </button>
                ) : currentCycle.status === 'disbursed' ? (
                  <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #86efac', textAlign: 'center' }}>
                    <div style={{ color: '#166534', fontWeight: 600, fontSize: '14px' }}>✅ Salary Disbursed via Squad</div>
                    <div style={{ color: '#166534', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>Ref: {currentCycle.squad_ref}</div>
                  </div>
                ) : (
                  <button disabled style={{ width: '100%', padding: '14px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 700, cursor: 'not-allowed' }}>
                    Verification Not Available
                  </button>
                )}
              </div>
            </div>

            {/* Pay Grade Transparency */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--navy)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>Pay Grade & Modification History</div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Last 3 changes shown</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--slate)' }}>
                      {['Date', 'Type', 'Previous Value', 'New Value', 'Officer', 'Risk', 'Action'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PAYROLL_CHANGES.map((ch, i) => (
                      <tr key={ch.id} style={{ borderBottom: '1px solid var(--slate)', background: i % 2 === 0 ? 'white' : 'var(--slate)' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{ch.date}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{ch.type}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--muted)', fontSize: '12px' }}>{ch.old_value}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12px' }}>{ch.new_value}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}>{ch.officer}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={ch.risk === 'high' ? 'badge-blocked' : ch.risk === 'medium' ? 'badge-flagged' : 'badge-disbursed'} style={{ fontSize: '10px' }}>
                            {ch.risk.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <button
                            onClick={() => router.push('/dispute')}
                            style={{ padding: '4px 10px', background: 'none', border: '1px solid var(--navy)', color: 'var(--navy)', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Dispute
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Salary History */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--navy)', padding: '14px 20px' }}>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>Salary Payment History</div>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SALARY_CYCLES.map(cycle => (
                  <div key={cycle.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--slate)', borderRadius: '6px', border: '1px solid var(--slate-dark)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{cycle.month}</div>
                      {cycle.squad_ref && <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{cycle.squad_ref}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px' }}>{formatNaira(cycle.amount)}</span>
                      <span className={`badge-${cycle.status}`} style={{ fontSize: '10px' }}>{cycle.status.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Employee Profile Card */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--navy)', padding: '14px 20px' }}>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>Employee Profile</div>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '64px', height: '64px', background: 'var(--navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '22px', marginBottom: '10px' }}>
                    {CURRENT_USER.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px', textAlign: 'center' }}>{CURRENT_USER.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>{CURRENT_USER.department}</div>
                </div>
                {[
                  ['IPPIS ID', CURRENT_USER.ippis_id],
                  ['Grade / Step', `${CURRENT_USER.grade} / ${CURRENT_USER.step}`],
                  ['Ministry', CURRENT_USER.ministry],
                  ['Bank', CURRENT_USER.bank],
                  ['Account', CURRENT_USER.account],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--slate)', fontSize: '12px' }}>
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '11px' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Trust Indicator */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--navy-light)', padding: '12px 16px' }}>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Session Trust Status</div>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <TrustRow icon="📍" label="Location" value={geoPing ? `${geoPing.lat.toFixed(3)}°, ${geoPing.lng.toFixed(3)}°` : 'Not captured'} status={geoPing ? 'ok' : 'warn'} />
                <TrustRow icon="📱" label="Device" value={deviceStatus} status="ok" />
                <TrustRow icon="🌐" label="Network" value={networkStatus} status="ok" />
                <TrustRow icon="🔐" label="Auth Factor" value="OTP ✓ Password ✓" status="ok" />
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--navy-light)', padding: '12px 16px' }}>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Quick Actions</div>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ActionBtn label="📋 Submit a Dispute" onClick={() => router.push('/dispute')} />
                <ActionBtn label="🔐 Start Verification" onClick={() => router.push('/verify')} primary />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ background: 'var(--navy-dark)', padding: '12px 24px', textAlign: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          Powered by VHM Sentinel v2.0 | Squad Payment Infrastructure | All transactions are encrypted and monitored
        </div>
      </footer>
    </div>
  );
}

function TrustRow({ icon, label, value, status }) {
  const colors = { ok: '#166534', warn: '#92400e', bad: '#991b1b' };
  const bgs = { ok: '#f0fdf4', warn: '#fef3c7', bad: '#fef2f2' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: bgs[status], borderRadius: '6px' }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', color: colors[status], fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '11px', color: colors[status], fontFamily: 'var(--font-mono)', marginTop: '1px' }}>{value}</div>
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick, primary }) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: '10px', background: primary ? 'var(--navy)' : 'var(--slate)', color: primary ? 'white' : 'var(--text-primary)', border: `1px solid ${primary ? 'var(--navy)' : 'var(--border)'}`, borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
      {label}
    </button>
  );
}
