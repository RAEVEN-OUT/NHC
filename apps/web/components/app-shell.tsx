'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Activity, KeyRound, LogOut, UserCog, Users, MonitorCheck } from 'lucide-react';
import { apiPost, clearSession, hasSession } from '@/lib/api';

const nav = [
  { href: '/users', label: 'Users', icon: Users },
  { href: '/roles', label: 'Roles', icon: UserCog },
  { href: '/permissions', label: 'Permissions', icon: KeyRound },
  { href: '/sessions', label: 'Sessions', icon: MonitorCheck },
  { href: '/audit-logs', label: 'Audit Logs', icon: Activity },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname !== '/login' && !hasSession()) {
      window.location.href = '/login';
      return;
    }
    setReady(true);
  }, [pathname]);

  if (pathname === '/login') return <main className="login-page">{children}</main>;

  async function logout() {
    try {
      const refreshToken = window.localStorage.getItem('nhc_refresh_token');
      await apiPost('/auth/logout', { refreshToken });
    } catch {
      // Local cleanup still matters if the API is already unavailable.
    } finally {
      clearSession();
    }
  }

  if (!ready) return <main className="login-page"><section className="panel login-box">Checking session...</section></main>;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">NHC</span>
          <span>
            <strong>User Management</strong>
            <small>Super admin console</small>
          </span>
        </div>
        <nav>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link className={active ? 'nav-item active' : 'nav-item'} href={item.href} key={item.href}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
