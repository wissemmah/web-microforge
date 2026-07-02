import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { ErrorAlert } from '../components/ui';
import { ROLES } from '../lib/rbac';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: ROLES.WORKER });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold">Inscription</h1>
          <ErrorAlert message={error} />
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Nom</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Mot de passe (8+ car.)</label>
              <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Rôle</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value={ROLES.CLIENT}>Client</option>
                <option value={ROLES.WORKER}>Worker</option>
                <option value={ROLES.REVIEWER}>Reviewer</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>Créer le compte</button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Déjà inscrit ? <Link to="/login" className="text-brand-400 hover:underline">Connexion</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
