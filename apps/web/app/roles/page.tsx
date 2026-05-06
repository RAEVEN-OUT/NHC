'use client';

import { useState } from 'react';
import { apiGet } from '@/lib/api';

type Role = {
  id: string;
  name: string;
  description?: string;
  permissions: { permission: { key: string } }[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);

  async function loadRoles() {
    setRoles(await apiGet<Role[]>('/roles'));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Roles</h1>
          <p className="muted">Roles define who the user is in the hospital membership system.</p>
        </div>
        <button onClick={loadRoles}>Refresh</button>
      </div>
      <table>
        <thead>
          <tr><th>Role</th><th>Description</th><th>Permissions</th></tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>{role.description ?? '-'}</td>
              <td>{role.permissions.length}</td>
            </tr>
          ))}
          {!roles.length ? <tr><td colSpan={3}>Refresh after logging in.</td></tr> : null}
        </tbody>
      </table>
    </>
  );
}
