'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Employees', icon: '👥' },
  { href: '/attendance', label: 'Attendance', icon: '📋' },
  { href: '/summary', label: 'Summary', icon: '💰' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm('Logout?')) return;
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* ── Top bar (always visible) ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="navbar-brand-icon">S</div>
            <span>Salary Manager</span>
          </div>

          {/* Desktop tabs (hidden on mobile) */}
          <div className="nav-tabs nav-tabs-desktop">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`nav-tab ${pathname === tab.href ? 'active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <button className="nav-logout" onClick={handleLogout} aria-label="Logout">
            <span className="logout-text">Logout</span>
            <span className="logout-icon">⏻</span>
          </button>
        </div>
      </nav>

      {/* ── Bottom tab bar (mobile only) ── */}
      <nav className="bottom-tabs" aria-label="Main navigation">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`bottom-tab ${isActive ? 'active' : ''}`}
            >
              <span className="bottom-tab-icon">{tab.icon}</span>
              <span className="bottom-tab-label">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
