import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatusBadge, ErrorAlert } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { canCreateJob } from '../lib/rbac';
import { Package, Plus } from 'lucide-react';

const STATUS_ACTIONS = {
  DRAFT: [{ status: 'PUBLISHED', label: 'Publier' }],
  PUBLISHED: [{ status: 'IN_PROGRESS', label: 'Démarrer' }],
  IN_PROGRESS: [{ status: 'IN_REVIEW', label: 'Passer en revue' }],
  IN_REVIEW: [
    { status: 'COMPLETED', label: 'Terminer' },
    { status: 'IN_PROGRESS', label: 'Retour en cours' },
  ],
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', type: 'CODE', difficulty: 1, estimatedHours: 2 });
  const [showTaskForm, setShowTaskForm] = useState(false);

  const load = () => api(`/jobs/${id}`).then(setJob).catch((e) => setError(e.message));

  useEffect(() => { load(); }, [id]);

  const changeStatus = async (status) => {
    try {
      await api(`/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      load();
    } catch (e) { setError(e.message); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await api(`/jobs/${id}/tasks`, { method: 'POST', body: JSON.stringify(taskForm) });
      setShowTaskForm(false);
      setTaskForm({ title: '', description: '', type: 'CODE', difficulty: 1, estimatedHours: 2 });
      load();
    } catch (e) { setError(e.message); }
  };

  const assemble = async () => {
    try {
      const result = await api(`/jobs/${id}/assemble`, { method: 'POST' });
      alert(`Livrable assemblé ! Téléchargement : ${result.downloadUrl}`);
      load();
    } catch (e) { setError(e.message); }
  };

  if (!job) return <Layout><p className="text-slate-400">Chargement…</p></Layout>;

  const actions = STATUS_ACTIONS[job.status] || [];

  return (
    <Layout>
      <ErrorAlert message={error} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="mt-2 text-slate-400">{job.description}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>Stack: {job.stack}</span>
            {job.virtualBudget > 0 && <span>Budget: {job.virtualBudget}</span>}
          </div>
        </div>
        {canCreateJob(user) && (
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <button key={a.status} type="button" onClick={() => changeStatus(a.status)} className="btn-secondary text-xs">{a.label}</button>
            ))}
            {job.status === 'IN_REVIEW' && (
              <button type="button" onClick={assemble} className="btn-primary text-xs"><Package className="h-4 w-4" /> Assembler livrable</button>
            )}
          </div>
        )}
      </div>

      {job.requirements?.length > 0 && (
        <section className="card mb-6">
          <h2 className="mb-3 font-semibold">Exigences</h2>
          <ul className="list-inside list-decimal text-sm text-slate-400">
            {job.requirements.map((r) => <li key={r.id}>{r.description}</li>)}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Micro-tâches ({job.tasks?.length ?? 0})</h2>
          {canCreateJob(user) && (
            <button type="button" onClick={() => setShowTaskForm(!showTaskForm)} className="btn-primary text-xs">
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          )}
        </div>

        {showTaskForm && (
          <form onSubmit={addTask} className="card mb-4 space-y-3">
            <input className="input" placeholder="Titre" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
            <textarea className="input" placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} required />
            <div className="grid gap-3 sm:grid-cols-3">
              <select className="input" value={taskForm.type} onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}>
                {['CODE', 'TEST', 'DOC', 'BUGFIX', 'INTEGRATION'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" className="input" placeholder="Difficulté" value={taskForm.difficulty} onChange={(e) => setTaskForm({ ...taskForm, difficulty: +e.target.value })} min={1} max={5} />
              <input type="number" className="input" placeholder="Heures est." value={taskForm.estimatedHours} onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: +e.target.value })} min={0.5} step={0.5} />
            </div>
            <button type="submit" className="btn-primary text-xs">Créer la tâche</button>
          </form>
        )}

        <div className="space-y-3">
          {job.tasks?.map((task) => (
            <div key={task.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{task.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className="badge bg-slate-800 text-slate-400">{task.type}</span>
                  <StatusBadge status={task.status} />
                </div>
              </div>
              {task.dependencies?.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">Dépend de {task.dependencies.length} tâche(s)</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
