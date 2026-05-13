'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '../components/GovHeader';
import { CURRENT_USER, PAYROLL_CHANGES, DISPUTES } from '../lib/data';

export default function DisputePage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ change_id: 'PC-001', reason_type: '', notes: '' });
  const [disputeRef, setDisputeRef] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const ref = `DSP-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setDisputeRef(ref);
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <GovHeader user={CURRENT_USER} role="employee" />

      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ fontSize: '12px', color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>← Back to Dashboard</button>
          <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--navy)', marginTop: '8px' }}>Payroll Dispute Portal</h1>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Challenge any unauthorised payroll changes to your record</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Submit Dispute */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--navy)', padding: '14px 20px', color: 'white', fontSize: '13px', fontWeight: 600 }}>Submit New Dispute</div>

            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Payroll Change to Dispute</label>
                  <select value={form.change_id} onChange={e => setForm({ ...form, change_id: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', background: 'white', outline: 'none' }}>
                    {PAYROLL_CHANGES.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.date} — {ch.type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Reason for Dispute</label>
                  <select value={form.reason_type} onChange={e => setForm({ ...form, reason_type: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', background: 'white', outline: 'none' }} required>
                    <option value="">Select a reason...</option>
                    <option value="unauthorised">Change was not authorised by me</option>
                    <option value="incorrect">Incorrect value — different from what was approved</option>
                    <option value="unknown_officer">Unknown officer made the modification</option>
                    <option value="wrong_timing">Change made outside annual review period</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Additional Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4} placeholder="Provide any additional context or evidence..." style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', resize: 'vertical', outline: 'none' }} />
                </div>

                <button type="submit" style={{ padding: '12px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Submit Dispute
                </button>
              </form>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--green)', marginBottom: '6px' }}>Dispute Submitted</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Your dispute has been logged and assigned to an HR integrity officer.</div>
                <div style={{ background: 'var(--slate)', borderRadius: '6px', padding: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Reference Number</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', color: 'var(--navy)' }}>{disputeRef}</div>
                </div>
                <button onClick={() => setSubmitted(false)} style={{ marginTop: '16px', padding: '8px 20px', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>Submit Another</button>
              </div>
            )}
          </div>

          {/* My Disputes */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--navy)', padding: '14px 20px', color: 'white', fontSize: '13px', fontWeight: 600 }}>My Dispute History</div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {DISPUTES.map(d => (
                <div key={d.id} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--navy)', fontWeight: 700 }}>{d.ref}</span>
                    <span className="badge-disbursed" style={{ fontSize: '10px' }}>{d.status.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}><strong>Type:</strong> {d.type}</div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}><strong>Filed:</strong> {d.filed}</div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}><strong>Assigned to:</strong> {d.officer}</div>
                  {d.outcome && (
                    <div style={{ marginTop: '8px', padding: '8px', background: '#f0fdf4', borderRadius: '4px', fontSize: '12px', color: '#166534' }}>
                      <strong>Outcome:</strong> {d.outcome}
                    </div>
                  )}
                </div>
              ))}
              {DISPUTES.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px', fontSize: '13px' }}>No disputes filed yet</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
