import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatusBadge, EmptyState } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { canCreateJob } from '../lib/rbac';
import { Plus } from 'lucide-react';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api('/jobs').then(setJobs).catch(console.error);
  }, []);

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        {canCreateJob(user) && (
          <Link to="/jobs/new" className="btn-primary"><Plus className="h-4 w-4" /> Nouveau job</Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="Aucun job" description="Créez votre premier job pour décomposer un besoin en micro-tâches." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="card block transition hover:border-brand-600/50">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <StatusBadge status={job.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">{job.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{job.stack}</span>
                <span>·</span>
                <span>{job.tasks?.length ?? 0} tâches</span>
                {job.virtualBudget > 0 && <><span>·</span><span>{job.virtualBudget} crédits</span></>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
