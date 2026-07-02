import { STATUS_COLORS } from '../lib/api';

export function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-slate-700 text-slate-300';
  return <span className={`badge ${cls}`}>{status.replace(/_/g, ' ')}</span>;
}

export function EmptyState({ title, description }) {
  return (
    <div className="card py-12 text-center">
      <p className="text-lg font-medium text-slate-300">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
      {message}
    </div>
  );
}
