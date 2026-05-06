'use client';

import { useState } from 'react';
import { apiGet } from '@/lib/api';

type Permission = { id: string; key: string; group: string; description?: string };

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  async function load() {
    setPermissions(await apiGet<Permission[]>('/permissions'));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Permissions</h1>
          <p className="muted">Permission keys are the backend-enforced actions used by guards.</p>
        </div>
        <button onClick={load}>Refresh</button>
      </div>
      <table>
        <thead>
          <tr><th>Key</th><th>Group</th><th>Description</th></tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td><span className="badge">{permission.key}</span></td>
              <td>{permission.group}</td>
              <td>{permission.description}</td>
            </tr>
          ))}
          {!permissions.length ? <tr><td colSpan={3}>Refresh after logging in.</td></tr> : null}
        </tbody>
      </table>
    </>
  );
}
