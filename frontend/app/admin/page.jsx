'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '../components/GovHeader';
import { ADMIN_STATS, LIVE_FEED, GHOST_QUEUE, TRAVEL_ORDERS, PAYROLL_AUDIT, DEVICES, SESSION_ANOMALIES, formatNaira } from '../lib/data';

const ADMIN_USER = { name: 'Mrs. R. Okonkwo', ippis_id: 'HR-ADMIN-0041', grade: 'GL-16', ministry: 'OAGF — HR Integrity Unit' };

const TABS = ['Overview', 'Live Feed', 'Ghost Queue', 'Travel Orders', 'Payroll Audit', 'Devices'];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [ghostActions, setGhostActions] = useState({});

  const handleGhostAction = (id, action) => {
    setGhostActions(prev => ({ ...prev, [id]: action }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <GovHeader user={ADMIN_USER} role="admin" />

      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>

        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>HR Integrity Dashboard</div>
            <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--navy)', marginTop: '2px' }}>Admin Control Centre</h1>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', background: '#fef3c7', padding: '4px 12px', borderRadius: '4px', border: '1px solid #fcd34d', color: '#92400e' }}>
            🔴 LIVE — May 2026 Salary Release Window
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '2px solid var(--border)', background: 'white', borderRadius: '8px 8px 0 0', overflow: 'hidden', border: '1px solid var(--border)' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '12px 18px', background: activeTab === tab ? 'var(--navy)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400, fontFamily: 'var(--font-body)',
              borderRight: '1px solid var(--border)',
              transition: 'all 0.2s',
            }}>{tab}</button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="fade-in">
            {/* KPI grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Blocked Fraud This Month', value: formatNaira(ADMIN_STATS.blocked_fraud_ngn), color: 'var(--green)', bg: '#f0fdf4', border: '#86efac' },
                { label: 'Ghost Profiles Flagged', value: ADMIN_STATS.ghost_profiles_flagged, color: 'var(--red)', bg: '#fef2f2', border: '#fca5a5' },
                { label: 'Verifications Today', value: ADMIN_STATS.verifications_passed_today.toLocaleString(), color: 'var(--navy)', bg: 'white', border: 'var(--border)' },
                { label: 'Active Travel Orders', value: ADMIN_STATS.active_travel_orders, color: 'var(--amber)', bg: '#fef3c7', border: '#fcd34d' },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: kpi.bg, border: `1px solid ${kpi.border}`, borderRadius: '8px', padding: '16px 18px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '22px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Today's verification breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', padding: '12px 16px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Today&apos;s Verification Summary</div>
                <div style={{ padding: '16px' }}>
                  {[
                    { label: 'Passed', value: ADMIN_STATS.verifications_passed_today, color: 'var(--green)' },
                    { label: 'Failed', value: ADMIN_STATS.verifications_failed_today, color: 'var(--red)' },
                    { label: 'Pending', value: ADMIN_STATS.pending_verifications_today, color: 'var(--amber)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--slate)' }}>
                      <span style={{ fontSize: '13px' }}>{item.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', color: item.color }}>{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '14px', background: 'var(--slate)', borderRadius: '6px', overflow: 'hidden', height: '12px' }}>
                    <div style={{ height: '100%', width: `${(ADMIN_STATS.verifications_passed_today / (ADMIN_STATS.verifications_passed_today + ADMIN_STATS.verifications_failed_today) * 100).toFixed(0)}%`, background: 'var(--green)' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', textAlign: 'right' }}>
                    {(ADMIN_STATS.verifications_passed_today / (ADMIN_STATS.verifications_passed_today + ADMIN_STATS.verifications_failed_today) * 100).toFixed(1)}% pass rate
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', padding: '12px 16px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Recent High-Risk Flags</div>
                <div style={{ padding: '12px' }}>
                  {GHOST_QUEUE.slice(0,3).map(g => (
                    <div key={g.id} style={{ padding: '10px', background: '#fef2f2', borderRadius: '6px', marginBottom: '8px', border: '1px solid #fca5a5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--red)' }}>{g.name}</span>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>Score: {(g.anomaly_score * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{g.last_attempt}</div>
                    </div>
                  ))}
                  <button onClick={() => setActiveTab('Ghost Queue')} style={{ width: '100%', padding: '8px', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', color: 'var(--navy)', cursor: 'pointer', fontWeight: 600, marginTop: '4px' }}>
                    View Full Queue →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE FEED TAB */}
        {activeTab === 'Live Feed' && (
          <div className="fade-in" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--slate)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Showing {LIVE_FEED.length} recent events</span>
              <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#166534', padding: '2px 10px', borderRadius: '4px', border: '1px solid #86efac' }}>🟢 LIVE</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--slate)' }}>
                    {['Time', 'Employee', 'IPPIS ID', 'Location', 'Liveness', 'Anomaly', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LIVE_FEED.map((row, i) => (
                    <>
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--slate)', background: row.status === 'blocked' ? '#fef9f9' : row.status === 'flagged' ? '#fffbf0' : 'white' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{row.timestamp}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{row.employee}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{row.emp_id}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12px' }}>{row.location}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: row.liveness_score > 0.9 ? 'var(--green)' : row.liveness_score ? 'var(--red)' : 'var(--muted)' }}>
                          {row.liveness_score ? `${(row.liveness_score * 100).toFixed(0)}%` : '—'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={row.anomaly === 'high' ? 'badge-blocked' : 'badge-disbursed'} style={{ fontSize: '10px' }}>{row.anomaly.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={row.status === 'passed' ? 'badge-disbursed' : row.status === 'blocked' ? 'badge-blocked' : 'badge-flagged'} style={{ fontSize: '10px' }}>{row.status.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {row.status !== 'passed' && (
                            <button
                              onClick={() => router.push('/alert')}
                              style={{ padding: '4px 10px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Investigate
                            </button>
                          )}
                        </td>
                      </tr>
                      {row.flag_reason && (
                        <tr key={`${row.id}-detail`} style={{ background: '#fef2f2', borderBottom: '1px solid var(--border)' }}>
                          <td colSpan={8} style={{ padding: '6px 14px 10px 14px', fontSize: '11px', color: '#991b1b' }}>
                            ⚠️ {row.flag_reason}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GHOST QUEUE TAB */}
        {activeTab === 'Ghost Queue' && (
          <div className="fade-in" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#fef2f2', borderBottom: '1px solid #fca5a5' }}>
              <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 700 }}>⚠️ {GHOST_QUEUE.length} Accounts Flagged for Review</div>
              <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '2px' }}>These accounts have anomaly scores above the threshold. Review and take action.</div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {GHOST_QUEUE.map(ghost => (
                <div key={ghost.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--slate)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{ghost.name}</span>
                      <span style={{ marginLeft: '10px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{ghost.emp_id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '2px 10px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--red)', fontWeight: 700 }}>
                        Anomaly: {(ghost.anomaly_score * 100).toFixed(0)}%
                      </div>
                      <span className={ghost.status === 'suspended' ? 'badge-blocked' : ghost.status === 'escalated' ? 'badge-flagged' : 'badge-pending'} style={{ fontSize: '10px' }}>
                        {ghost.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      <strong>Flag Reason:</strong> {ghost.reason}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
                      📍 Last Attempt: {ghost.last_attempt} &nbsp;|&nbsp; First Flagged: {ghost.first_flagged}
                    </div>
                    {ghostActions[ghost.id] ? (
                      <div style={{ padding: '8px 12px', background: '#f0fdf4', borderRadius: '4px', fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                        ✓ Action taken: {ghostActions[ghost.id]}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => router.push('/alert')} style={{ padding: '7px 14px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Investigate</button>
                        <button onClick={() => handleGhostAction(ghost.id, 'Account Suspended')} style={{ padding: '7px 14px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Suspend Account</button>
                        <button onClick={() => handleGhostAction(ghost.id, 'Escalated to EFCC')} style={{ padding: '7px 14px', background: 'none', border: '1px solid var(--amber)', color: 'var(--amber)', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Escalate</button>
                        <button onClick={() => handleGhostAction(ghost.id, 'Flag Cleared')} style={{ padding: '7px 14px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Clear Flag</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAVEL ORDERS TAB */}
        {activeTab === 'Travel Orders' && (
          <div className="fade-in" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--slate)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{TRAVEL_ORDERS.length} Active Travel Orders</span>
              <button style={{ padding: '7px 16px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>+ New Travel Order</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {TRAVEL_ORDERS.map(order => (
                <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: '#f0fdf4', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #86efac' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{order.employee}</span>
                      <span style={{ marginLeft: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{order.emp_id}</span>
                    </div>
                    <span style={{ background: '#166534', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '4px' }}>ACTIVE</span>
                  </div>
                  <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                    <div><span style={{ color: 'var(--muted)' }}>Destination:</span> <strong>{order.destination}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Approved Hotel:</span> <strong>{order.hotel}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Geo-Envelope:</span> <strong style={{ fontFamily: 'var(--font-mono)' }}>{order.lat.toFixed(4)}°, {order.lng.toFixed(4)}° ±{order.radius}m</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Date Range:</span> <strong>{order.start} → {order.end}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Purpose:</span> <strong>{order.purpose}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Approved By:</span> <strong>{order.approved_by}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYROLL AUDIT TAB */}
        {activeTab === 'Payroll Audit' && (
          <div className="fade-in" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--slate)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Immutable audit trail of all payroll modifications</span>
              <button style={{ padding: '7px 14px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>⬇ Export PDF</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--slate)' }}>
                    {['Timestamp', 'Employee', 'IPPIS ID', 'Change Type', 'Previous', 'New Value', 'Modified By', 'Risk'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAYROLL_AUDIT.map((row, i) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--slate)', background: row.risk === 'high' ? '#fff9f9' : i % 2 === 0 ? 'white' : 'var(--slate)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{row.employee}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{row.emp_id}</td>
                      <td style={{ padding: '10px 14px' }}>{row.change_type}</td>
                      <td style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--muted)' }}>{row.old_val}</td>
                      <td style={{ padding: '10px 14px', fontSize: '11px' }}>{row.new_val}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12px' }}>{row.officer}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={row.risk === 'high' ? 'badge-blocked' : row.risk === 'medium' ? 'badge-flagged' : 'badge-disbursed'} style={{ fontSize: '10px' }}>{row.risk.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEVICES TAB */}
        {activeTab === 'Devices' && (
          <div className="fade-in" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', padding: '16px' }}>
            <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Registered device fingerprints for all employees. Unrecognised device logins trigger immediate alerts.
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--slate)' }}>
                  {['Employee ID', 'Fingerprint Hash', 'OS / Browser', 'First Seen', 'Last Seen', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEVICES.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--slate)' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{d.emp_id}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--navy)', fontWeight: 600 }}>{d.fingerprint}</td>
                    <td style={{ padding: '10px 14px', fontSize: '12px' }}>{d.os}</td>
                    <td style={{ padding: '10px 14px', fontSize: '12px' }}>{d.first_seen}</td>
                    <td style={{ padding: '10px 14px', fontSize: '12px' }}>{d.last_seen}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="badge-disbursed" style={{ fontSize: '10px' }}>{d.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button style={{ padding: '4px 10px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Revoke</button>
                    </td>
                  </tr>
                ))}
                {/* Show unrecognised alert example */}
                <tr style={{ borderBottom: '1px solid var(--slate)', background: '#fef2f2' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>IPPIS-22871-LA</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)', fontWeight: 600 }}>DEV-UNKNOWN</td>
                  <td style={{ padding: '10px 14px', fontSize: '12px' }}>Windows 11 / Edge 121</td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--red)' }}>2026-05-13</td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--red)' }}>2026-05-13</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="badge-blocked" style={{ fontSize: '10px' }}>UNRECOGNISED</span>
                  </td>
                  <td style={{ padding: '10px 14px', display: 'flex', gap: '6px' }}>
                    <button style={{ padding: '4px 10px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                    <button style={{ padding: '4px 10px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Block</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </main>

      <footer style={{ background: 'var(--navy-dark)', padding: '12px 24px', textAlign: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          VHM Sentinel Admin Portal | All actions are logged and auditable | OAGF HR Integrity Unit
        </div>
      </footer>
    </div>
  );
}
