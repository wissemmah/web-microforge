import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleLabel, canCreateJob, canClaimTask, canReview } from '../lib/rbac';
import { LogOut, LayoutDashboard, Briefcase, CheckSquare, Eye, Shield } from 'lucide-react';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const nav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/jobs', label: 'Jobs', icon: Briefcase, show: canCreateJob(user) || user?.role === 'WORKER' },
    { to: '/tasks', label: 'Tâches', icon: CheckSquare, show: canClaimTask(user) },
    { to: '/reviews', label: 'Revues', icon: Eye, show: canReview(user) },
    { to: '/admin', label: 'Admin', icon: Shield, show: user?.role === 'ADMIN' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-900/20">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-mono text-sm font-bold">MF</div>
            <span className="font-semibold tracking-tight">MicroForge</span>
          </Link>
          {user && (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-slate-400 sm:inline">
                {user.name} · <span className="text-brand-400">{roleLabel(user.role)}</span>
              </span>
              <button type="button" onClick={logout} className="btn-secondary text-xs">
                <LogOut className="h-4 w-4" /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>

      {user && (
        <nav className="border-b border-slate-800 bg-slate-900/50">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
            {nav.filter((n) => n.show).map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition ${
                  location.pathname.startsWith(to)
                    ? 'bg-brand-600/20 text-brand-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
