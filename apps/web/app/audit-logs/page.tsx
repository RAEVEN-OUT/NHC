'use client';

import { useState } from 'react';
import { apiGet } from '@/lib/api';

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  createdAt: string;
  actor?: { email: string };
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  async function load() {
    setLogs(await apiGet<AuditLog[]>('/audit-logs'));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Audit Logs</h1>
          <p className="muted">Every sensitive user-management change should leave a trace.</p>
        </div>
        <button onClick={load}>Refresh</button>
      </div>
      <table>
        <thead>
          <tr><th>Action</th><th>Actor</th><th>Entity</th><th>Time</th></tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td><span className="badge">{log.action}</span></td>
              <td>{log.actor?.email ?? 'System'}</td>
              <td>{log.entityType} {log.entityId ?? ''}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {!logs.length ? <tr><td colSpan={4}>Refresh after logging in.</td></tr> : null}
        </tbody>
      </table>
    </>
  );
}
