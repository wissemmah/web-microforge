import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { ErrorAlert } from '../components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('client@microforge.demo');
  const [password, setPassword] = useState('DemoPass123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="mt-1 text-sm text-slate-400">Plateforme de crowdsourcing dev</p>
          <ErrorAlert message={error} />
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Mot de passe</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Pas de compte ? <Link to="/register" className="text-brand-400 hover:underline">S'inscrire</Link>
          </p>
          <div className="mt-6 rounded-lg bg-slate-800/50 p-3 text-xs text-slate-500">
            <p className="font-medium text-slate-400">Comptes démo</p>
            <p>client@ / worker1@ / reviewer@ / admin@microforge.demo</p>
            <p>Mot de passe : DemoPass123!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
