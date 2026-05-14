'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '../components/GovHeader';
import { CURRENT_USER, formatNaira } from '../lib/data';

export default function SuccessPage() {
  const router = useRouter();
  const [squadRef, setSquadRef] = useState('');
  const [confettiFired, setConfettiFired] = useState(false);

  useEffect(() => {
    const ref = sessionStorage.getItem('squad_ref') || `VHM-${Date.now().toString(36).toUpperCase()}`;
    setSquadRef(ref);

    // Fire confetti
    import('canvas-confetti').then(({ default: confetti }) => {
      const end = Date.now() + 2500;
      const colors = ['#008751', '#ffffff', '#002147'];
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });

    const redirect = setTimeout(() => router.push('/dashboard'), 8000);
    return () => clearTimeout(redirect);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)', display: 'flex', flexDirection: 'column' }}>
      <GovHeader user={CURRENT_USER} role="employee" />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div className="fade-in" style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ background: 'white', border: '2px solid var(--green)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,135,81,0.15)', textAlign: 'center', padding: '40px 32px' }}>
            {/* Animated check */}
            <div style={{ width: '80px', height: '80px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '3px solid var(--green)' }}>
              <span style={{ fontSize: '36px' }}>✅</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--green)', marginBottom: '8px' }}>Identity Verified</h1>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', marginBottom: '6px' }}>Salary Successfully Disbursed</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '28px' }}>Your salary has been released via Squad payment infrastructure</div>

            {/* Amount */}
            <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '20px', marginBottom: '24px', border: '1px solid #86efac' }}>
              <div style={{ fontSize: '12px', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Amount Disbursed</div>
              <div style={{ fontSize: '36px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)' }}>{formatNaira(247500)}</div>
              <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>May 2026 Net Salary — {CURRENT_USER.bank}</div>
            </div>

            {/* Squad reference */}
            <div style={{ background: 'var(--slate)', borderRadius: '6px', padding: '14px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Squad Transaction Reference</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px', color: 'var(--navy)', letterSpacing: '0.05em' }}>{squadRef}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                {new Date().toLocaleString('en-NG', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Disbursement details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px', fontSize: '12px' }}>
              {[
                ['Recipient', CURRENT_USER.name],
                ['Account', `${CURRENT_USER.bank} ${CURRENT_USER.account}`],
                ['Liveness Verification', 'PASSED ✓'],
                ['Anomaly Score', 'LOW RISK ✓'],
                ['Payment Method', 'Squad Transfer API'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--slate-dark)' }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px' }}>
              Redirecting to dashboard in a moment...
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              style={{ width: '100%', padding: '12px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
