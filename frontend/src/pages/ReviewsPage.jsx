import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge, EmptyState, ErrorAlert } from '../components/ui';
import { api } from '../lib/api';
import { Check, X, MessageSquare } from 'lucide-react';

export default function ReviewsPage() {
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [checklist, setChecklist] = useState({ lint: false, tests: false, readme: false });

  const load = () => api('/reviews/pending').then(setPending).catch(console.error);
  useEffect(() => { load(); }, []);

  const decide = async (submissionId, decision) => {
    setError('');
    try {
      await api(`/reviews/submissions/${submissionId}/decide`, {
        method: 'POST',
        body: JSON.stringify({ decision, qualityChecklist: checklist, comment: comment || undefined }),
      });
      setComment('');
      setChecklist({ lint: false, tests: false, readme: false });
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold">File de revue</h1>
      <ErrorAlert message={error} />

      {pending.length === 0 ? (
        <EmptyState title="Aucune soumission en attente" description="Les nouvelles soumissions apparaîtront ici." />
      ) : (
        <div className="space-y-6">
          {pending.map((sub) => (
            <div key={sub.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{sub.task?.title}</h3>
                  <p className="text-sm text-slate-400">{sub.task?.job?.title} · v{sub.version} · {sub.worker?.name}</p>
                </div>
                <StatusBadge status={sub.task?.status} />
              </div>

              {sub.content && <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-800 p-3 text-xs text-slate-300">{sub.content}</pre>}
              {sub.gitUrl && <p className="mt-2 text-sm"><span className="text-slate-500">Git:</span> <a href={sub.gitUrl} className="text-brand-400" target="_blank" rel="noreferrer">{sub.gitUrl}</a></p>}
              {sub.instructions && <p className="mt-2 text-sm text-slate-400">{sub.instructions}</p>}

              {sub.comments?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {sub.comments.map((c) => (
                    <div key={c.id} className="rounded bg-slate-800/50 px-3 py-2 text-sm text-slate-400">
                      <MessageSquare className="mr-1 inline h-3 w-3" /> {c.comment}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                <textarea className="input" placeholder="Commentaire (optionnel)" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
                <div className="flex flex-wrap gap-4 text-sm">
                  {['lint', 'tests', 'readme'].map((k) => (
                    <label key={k} className="flex items-center gap-2">
                      <input type="checkbox" checked={checklist[k]} onChange={(e) => setChecklist({ ...checklist, [k]: e.target.checked })} />
                      Checklist: {k}
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => decide(sub.id, 'ACCEPTED')} className="btn-primary text-xs bg-emerald-700 hover:bg-emerald-800"><Check className="h-4 w-4" /> Accepter</button>
                  <button type="button" onClick={() => decide(sub.id, 'CHANGES_REQUESTED')} className="btn-secondary text-xs">Modifications</button>
                  <button type="button" onClick={() => decide(sub.id, 'REJECTED')} className="btn-secondary text-xs text-red-400"><X className="h-4 w-4" /> Refuser</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
