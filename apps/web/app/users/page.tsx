'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';

type Role = { id: string; name: string; description?: string };
type User = {
  id: string;
  email: string;
  phone?: string;
  username?: string;
  firstName: string;
  lastName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  lastLoginAt?: string;
  roles: { role: Role }[];
};
type AuditLog = { id: string; action: string; entityType: string; createdAt: string };

const emptyForm = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  password: 'User@12345',
  roleIds: [] as string[],
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const needle = search.toLowerCase();
    return users.filter((user) =>
      [user.firstName, user.lastName, user.email, user.phone, user.username].some((value) =>
        value?.toLowerCase().includes(needle),
      ),
    );
  }, [search, users]);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    await run(async () => {
      const [usersResult, rolesResult] = await Promise.all([
        apiGet<User[]>('/users'),
        apiGet<Role[]>('/roles'),
      ]);
      setUsers(usersResult);
      setRoles(rolesResult);
      setStatus('Loaded users and roles.');
    });
  }

  async function run(action: () => Promise<void>) {
    try {
      setError('');
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  function editUser(user: User) {
    setSelectedUser(user);
    setForm({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName ?? '',
      email: user.email,
      phone: user.phone ?? '',
      username: user.username ?? '',
      password: 'User@12345',
      roleIds: user.roles.map((item) => item.role.id),
    });
    void loadActivity(user.id);
  }

  function toggleRole(roleId: string) {
    setForm((current) => ({
      ...current,
      roleIds: current.roleIds.includes(roleId)
        ? current.roleIds.filter((id) => id !== roleId)
        : [...current.roleIds, roleId],
    }));
  }

  async function saveUser(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        email: form.email,
        phone: form.phone || undefined,
        username: form.username || undefined,
      };

      if (form.id) {
        await apiPatch(`/users/${form.id}`, payload);
        await apiPost(`/users/${form.id}/roles`, { roleIds: form.roleIds });
        setStatus('User updated and roles assigned.');
      } else {
        await apiPost('/users', { ...payload, password: form.password, roleIds: form.roleIds });
        setStatus('User created.');
      }
      resetForm();
      await loadAll();
    });
  }

  async function updateStatus(user: User, nextStatus: User['status']) {
    await run(async () => {
      await apiPatch(`/users/${user.id}/status`, { status: nextStatus });
      setStatus(`User marked ${nextStatus}.`);
      await loadAll();
    });
  }

  async function resetPassword(user: User) {
    const password = window.prompt(`New password for ${user.email}`, 'User@12345');
    if (!password) return;
    await run(async () => {
      await apiPost(`/users/${user.id}/reset-password`, { password });
      setStatus('Password reset and active sessions revoked.');
      await loadActivity(user.id);
    });
  }

  async function forceLogout(user: User) {
    await run(async () => {
      await apiDelete(`/sessions/user/${user.id}`);
      setStatus('All active sessions revoked for this user.');
      await loadActivity(user.id);
    });
  }

  async function softDelete(user: User) {
    if (!window.confirm(`Soft delete ${user.email}?`)) return;
    await run(async () => {
      await apiDelete(`/users/${user.id}`);
      setStatus('User soft deleted.');
      resetForm();
      await loadAll();
    });
  }

  async function loadActivity(userId: string) {
    await run(async () => {
      setActivity(await apiGet<AuditLog[]>(`/users/${userId}/activity`));
    });
  }

  function resetForm() {
    setSelectedUser(null);
    setActivity([]);
    setForm(emptyForm);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>User Management</h1>
          <p className="muted">Create users, edit details, disable access, reset passwords, assign roles, inspect activity, and force logout sessions.</p>
        </div>
        <div className="toolbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" />
          <button onClick={loadAll}>Refresh</button>
        </div>
      </div>

      {error ? <div className="notice error">{error}</div> : null}
      {status ? <div className="notice ok">{status}</div> : null}

      <section className="workbench">
        <form className="panel" onSubmit={saveUser}>
          <h2>{form.id ? 'Edit User' : 'Create User'}</h2>
          <div className="form-grid">
            <label>First name<input required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label>
            <label>Last name<input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label>
            <label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            <label>Username<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
            {!form.id ? <label>Initial password<input required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label> : null}
          </div>
          <div className="role-picker">
            {roles.map((role) => (
              <label key={role.id} className="check-row">
                <input type="checkbox" checked={form.roleIds.includes(role.id)} onChange={() => toggleRole(role.id)} />
                {role.name}
              </label>
            ))}
          </div>
          <div className="toolbar">
            <button type="submit">{form.id ? 'Save Changes' : 'Create User'}</button>
            {form.id ? <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>

        <section className="panel">
          <h2>{selectedUser ? `${selectedUser.firstName}'s Activity` : 'User Activity'}</h2>
          {activity.length ? (
            <div className="activity-list">
              {activity.map((item) => (
                <div key={item.id} className="activity-item">
                  <strong>{item.action}</strong>
                  <span>{item.entityType} • {new Date(item.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Select a user to view recent activity.</p>
          )}
        </section>
      </section>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email / Phone</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}<br /><span className="muted">{user.phone ?? '-'}</span></td>
              <td>{user.roles.map((item) => item.role.name).join(', ') || '-'}</td>
              <td><span className={user.status === 'BLOCKED' ? 'badge blocked' : 'badge'}>{user.status}</span></td>
              <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}</td>
              <td>
                <div className="action-row">
                  <button onClick={() => editUser(user)}>Edit</button>
                  <button className="secondary-button" onClick={() => updateStatus(user, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}>
                    {user.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                  </button>
                  <button className="secondary-button" onClick={() => updateStatus(user, 'BLOCKED')}>Block</button>
                  <button className="secondary-button" onClick={() => resetPassword(user)}>Reset Password</button>
                  <button className="secondary-button" onClick={() => forceLogout(user)}>Force Logout</button>
                  <button className="danger-button" onClick={() => softDelete(user)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {!filteredUsers.length ? <tr><td colSpan={6}>No users loaded. Make sure the API is running, then refresh.</td></tr> : null}
        </tbody>
      </table>
    </>
  );
}
