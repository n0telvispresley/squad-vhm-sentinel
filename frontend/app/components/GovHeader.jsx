'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GovHeader({ user, role = 'employee' }) {
  const pathname = usePathname();

  return (
    <header style={{ background: 'var(--navy)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      {/* Top government stripe */}
      <div className="gov-stripe" />

      {/* Top utility bar */}
      <div style={{ background: 'var(--navy-dark)', padding: '4px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          FEDERAL REPUBLIC OF NIGERIA — IPPIS INTEGRITY PLATFORM
        </span>
        <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Main header */}
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Nigeria coat of arms placeholder */}
          <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '20px' }}>🦅</span>
          </div>
          <div>
            <div style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: '18px', lineHeight: 1.2 }}>
              VHM Sentinel
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Payroll Integrity & Verification System
            </div>
          </div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--white)', fontSize: '13px', fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{user.ippis_id} • {user.grade}</div>
            </div>
            <div style={{ width: '36px', height: '36px', background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>
              {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <Link href="/" style={{ color: '#94a3b8', fontSize: '11px', textDecoration: 'none', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}>
              Logout
            </Link>
          </div>
        )}
      </div>

      {/* Nav bar */}
      {user && (
        <nav style={{ background: 'var(--navy-light)', padding: '0 24px', display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {role === 'employee' ? (
            <>
              <NavLink href="/dashboard" label="My Dashboard" active={pathname === '/dashboard'} />
              <NavLink href="/dispute" label="Disputes" active={pathname === '/dispute'} />
            </>
          ) : (
            <>
              <NavLink href="/admin" label="Overview" active={pathname === '/admin'} />
              <NavLink href="/admin/alerts" label="Alerts" active={pathname?.startsWith('/admin/alerts')} />
            </>
          )}
        </nav>
      )}

      {/* Bottom stripe */}
      <div className="gov-stripe" />
    </header>
  );
}

function NavLink({ href, label, active }) {
  return (
    <Link href={href} style={{
      color: active ? 'var(--white)' : '#94a3b8',
      textDecoration: 'none',
      padding: '10px 16px',
      fontSize: '13px',
      fontWeight: active ? 600 : 400,
      borderBottom: active ? '3px solid var(--green)' : '3px solid transparent',
      display: 'block',
    }}>
      {label}
    </Link>
  );
}
