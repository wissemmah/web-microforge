const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getToken() {
  return localStorage.getItem('microforge_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('microforge_token', token);
  else localStorage.removeItem('microforge_token');
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.message || data.error || `Erreur ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return data;
}

export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export const STATUS_COLORS = {
  DRAFT: 'bg-slate-700 text-slate-300',
  PUBLISHED: 'bg-blue-900/50 text-blue-300',
  IN_PROGRESS: 'bg-amber-900/50 text-amber-300',
  IN_REVIEW: 'bg-purple-900/50 text-purple-300',
  COMPLETED: 'bg-emerald-900/50 text-emerald-300',
  AVAILABLE: 'bg-emerald-900/50 text-emerald-300',
  CLAIMED: 'bg-amber-900/50 text-amber-300',
  SUBMITTED: 'bg-blue-900/50 text-blue-300',
  ACCEPTED: 'bg-emerald-900/50 text-emerald-300',
  REJECTED: 'bg-red-900/50 text-red-300',
  BLOCKED: 'bg-slate-700 text-slate-400',
};
