'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

interface Submission {
  id: string;
  entityType: 'CAREER' | 'RESOURCE';
  action: 'CREATE' | 'UPDATE';
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
  submittedData: any;
  reviewNotes: string | null;
  submittedAt: string;
  submitter: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  reviewer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export default function ModerationQueuePage() {
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'>('PENDING');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const loadSubmissions = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/moderation?status=${status}`);
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(filter);
  }, [filter]);

  const handleDecision = async (submissionId: string, decision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED') => {
    setActionLoading(submissionId);
    setMessage(null);

    try {
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          decision,
          reviewNotes: reviewNotes[submissionId] || '',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage(`Submission successfully marked as ${decision}!`);
        loadSubmissions(filter);
      } else {
        setMessage(json.error || 'Failed to update submission');
      }
    } catch (err) {
      setMessage('A network error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Editorial Control
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Moderation Queue
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review and verify career descriptions, educational prerequisites, and learning resources before public release.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/careers"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Live Catalog
            </Link>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium">
            {message}
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-8 overflow-x-auto">
          {(['PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            );
          })}
        </div>

        {/* Queue List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Loading moderation items...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <span className="text-3xl mb-2 block">✨</span>
            <h3 className="text-lg font-bold text-slate-900">Queue is Clear</h3>
            <p className="text-slate-500 text-sm mt-1">No items under {filter.replace('_', ' ').toLowerCase()}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((sub) => {
              const data = sub.submittedData;
              const isActioning = actionLoading === sub.id;

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col gap-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                        {sub.entityType}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Submitted by: <strong className="text-slate-800">{sub.submitter.name || sub.submitter.email}</strong> ({sub.submitter.role})
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      {new Date(sub.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Submission Content Payload Preview */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {data.title || 'Untitled Submission'}
                    </h3>
                    {data.slug && (
                      <p className="text-xs text-slate-500 mb-3">
                        Slug: <code className="bg-white px-1.5 py-0.5 rounded border">{data.slug}</code>
                      </p>
                    )}
                    {data.description && (
                      <p className="text-slate-700 text-sm mb-4 leading-relaxed whitespace-pre-line">
                        {data.description}
                      </p>
                    )}

                    {data.prerequisites && (
                      <div className="mb-3">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                          Prerequisites:
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                          {data.prerequisites.map((p: string, idx: number) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.url && (
                      <div className="text-xs">
                        <span className="font-semibold text-slate-700">URL: </span>
                        <a
                          href={data.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {data.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Review Notes & Actions */}
                  {filter === 'PENDING' && (
                    <div className="flex flex-col gap-3 pt-2">
                      <textarea
                        value={reviewNotes[sub.id] || ''}
                        onChange={(e) =>
                          setReviewNotes({ ...reviewNotes, [sub.id]: e.target.value })
                        }
                        placeholder="Add review feedback, required corrections, or approval notes for the contributor..."
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />

                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleDecision(sub.id, 'REJECTED')}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleDecision(sub.id, 'CHANGES_REQUESTED')}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-800 hover:bg-amber-50 border border-amber-300 transition-colors disabled:opacity-50"
                        >
                          Request Changes
                        </button>
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleDecision(sub.id, 'APPROVED')}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isActioning ? 'Publishing...' : '✓ Approve & Publish'}
                        </button>
                      </div>
                    </div>
                  )}

                  {sub.reviewNotes && (
                    <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-700 border border-slate-200">
                      <strong>Moderator Notes: </strong> {sub.reviewNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
