import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge, EmptyState, ErrorAlert } from '../components/ui';
import { api } from '../lib/api';
import { Hand, Send } from 'lucide-react';

export default function TasksPage() {
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(null);
  const [submitForm, setSubmitForm] = useState({ content: '', gitUrl: '', instructions: '', checklist: { lint: false, tests: false, readme: false } });

  const load = () => {
    api('/tasks/available').then(setAvailable).catch(console.error);
    api('/tasks/mine').then(setMine).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const claim = async (taskId) => {
    setError('');
    try {
      await api(`/tasks/${taskId}/claim`, { method: 'POST', body: JSON.stringify({ claimHours: 48 }) });
      load();
    } catch (e) { setError(e.message); }
  };

  const submit = async (taskId) => {
    setError('');
    try {
      await api(`/tasks/${taskId}/submit`, { method: 'POST', body: JSON.stringify(submitForm) });
      setSubmitting(null);
      setSubmitForm({ content: '', gitUrl: '', instructions: '', checklist: { lint: false, tests: false, readme: false } });
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold">Board des tâches</h1>
      <ErrorAlert message={error} />

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Mes tâches ({mine.length})</h2>
        {mine.length === 0 ? (
          <EmptyState title="Aucune tâche assignée" description="Claim une tâche disponible ci-dessous." />
        ) : (
          <div className="space-y-4">
            {mine.map((task) => (
              <div key={task.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-slate-400">{task.job?.title}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                {(task.status === 'CLAIMED' || task.status === 'REJECTED') && (
                  <div className="mt-4">
                    {submitting === task.id ? (
                      <div className="space-y-3 rounded-lg bg-slate-800/50 p-4">
                        <textarea className="input" placeholder="Contenu / notes" value={submitForm.content} onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })} />
                        <input className="input" placeholder="URL Git (optionnel)" value={submitForm.gitUrl} onChange={(e) => setSubmitForm({ ...submitForm, gitUrl: e.target.value })} />
                        <textarea className="input" placeholder="Instructions d'exécution" value={submitForm.instructions} onChange={(e) => setSubmitForm({ ...submitForm, instructions: e.target.value })} />
                        <div className="flex flex-wrap gap-4 text-sm">
                          {['lint', 'tests', 'readme'].map((k) => (
                            <label key={k} className="flex items-center gap-2">
                              <input type="checkbox" checked={submitForm.checklist[k]} onChange={(e) => setSubmitForm({ ...submitForm, checklist: { ...submitForm.checklist, [k]: e.target.checked } })} />
                              {k}
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => submit(task.id)} className="btn-primary text-xs"><Send className="h-4 w-4" /> Soumettre</button>
                          <button type="button" onClick={() => setSubmitting(null)} className="btn-secondary text-xs">Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setSubmitting(task.id)} className="btn-primary mt-3 text-xs"><Send className="h-4 w-4" /> Soumettre livrable</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Tâches disponibles ({available.length})</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {available.map((task) => (
            <div key={task.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{task.job?.title}</p>
                </div>
                <span className="badge bg-slate-800 text-slate-400">{task.type}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{task.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">Diff. {task.difficulty} · ~{task.estimatedHours}h</span>
                <button type="button" onClick={() => claim(task.id)} className="btn-primary text-xs" disabled={task.status === 'BLOCKED'}>
                  <Hand className="h-4 w-4" /> Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
