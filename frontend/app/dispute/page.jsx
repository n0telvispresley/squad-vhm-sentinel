'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '../components/GovHeader';
import { PAYROLL_CHANGES_SEED, getCurrentUser, formatDate } from '../lib/data';
import { addDispute, getDisputesByUser, updateDisputeStatus, getAllDisputes } from '../lib/store';
import { submitDisputeApi } from '../lib/api';

export default function DisputePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [payrollChanges, setPayrollChanges] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [lastRef, setLastRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ change_id: 'PC-001', reason_type: '', notes: '' });
  const [activeTab, setActiveTab] = useState('submit');

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    // Load disputes for this user from localStorage
    const userDisputes = getDisputesByUser(u.ippis_id);
    // Merge with seed data if no disputes yet
    const allStored = getAllDisputes();
    if (allStored.length === 0) {
      // Seed initial dispute
      const seed = { employee_id: u.ippis_id, change_id: 'PC-002', type: 'Bank Account Update', notes: 'Querying account change', reason_type: 'unauthorised' };
      const seeded = addDispute(seed);
      // Mark it resolved
      updateDisputeStatus(seeded.id, 'resolved', 'Change confirmed legitimate. Employee initiated via HR portal.');
    }
    setDisputes(getDisputesByUser(u.ippis_id));
    // Filter payroll changes for this user
    setPayrollChanges(PAYROLL_CHANGES_SEED.filter(c => c.emp_id === u.ippis_id));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason_type) return;
    setLoading(true);

    const selectedChange = payrollChanges.find(c => c.id === form.change_id) || payrollChanges[0];

    // 1. Save to localStorage immediately
    const dispute = addDispute({
      employee_id: user.ippis_id,
      change_id: form.change_id,
      type: selectedChange?.type || 'Payroll Change',
      reason_type: form.reason_type,
      notes: form.notes,
    });

    // 2. Try backend
    await submitDisputeApi(user.ippis_id, form.change_id, form.reason_type, form.notes);

    setLoading(false);
    setLastRef(dispute.ref);
    setSubmitted(true);
    setDisputes(getDisputesByUser(user.ippis_id));
    setForm({ change_id: payrollChanges[0]?.id || 'PC-001', reason_type: '', notes: '' });
  };

  const resetForm = () => { setSubmitted(false); setForm({ change_id: payrollChanges[0]?.id || 'PC-001', reason_type: '', notes: '' }); };

  const statusBadge = (s) => {
    const map = { pending: 'badge-pending', resolved: 'badge-disbursed', under_review: 'badge-flagged', rejected: 'badge-blocked' };
    return map[s] || 'badge-pending';
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <GovHeader user={user} role="employee" />
      <main style={{ flex: 1, maxWidth: '880px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ fontSize: '12px', color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>← Back to Dashboard</button>
          <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--navy)', marginTop: '8px' }}>Payroll Dispute Portal</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Challenge any unauthorised payroll changes to your record</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border)', borderRadius: '8px 8px 0 0', overflow: 'hidden', marginBottom: '0' }}>
          {[['submit', 'Submit Dispute'], ['history', `My Disputes (${disputes.length})`]].map(([k, label]) => (
            <button key={k} onClick={() => setActiveTab(k)} style={{ padding: '12px 20px', background: activeTab === k ? 'var(--navy)' : 'transparent', color: activeTab === k ? 'white' : 'var(--muted)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === k ? 600 : 400, fontFamily: 'var(--font-body)', borderRight: '1px solid var(--border)' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '24px' }}>

          {/* SUBMIT TAB */}
          {activeTab === 'submit' && (
            !submitted ? (
              <form onSubmit={handleSubmit} style={{ maxWidth: '520px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={S.label}>Payroll Change to Dispute</label>
                  {payrollChanges.length === 0 ? (
                    <div style={{ padding: '12px', background: 'var(--slate)', borderRadius: '4px', fontSize: '13px', color: 'var(--muted)' }}>No payroll changes on record for your account.</div>
                  ) : (
                    <select value={form.change_id} onChange={e => setForm({ ...form, change_id: e.target.value })} style={S.input}>
                      {payrollChanges.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.date} — {ch.type} ({ch.new_value})</option>
                      ))}
                    </select>
                  )}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={S.label}>Reason for Dispute</label>
                  <select value={form.reason_type} onChange={e => setForm({ ...form, reason_type: e.target.value })} style={S.input} required>
                    <option value="">Select a reason...</option>
                    <option value="unauthorised">Change was not authorised by me</option>
                    <option value="incorrect">Incorrect value — different from what was approved</option>
                    <option value="unknown_officer">Unknown officer made the modification</option>
                    <option value="wrong_timing">Change made outside annual review period</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={S.label}>Additional Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4} placeholder="Provide any additional context or evidence..." style={{ ...S.input, resize: 'vertical', fontFamily: 'var(--font-body)' }} />
                </div>
                <button type="submit" disabled={loading || !form.reason_type || payrollChanges.length === 0}
                  style={{ padding: '12px 24px', background: loading ? '#94a3b8' : 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loading ? <><Spinner /> Submitting...</> : 'Submit Dispute'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto', padding: '20px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--green)', marginBottom: '8px' }}>Dispute Submitted</div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Your dispute has been logged and assigned to an HR integrity officer for review within 5 working days.</p>
                <div style={{ background: 'var(--slate)', borderRadius: '6px', padding: '14px', border: '1px solid var(--border)', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Reference Number</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px', color: 'var(--navy)' }}>{lastRef}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={resetForm} style={{ padding: '10px 20px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Submit Another</button>
                  <button onClick={() => setActiveTab('history')} style={{ padding: '10px 20px', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>View History</button>
                </div>
              </div>
            )
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div>
              {disputes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>
                  No disputes filed yet. <button onClick={() => setActiveTab('submit')} style={{ color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>File your first dispute →</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {disputes.map(d => (
                    <div key={d.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--slate)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--navy)', fontWeight: 700 }}>{d.ref}</span>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Filed: {d.filed}</div>
                        </div>
                        <span className={statusBadge(d.status)}>{d.status.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                        <div><span style={{ color: 'var(--muted)' }}>Type:</span> <strong>{d.type}</strong></div>
                        <div><span style={{ color: 'var(--muted)' }}>Assigned to:</span> <strong>{d.officer}</strong></div>
                        <div><span style={{ color: 'var(--muted)' }}>Reason:</span> <strong>{d.reason_type?.replace('_', ' ')}</strong></div>
                      </div>
                      {d.notes && <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}><strong>Notes:</strong> {d.notes}</div>}
                      {d.outcome && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '4px', fontSize: '12px', color: '#166534', border: '1px solid #86efac' }}>
                          <strong>Outcome:</strong> {d.outcome}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <footer style={{ background: 'var(--navy-dark)', padding: '12px 24px', textAlign: 'center' }}>
        <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>VHM Sentinel | Dispute Portal | All submissions are logged and auditable</span>
      </footer>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const S = {
  label: { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', background: 'white', outline: 'none' },
};
function Spinner() { return <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />; }
