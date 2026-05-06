'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('admin@nhc.local');
  const [password, setPassword] = useState('Admin@12345');
  const [message, setMessage] = useState('');

  async function login() {
    try {
      const result = await apiPost<{ accessToken: string; refreshToken: string }>('/auth/login', { identifier, password });
      window.localStorage.setItem('nhc_access_token', result.accessToken);
      window.localStorage.setItem('nhc_refresh_token', result.refreshToken);
      setMessage('Logged in. You can now open Users, Roles, Permissions, Sessions, or Audit Logs.');
      router.push('/users');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <section className="panel login-box">
      <div className="login-brand">NHC</div>
      <h1>Super Admin Login</h1>
      <p className="muted">Use email or phone with the seeded super admin password.</p>
      <label>Email or phone<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="admin@nhc.local or 9999999999" /></label>
      <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" /></label>
      <button onClick={login}>Login</button>
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}
