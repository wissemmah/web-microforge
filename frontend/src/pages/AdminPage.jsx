import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import { roleLabel } from '../lib/rbac';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api('/admin/users').then(setUsers).catch(console.error);
    api('/admin/audit-logs').then(setLogs).catch(console.error);
  }, []);

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold">Administration</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Utilisateurs ({users.length})</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Réputation</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">{roleLabel(u.role)}</td>
                  <td className="px-4 py-3">{u.reputationScore?.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Journal d'audit (100 derniers)</h2>
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="card py-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-mono text-brand-400">{log.action}</span>
                <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
              </div>
              <p className="mt-1 text-slate-400">{log.entityType} {log.entityId?.slice(0, 8)}… · {log.user?.name ?? 'système'}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
