import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ErrorAlert } from '../components/ui';
import { api } from '../lib/api';

export default function NewJobPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    stack: '',
    constraints: '',
    virtualBudget: 1000,
    deadline: '',
    requirements: [{ description: '', priority: 1 }],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const job = await api('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          requirements: form.requirements.filter((r) => r.description.trim()),
        }),
      });
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold">Créer un job</h1>
      <div className="card mx-auto max-w-2xl">
        <ErrorAlert message={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Titre</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Description</label>
            <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Stack</label>
              <input className="input" value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} required placeholder="React, NestJS, PostgreSQL" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Budget virtuel</label>
              <input type="number" className="input" value={form.virtualBudget} onChange={(e) => setForm({ ...form, virtualBudget: +e.target.value })} min={0} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Contraintes</label>
            <textarea className="input" value={form.constraints} onChange={(e) => setForm({ ...form, constraints: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Deadline</label>
            <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Création…' : 'Créer le job (brouillon)'}</button>
        </form>
      </div>
    </Layout>
  );
}
