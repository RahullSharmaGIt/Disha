'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';

type SubmissionType = 'CAREER' | 'RESOURCE';

interface CareerOption {
  id: string;
  title: string;
  slug: string;
  cluster?: {
    name: string;
  };
}

export default function ContributorPortalPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.backendToken;

  const [activeTab, setActiveTab] = useState<SubmissionType>('CAREER');
  const [clusters, setClusters] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [careers, setCareers] = useState<CareerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  // Form state for Resource submission
  const [resourceForm, setResourceForm] = useState({
    careerId: '',
    title: '',
    url: '',
    type: 'COURSE' as 'COURSE' | 'BOOK' | 'VIDEO' | 'ARTICLE' | 'TOOL' | 'WEBSITE',
    cost: 'FREE' as 'FREE' | 'PAID' | 'FREEMIUM',
    platform: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [clustersRes, careersRes] = await Promise.all([
          apiClient.careers.clusters(),
          apiClient.careers.list(),
        ]);

        if (clustersRes.success && Array.isArray(clustersRes.data)) {
          setClusters(clustersRes.data);
          if (clustersRes.data.length > 0) {
            setCareerForm((prev) => ({ ...prev, clusterId: clustersRes.data![0].id }));
          }
        }

        if (careersRes.success && careersRes.data?.careers) {
          const fetchedCareers = careersRes.data.careers as CareerOption[];
          setCareers(fetchedCareers);
          if (fetchedCareers.length > 0) {
            setResourceForm((prev) => ({ ...prev, careerId: fetchedCareers[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load clusters or careers:', err);
      }
    }
    loadData();
  }, []);

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setCareerForm((prev) => ({ ...prev, title: val, slug }));
  };

  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!token) {
      setMessage({ text: 'You must be logged in as an Admin or Contributor to submit content.', type: 'error' });
      setLoading(false);
      return;
    }

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
      const res = await apiClient.contributors.submit(payload, token);

      if (res.success) {
        setMessage({
          text: 'Career submitted successfully! It has been placed in the moderation queue for review.',
          type: 'success',
        });
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
        setMessage({ text: res.error || 'Failed to submit career', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'A network error occurred while submitting.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!token) {
      setMessage({ text: 'You must be logged in as an Admin or Contributor to submit content.', type: 'error' });
      setLoading(false);
      return;
    }

    if (!resourceForm.careerId) {
      setMessage({ text: 'Please select a target career for this learning resource.', type: 'error' });
      setLoading(false);
      return;
    }

    const selectedCareer = careers.find((c) => c.id === resourceForm.careerId);
    const payload = {
      entityType: 'RESOURCE',
      data: {
        careerId: resourceForm.careerId,
        careerTitle: selectedCareer?.title || 'Unknown Career',
        careerSlug: selectedCareer?.slug || '',
        title: resourceForm.title,
        url: resourceForm.url,
        type: resourceForm.type,
        cost: resourceForm.cost,
        platform: resourceForm.platform || null,
      },
    };

    try {
      const res = await apiClient.contributors.submit(payload, token);

      if (res.success) {
        setMessage({
          text: 'Learning resource submitted successfully! It has been placed in the moderation queue for review.',
          type: 'success',
        });
        setResourceForm({
          careerId: careers[0]?.id || '',
          title: '',
          url: '',
          type: 'COURSE',
          cost: 'FREE',
          platform: '',
        });
      } else {
        setMessage({ text: res.error || 'Failed to submit resource', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'A network error occurred while submitting.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
              Contributor Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Author Community Content
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Contribute evidence-based career pathways or recommend verified learning resources for Indian high school students.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex items-center gap-3 p-1.5 bg-slate-200/80 rounded-2xl mb-8 w-fit">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CAREER');
              setMessage(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'CAREER'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎓</span>
            <span>Career Pathway</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('RESOURCE');
              setMessage(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'RESOURCE'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📚</span>
            <span>Learning Resource</span>
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl text-sm font-medium border shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {message.type === 'success' ? '✓ ' : '✕ '}
            {message.text}
          </div>
        )}

        {/* CAREER SUBMISSION FORM */}
        {activeTab === 'CAREER' ? (
          <form onSubmit={handleCareerSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4 mb-2">
              <h2 className="text-lg font-bold text-slate-900">Career Information</h2>
              <p className="text-xs text-slate-500">Provide the core title, cluster, overview, and prerequisites for this career.</p>
            </div>

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
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Submitting for Review...' : 'Submit Career for Review'}
              </button>
            </div>
          </form>
        ) : (
          /* RESOURCE SUBMISSION FORM */
          <form onSubmit={handleResourceSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4 mb-2">
              <h2 className="text-lg font-bold text-slate-900">Learning Resource Information</h2>
              <p className="text-xs text-slate-500">Recommend an accredited course, reference book, lecture series, or portal for an existing career.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Career Pathway <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={resourceForm.careerId}
                onChange={(e) => setResourceForm({ ...resourceForm, careerId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {careers.length === 0 ? (
                  <option value="">Loading careers...</option>
                ) : (
                  careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} {c.cluster ? `(${c.cluster.name})` : ''}
                    </option>
                  ))
                )}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Select the career profile this resource should be attached to.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  placeholder="e.g. NPTEL Aerospace Engineering Lectures"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Platform / Source Name
                </label>
                <input
                  type="text"
                  value={resourceForm.platform}
                  onChange={(e) => setResourceForm({ ...resourceForm, platform: e.target.value })}
                  placeholder="e.g. NPTEL, YouTube, Coursera, NCERT"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resource URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={resourceForm.url}
                onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                placeholder="https://nptel.ac.in/courses/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Type</label>
                <select
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="COURSE">Online Course / Specialization</option>
                  <option value="VIDEO">Video Series / Lecture</option>
                  <option value="BOOK">Textbook / Reference Guide</option>
                  <option value="ARTICLE">Article / Roadmap</option>
                  <option value="TOOL">Interactive Tool / Simulator</option>
                  <option value="WEBSITE">Official Portal / Website</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Structure</label>
                <select
                  value={resourceForm.cost}
                  onChange={(e) => setResourceForm({ ...resourceForm, cost: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FREE">Free (100% Free Access)</option>
                  <option value="FREEMIUM">Freemium (Free Tier Available)</option>
                  <option value="PAID">Paid (Subscription / Course Fee)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link href="/admin/moderation" className="text-xs text-slate-500 hover:text-slate-800">
                &larr; View Moderation Queue
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Submitting Resource...' : 'Submit Resource for Review'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
