'use client';

import { useState } from 'react';
import { apiDelete, apiGet } from '@/lib/api';

type Session = {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  loginAt: string;
  revokedAt?: string;
  user: { email: string; phone?: string };
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  async function load() {
    setSessions(await apiGet<Session[]>('/sessions'));
  }

  async function revoke(id: string) {
    await apiDelete(`/sessions/${id}`);
    await load();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Sessions</h1>
          <p className="muted">Track active logins and force logout suspicious sessions.</p>
        </div>
        <button onClick={load}>Refresh</button>
      </div>
      <table>
        <thead>
          <tr><th>User</th><th>IP</th><th>Device</th><th>Login</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>{session.user.email}</td>
              <td>{session.ipAddress ?? '-'}</td>
              <td>{session.userAgent ?? '-'}</td>
              <td>{new Date(session.loginAt).toLocaleString()}</td>
              <td><span className={session.revokedAt ? 'badge blocked' : 'badge'}>{session.revokedAt ? 'REVOKED' : 'ACTIVE'}</span></td>
              <td>{session.revokedAt ? '-' : <button onClick={() => revoke(session.id)}>Force Logout</button>}</td>
            </tr>
          ))}
          {!sessions.length ? <tr><td colSpan={6}>Refresh after logging in.</td></tr> : null}
        </tbody>
      </table>
    </>
  );
}
