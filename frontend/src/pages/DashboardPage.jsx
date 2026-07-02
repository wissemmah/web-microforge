import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/ui';
import { api } from '../lib/api';
import { canCreateJob, canClaimTask, canReview } from '../lib/rbac';
import { Briefcase, CheckSquare, Eye, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);

  useEffect(() => {
    api('/jobs').then(setJobs).catch(console.error);
    if (canClaimTask(user)) api('/tasks/mine').then(setMyTasks).catch(console.error);
    if (canReview(user)) api('/reviews/pending').then(setPendingReviews).catch(console.error);
  }, [user]);

  const stats = [
    { label: 'Jobs actifs', value: jobs.filter((j) => !['COMPLETED', 'DRAFT'].includes(j.status)).length, icon: Briefcase, color: 'text-brand-400' },
    { label: 'Mes tâches', value: myTasks.length, icon: CheckSquare, color: 'text-amber-400', show: canClaimTask(user) },
    { label: 'Revues en attente', value: pendingReviews.length, icon: Eye, color: 'text-purple-400', show: canReview(user) },
    { label: 'Réputation', value: user?.reputationScore?.toFixed(0) ?? '—', icon: TrendingUp, color: 'text-emerald-400', show: user?.role === 'WORKER' },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bonjour, {user?.name}</h1>
        <p className="mt-1 text-slate-400">Tableau de bord MicroForge</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.filter((s) => s.show !== false).map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`rounded-lg bg-slate-800 p-3 ${color}`}><Icon className="h-6 w-6" /></div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Jobs récents</h2>
            {canCreateJob(user) && <Link to="/jobs/new" className="btn-primary text-xs">Nouveau job</Link>}
          </div>
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="card block transition hover:border-brand-600/50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{job.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{job.stack}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </Link>
            ))}
            {!jobs.length && <p className="text-sm text-slate-500">Aucun job pour le moment.</p>}
          </div>
        </section>

        {canClaimTask(user) && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mes tâches assignées</h2>
              <Link to="/tasks" className="btn-secondary text-xs">Voir le board</Link>
            </div>
            <div className="space-y-3">
              {myTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="card">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{task.job?.title}</p>
                </div>
              ))}
              {!myTasks.length && <p className="text-sm text-slate-500">Aucune tâche assignée — explorez le board.</p>}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
