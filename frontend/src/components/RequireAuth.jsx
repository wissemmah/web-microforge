import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../lib/rbac';

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireRole({ roles, children }) {
  const { user } = useAuth();
  if (!hasRole(user, ...roles)) {
    return (
      <div className="card mx-auto mt-12 max-w-md text-center">
        <h2 className="text-lg font-semibold text-red-400">Accès refusé</h2>
        <p className="mt-2 text-sm text-slate-400">Votre rôle ne permet pas d'accéder à cette page.</p>
      </div>
    );
  }
  return children;
}
