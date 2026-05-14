'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '../components/GovHeader';
import {
  ADMIN_STATS, LIVE_FEED_SEED, GHOST_QUEUE_SEED, TRAVEL_ORDERS_SEED,
  PAYROLL_AUDIT_SEED, DEVICES_SEED, formatNaira, getCurrentUser
} from '../lib/data';
import {
  getFraudStats, incrementFraudStats,
  getGhostActions, setGhostAction,
  getVerificationFeed, addVerificationEvent,
  getTravelOrders, addTravelOrder,
  getDeviceRegistry, updateDeviceStatus, registerDevice,
} from '../lib/store';
import { getAdminFeed, getAdminStats } from '../lib/api';

const ADMIN_USER = { name: 'Mrs. R. Okonkwo', ippis_id: 'HR-ADMIN-0041', grade: 'GL-16', ministry: 'OAGF — HR Integrity Unit' };
const TABS = ['Overview', 'Live Feed', 'Ghost Queue', 'Travel Orders', 'Payroll Audit', 'Devices'];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [backendStatus, setBackendStatus] = useState('connecting');

  // All state from localStorage + backend
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState(null);
  const [ghostActions, setGhostActionsState] = useState({});
  const [travelOrders, setTravelOrders] = useState(null);
  const [devices, setDevices] = useState(null);
  const [deviceActioned, setDeviceActioned] = useState({});

  // New travel order form
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [travelForm, setTravelForm] = useState({ employee: '', emp_id: '', destination: '', hotel: '', lat: '', lng: '', radius: 500, start: '', end: '', purpose: '', approved_by: 'Director Aliyu M.' });
  const [travelSaved, setTravelSaved] = useState(false);

  useEffect(() => {
    loadAllState();
    const interval = setInterval(loadAllState, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllState = async () => {
    // Load from localStorage first (instant)
    setStats(getFraudStats());
    setGhostActionsState(getGhostActions());

    const storedFeed = getVerificationFeed();
    setFeed(storedFeed || LIVE_FEED_SEED);

    const storedOrders = getTravelOrders();
    setTravelOrders(storedOrders || TRAVEL_ORDERS_SEED);

    const storedDevices = getDeviceRegistry();
    setDevices(storedDevices || DEVICES_SEED);

    // Try backend
    const [statsRes, feedRes] = await Promise.all([getAdminStats(), getAdminFeed()]);
    if (statsRes.ok) {
      setStats(statsRes.data);
      setBackendStatus('live');
    } else {
      setBackendStatus('offline');
    }
    if (feedRes.ok && feedRes.data?.length) {
      setFeed(feedRes.data);
    }
  };

  const handleGhostAction = (id, action, salary = 0) => {
    setGhostAction(id, action);
    if (action.includes('Suspend')) incrementFraudStats('blocked_fraud_ngn', salary);
    setGhostActionsState(getGhostActions());
    setStats(getFraudStats());
  };

  const handleDeviceAction = (deviceId, action) => {
    updateDeviceStatus(deviceId, action === 'approve' ? 'primary' : 'blocked');
    const updated = getDeviceRegistry() || DEVICES_SEED;
    setDevices(updated);
    setDeviceActioned(prev => ({ ...prev, [deviceId]: action }));
  };

  const handleAddTravelOrder = (e) => {
    e.preventDefault();
    const order = {
      ...travelForm,
      lat: parseFloat(travelForm.lat) || 0,
      lng: parseFloat(travelForm.lng) || 0,
      radius: parseInt(travelForm.radius) || 500,
      status: 'active',
    };
    addTravelOrder(order);
    incrementFraudStats('active_travel_orders', 1);
    setTravelOrders(getTravelOrders());
    setStats(getFraudStats());
    setTravelSaved(true);
    setTravelForm({ employee: '', emp_id: '', destination: '', hotel: '', lat: '', lng: '', radius: 500, start: '', end: '', purpose: '', approved_by: 'Director Aliyu M.' });
    setTimeout(() => { setTravelSaved(false); setShowTravelForm(false); }, 2000);
  };

  const currentStats = stats || ADMIN_STATS;
  const currentFeed = feed || LIVE_FEED_SEED;
  const currentOrders = travelOrders || TRAVEL_ORDERS_SEED;
  const currentDevices = devices || DEVICES_SEED;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <GovHeader user={ADMIN_USER} role="admin" />

      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--font-mono)' }}>HR Integrity Dashboard</div>
            <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--navy)', marginTop: '2px' }}>Admin Control Centre</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: 600, background: backendStatus === 'live' ? '#f0fdf4' : backendStatus === 'offline' ? '#fef2f2' : '#fef3c7', color: backendStatus === 'live' ? '#166534' : backendStatus === 'offline' ? '#991b1b' : '#92400e', border: `1px solid ${backendStatus === 'live' ? '#86efac' : backendStatus === 'offline' ? '#fca5a5' : '#fcd34d'}` }}>
              {backendStatus === 'live' ? '🟢 Backend Live' : backendStatus === 'offline' ? '🔴 Offline — Local Data' : '🟡 Connecting...'}
            </span>
            <span style={{ fontSize: '11px', color: '#92400e', background: '#fef3c7', padding: '4px 12px', borderRadius: '4px', border: '1px solid #fcd34d', fontWeight: 600 }}>
              🔴 LIVE — May 2026 Release Window
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border)', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 16px', background: activeTab === tab ? 'var(--navy)' : 'transparent', color: activeTab === tab ? 'white' : 'var(--muted)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400, fontFamily: 'var(--font-body)', borderRight: '1px solid var(--border)', transition: 'all .2s' }}>{tab}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '20px' }} className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Blocked Fraud This Month', value: formatNaira(currentStats.blocked_fraud_ngn), color: 'var(--green)', bg: '#f0fdf4', border: '#86efac' },
                { label: 'Ghost Profiles Flagged', value: (currentStats.ghost_profiles_flagged || 0).toLocaleString(), color: 'var(--red)', bg: '#fef2f2', border: '#fca5a5' },
                { label: 'Verifications Today', value: (currentStats.verifications_passed_today || 0).toLocaleString(), color: 'var(--navy)', bg: 'white', border: 'var(--border)' },
                { label: 'Active Travel Orders', value: currentStats.active_travel_orders || 0, color: 'var(--amber)', bg: '#fef3c7', border: '#fcd34d' },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: kpi.bg, border: `1px solid ${kpi.border}`, borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '22px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'var(--slate)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', padding: '12px 16px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Today's Verification Summary</div>
                <div style={{ padding: '16px' }}>
                  {[
                    { label: 'Passed', value: currentStats.verifications_passed_today || 0, color: 'var(--green)' },
                    { label: 'Failed', value: currentStats.verifications_failed_today || 0, color: 'var(--red)' },
                    { label: 'Pending', value: currentStats.pending_verifications_today || 0, color: 'var(--amber)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--slate-dark)' }}>
                      <span style={{ fontSize: '13px' }}>{item.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', color: item.color }}>{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {(() => {
                    const pass = currentStats.verifications_passed_today || 1;
                    const fail = currentStats.verifications_failed_today || 0;
                    const rate = (pass / (pass + fail) * 100).toFixed(1);
                    return (<>
                      <div style={{ marginTop: '14px', background: 'var(--slate-dark)', borderRadius: '6px', overflow: 'hidden', height: '10px' }}>
                        <div style={{ height: '100%', width: `${rate}%`, background: 'var(--green)', transition: 'width .5s' }} />
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', textAlign: 'right' }}>{rate}% pass rate</div>
                    </>);
                  })()}
                </div>
              </div>
              <div style={{ background: 'var(--slate)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', padding: '12px 16px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Recent High-Risk Flags</div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {GHOST_QUEUE_SEED.slice(0, 3).map(g => (
                    <div key={g.id} style={{ padding: '10px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--red)' }}>{g.name}</span>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>Score: {Math.round(g.anomaly_score * 100)}%</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{g.last_attempt}</div>
                    </div>
                  ))}
                  <button onClick={() => setActiveTab('Ghost Queue')} style={{ padding: '8px', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', color: 'var(--navy)', cursor: 'pointer', fontWeight: 600 }}>View Full Queue →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE FEED TAB ── */}
        {activeTab === 'Live Feed' && (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }} className="fade-in">
            <div style={{ padding: '12px 16px', background: 'var(--slate)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{currentFeed.length} events — auto-refreshes every 30s</span>
              <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#166534', padding: '2px 10px', borderRadius: '4px', border: '1px solid #86efac' }}>🟢 LIVE</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--slate)' }}>
                    {['Time', 'Employee', 'IPPIS ID', 'Location', 'Liveness', 'Anomaly', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentFeed.map((row, i) => (
                    <>
                      <tr key={row.id || i} style={{ borderBottom: '1px solid var(--slate)', background: row.status === 'blocked' ? '#fff8f8' : row.status === 'flagged' ? '#fffbf0' : 'white' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: '12px' }}>{row.employee || row.employee_name}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{row.emp_id || row.employee_id}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12px' }}>{row.location}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: row.liveness_score > 0.9 ? 'var(--green)' : row.liveness_score ? 'var(--red)' : 'var(--muted)' }}>
                          {row.liveness_score != null ? `${(row.liveness_score * 100).toFixed(0)}%` : '—'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={row.anomaly === 'high' ? 'badge-blocked' : 'badge-disbursed'} style={{ fontSize: '10px' }}>{(row.anomaly || 'low').toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={row.status === 'passed' ? 'badge-disbursed' : row.status === 'blocked' ? 'badge-blocked' : 'badge-flagged'} style={{ fontSize: '10px' }}>{(row.status || 'passed').toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {row.status !== 'passed' && (
                            <button onClick={() => router.push('/alert')} style={{ padding: '4px 10px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Investigate</button>
                          )}
                        </td>
                      </tr>
                      {row.flag_reason && (
                        <tr key={`${row.id || i}-flag`} style={{ background: '#fef2f2', borderBottom: '1px solid var(--border)' }}>
                          <td colSpan={8} style={{ padding: '6px 14px 10px', fontSize: '11px', color: '#991b1b' }}>⚠️ {row.flag_reason || row.reason}</td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── GHOST QUEUE TAB ── */}
        {activeTab === 'Ghost Queue' && (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }} className="fade-in">
            <div style={{ padding: '12px 16px', background: '#fef2f2', borderBottom: '1px solid #fca5a5' }}>
              <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 700 }}>⚠️ {GHOST_QUEUE_SEED.length} Accounts Flagged for Review</div>
              <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '2px' }}>Actions taken here are saved locally and reported to the audit trail.</div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {GHOST_QUEUE_SEED.map(ghost => {
                const taken = ghostActions[ghost.id];
                return (
                  <div key={ghost.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--slate)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{ghost.name}</span>
                        <span style={{ marginLeft: '10px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{ghost.emp_id}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '2px 10px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--red)', fontWeight: 700 }}>
                          Anomaly: {Math.round(ghost.anomaly_score * 100)}%
                        </span>
                        <span className={taken ? 'badge-disbursed' : ghost.status === 'suspended' ? 'badge-blocked' : ghost.status === 'escalated' ? 'badge-flagged' : 'badge-pending'} style={{ fontSize: '10px' }}>
                          {taken ? 'ACTIONED' : ghost.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}><strong>Flag Reason:</strong> {ghost.reason}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
                        📍 Last Attempt: <strong>{ghost.last_attempt}</strong> &nbsp;|&nbsp; First Flagged: <strong>{ghost.first_flagged}</strong>
                      </div>
                      {taken ? (
                        <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px' }}>
                          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>✓ Action logged: {taken.action}</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{new Date(taken.timestamp).toLocaleString('en-NG')}</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => router.push('/alert')} style={btnStyle('var(--navy)')}>Investigate</button>
                          <button onClick={() => handleGhostAction(ghost.id, 'Account Suspended — Salary hold activated', ghost.salary || 0)} style={btnStyle('var(--red)')}>Suspend Account</button>
                          <button onClick={() => handleGhostAction(ghost.id, 'Escalated to EFCC — Evidence package generated')} style={{ ...btnStyle('transparent'), border: '1px solid var(--amber)', color: 'var(--amber)' }}>Escalate</button>
                          <button onClick={() => handleGhostAction(ghost.id, 'Flag Cleared — Marked as false positive')} style={{ ...btnStyle('transparent'), border: '1px solid var(--border)', color: 'var(--muted)' }}>Clear Flag</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TRAVEL ORDERS TAB ── */}
        {activeTab === 'Travel Orders' && (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }} className="fade-in">
            <div style={{ padding: '12px 16px', background: 'var(--slate)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{currentOrders.length} Active Travel Orders</span>
              <button onClick={() => setShowTravelForm(f => !f)} style={btnStyle('var(--green)')}>+ New Travel Order</button>
            </div>

            {/* Add Travel Order Form */}
            {showTravelForm && (
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: '#f8faff' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy)', marginBottom: '16px' }}>Create New Travel Order</div>
                {travelSaved ? (
                  <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontWeight: 600 }}>✓ Travel order saved successfully. Geo-envelope is now active.</div>
                ) : (
                  <form onSubmit={handleAddTravelOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                      ['employee', 'Employee Name', 'e.g. Dr. Chukwuemeka Obi'],
                      ['emp_id', 'IPPIS ID', 'e.g. IPPIS-12004-AB'],
                      ['destination', 'Destination', 'e.g. Washington DC, USA'],
                      ['hotel', 'Approved Hotel / Location', 'e.g. Marriott Georgetown'],
                      ['lat', 'Latitude', 'e.g. 38.9072'],
                      ['lng', 'Longitude', 'e.g. -77.0369'],
                      ['start', 'Start Date', ''],
                      ['end', 'End Date', ''],
                      ['purpose', 'Purpose', 'e.g. IMF Spring Meetings'],
                      ['approved_by', 'Approved By', 'e.g. Director Aliyu M.'],
                    ].map(([field, label, placeholder]) => (
                      <div key={field}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px' }}>{label}</label>
                        <input
                          type={field === 'start' || field === 'end' ? 'date' : 'text'}
                          value={travelForm[field]}
                          onChange={e => setTravelForm(f => ({ ...f, [field]: e.target.value }))}
                          placeholder={placeholder}
                          required
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px' }}>Geo-Envelope Radius (metres)</label>
                      <input type="number" value={travelForm.radius} onChange={e => setTravelForm(f => ({ ...f, radius: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    </div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px' }}>
                      <button type="submit" style={btnStyle('var(--green)')}>Save Travel Order</button>
                      <button type="button" onClick={() => setShowTravelForm(false)} style={{ ...btnStyle('transparent'), border: '1px solid var(--border)', color: 'var(--muted)' }}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentOrders.map((order, i) => (
                <div key={order.id || i} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: '#f0fdf4', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #86efac' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{order.employee}</span>
                      <span style={{ marginLeft: '10px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{order.emp_id}</span>
                    </div>
                    <span style={{ background: '#166534', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '4px' }}>ACTIVE</span>
                  </div>
                  <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                    <div><span style={{ color: 'var(--muted)' }}>Destination:</span> <strong>{order.destination}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Hotel:</span> <strong>{order.hotel}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Geo-Envelope:</span> <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{order.lat}°, {order.lng}° ±{order.radius}m</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Dates:</span> <strong>{order.start} → {order.end}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Purpose:</span> <strong>{order.purpose}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Approved By:</span> <strong>{order.approved_by}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAYROLL AUDIT TAB ── */}
        {activeTab === 'Payroll Audit' && (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }} className="fade-in">
            <div style={{ padding: '12px 16px', background: 'var(--slate)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Immutable audit trail — all payroll modifications</span>
              <button style={btnStyle('var(--navy)')} onClick={() => {
                const rows = PAYROLL_AUDIT_SEED.map(r => `${r.timestamp}\t${r.employee}\t${r.emp_id}\t${r.change_type}\t${r.old_val}\t${r.new_val}\t${r.officer}\t${r.risk}`).join('\n');
                const blob = new Blob([`Timestamp\tEmployee\tIPPIS ID\tChange Type\tPrevious\tNew Value\tOfficer\tRisk\n${rows}`], { type: 'text/csv' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'VHM_Payroll_Audit.csv'; a.click();
              }}>⬇ Export CSV</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--slate)' }}>
                    {['Timestamp', 'Employee', 'IPPIS ID', 'Change Type', 'Previous', 'New Value', 'Modified By', 'Risk'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAYROLL_AUDIT_SEED.map((row, i) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--slate)', background: row.risk === 'high' ? '#fff8f8' : i % 2 === 0 ? 'white' : 'var(--slate)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: '12px' }}>{row.employee}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{row.emp_id}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12px' }}>{row.change_type}</td>
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

        {/* ── DEVICES TAB ── */}
        {activeTab === 'Devices' && (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px' }} className="fade-in">
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
              Registered device fingerprints. Unrecognised devices trigger immediate flags. Actions are saved to local state.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--slate)' }}>
                    {['Employee ID', 'Fingerprint Hash', 'OS / Browser', 'First Seen', 'Last Seen', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentDevices.map(d => {
                    const isUnrecognised = d.status === 'unrecognised';
                    const actioned = deviceActioned[d.id];
                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--slate)', background: isUnrecognised ? '#fef2f2' : 'white' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{d.emp_id}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: isUnrecognised ? 'var(--red)' : 'var(--navy)', fontWeight: 600 }}>{d.fingerprint}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12px' }}>{d.os}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12px', color: isUnrecognised ? 'var(--red)' : 'inherit' }}>{d.first_seen}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12px', color: isUnrecognised ? 'var(--red)' : 'inherit' }}>{d.last_seen}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={d.status === 'primary' ? 'badge-disbursed' : d.status === 'blocked' ? 'badge-blocked' : 'badge-flagged'} style={{ fontSize: '10px' }}>
                            {actioned === 'approve' ? 'APPROVED' : actioned === 'block' ? 'BLOCKED' : d.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {isUnrecognised && !actioned ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleDeviceAction(d.id, 'approve')} style={{ padding: '4px 10px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                              <button onClick={() => handleDeviceAction(d.id, 'block')} style={{ padding: '4px 10px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Block</button>
                            </div>
                          ) : actioned ? (
                            <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>✓ {actioned === 'approve' ? 'Approved' : 'Blocked'}</span>
                          ) : (
                            <button onClick={() => handleDeviceAction(d.id, 'block')} style={{ padding: '4px 10px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Revoke</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      <footer style={{ background: 'var(--navy-dark)', padding: '12px 24px', textAlign: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          VHM Sentinel Admin Portal | All actions logged and auditable | OAGF HR Integrity Unit
        </div>
      </footer>
    </div>
  );
}

const btnStyle = (bg) => ({
  padding: '7px 14px', background: bg, color: bg === 'transparent' ? 'inherit' : 'white',
  border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)',
});
