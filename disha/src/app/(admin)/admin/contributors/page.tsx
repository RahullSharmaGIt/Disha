'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export default function ContributorPortalPage() {
  const [clusters, setClusters] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state for Career submission
  const [careerForm, setCareerForm] = useState({
    title: '',
    slug: '',
    clusterId: '',
    description: '',
    prerequisitesText: '',
    eligibleStreams: ['SCIENCE'],
    averageDuration: '',
  });

  useEffect(() => {
    async function fetchClusters() {
      try {
        const res = await fetch('/api/careers');
        const json = await res.json();
        if (json.success && json.data.clusters) {
          setClusters(json.data.clusters);
          if (json.data.clusters.length > 0) {
            setCareerForm((prev) => ({ ...prev, clusterId: json.data.clusters[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load clusters:', err);
      }
    }
    fetchClusters();
  }, []);

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setCareerForm((prev) => ({ ...prev, title: val, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const prerequisites = careerForm.prerequisitesText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const payload = {
      entityType: 'CAREER',
      data: {
        title: careerForm.title,
        slug: careerForm.slug,
        clusterId: careerForm.clusterId,
        description: careerForm.description,
        prerequisites,
        eligibleStreams: careerForm.eligibleStreams,
        averageDuration: careerForm.averageDuration,
      },
    };

    try {
      const res = await fetch('/api/contributors/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage('✅ Career submitted successfully! It has been placed in the moderation queue for review.');
        setCareerForm({
          title: '',
          slug: '',
          clusterId: clusters[0]?.id || '',
          description: '',
          prerequisitesText: '',
          eligibleStreams: ['SCIENCE'],
          averageDuration: '',
        });
      } else {
        setMessage(`❌ Error: ${json.error || 'Failed to submit'}`);
      }
    } catch (err) {
      setMessage('❌ A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
            Contributor Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
            Submit Career Pathway
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Author an evidence-based career roadmap for Indian students. Every submission is reviewed by moderators prior to public publication.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium shadow-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Career Title</label>
              <input
                type="text"
                required
                value={careerForm.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Environmental Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug</label>
              <input
                type="text"
                required
                value={careerForm.slug}
                onChange={(e) => setCareerForm({ ...careerForm, slug: e.target.value })}
                placeholder="e.g. environmental-engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Career Cluster</label>
              <select
                value={careerForm.clusterId}
                onChange={(e) => setCareerForm({ ...careerForm, clusterId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {clusters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Average Duration</label>
              <input
                type="text"
                value={careerForm.averageDuration}
                onChange={(e) => setCareerForm({ ...careerForm, averageDuration: e.target.value })}
                placeholder="e.g. 4 years (B.Tech) + 0-2 years"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description & Role Overview
            </label>
            <textarea
              required
              rows={4}
              value={careerForm.description}
              onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })}
              placeholder="Explain day-to-day responsibilities, industry scope, and the nature of work in India and globally..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prerequisites & Entrance Exams (One per line)
            </label>
            <textarea
              required
              rows={3}
              value={careerForm.prerequisitesText}
              onChange={(e) => setCareerForm({ ...careerForm, prerequisitesText: e.target.value })}
              placeholder="10+2 with Physics, Chemistry, Math&#10;JEE Main / State CET Exam&#10;B.Tech in Civil or Environmental Engineering"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Link href="/admin/moderation" className="text-xs text-slate-500 hover:text-slate-800">
              &larr; View Moderation Queue
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting for Review...' : 'Submit to Moderation Queue'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
