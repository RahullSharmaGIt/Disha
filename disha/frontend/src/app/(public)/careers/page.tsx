import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface PageProps {
  searchParams: Promise<{
    cluster?: string;
    stream?: string;
    q?: string;
  }>;
}

export default async function CareersPage({ searchParams }: PageProps) {
  const { cluster, stream, q } = await searchParams;

  const res = await apiClient.careers.list({ cluster, stream, q });
  const careers = (res.data?.careers || []) as any[];
  const clusters = (res.data?.clusters || []) as any[];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Careers in India
          </h1>
          <p className="mt-2 text-slate-600 text-base sm:text-lg">
            Discover prerequisites, educational pathways, and curated learning resources across 8 key sectors.
          </p>
        </div>

        {/* Search & Stream Filter Form */}
        <form method="GET" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Search careers by title, skills, or keywords (e.g. AI, Doctor, CA, Law)..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              name="stream"
              defaultValue={stream || ''}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Academic Streams</option>
              <option value="SCIENCE">Science Stream</option>
              <option value="COMMERCE">Commerce Stream</option>
              <option value="ARTS">Arts / Humanities</option>
            </select>

            {cluster && <input type="hidden" name="cluster" value={cluster} />}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              Filter
            </button>
            {(cluster || stream || q) && (
              <Link
                href="/careers"
                className="text-slate-500 hover:text-slate-800 text-sm px-3 py-2.5"
              >
                Reset
              </Link>
            )}
          </div>
        </form>

        {/* Cluster Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <Link
            href={`/careers${stream ? `?stream=${stream}` : ''}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              !cluster
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Clusters ({careers.length})
          </Link>
          {clusters.map((c) => {
            const isActive = cluster === c.slug;
            return (
              <Link
                key={c.id}
                href={`/careers?cluster=${c.slug}${stream ? `&stream=${stream}` : ''}${q ? `&q=${q}` : ''}`}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>

        {/* Results List */}
        {careers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-lg font-bold text-slate-900">No careers matched your search criteria</h3>
            <p className="text-slate-500 text-sm mt-1">Try clearing filters or searching for broader terms.</p>
            <Link
              href="/careers"
              className="inline-block mt-4 text-sm font-semibold text-blue-600 hover:underline"
            >
              Reset all filters
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => {
              return (
                <div
                  key={career.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col p-6 group"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                      {career.cluster?.name}
                    </span>
                    {career.averageDuration && (
                      <span className="text-xs text-slate-500 font-medium">
                        ⏱️ {career.averageDuration}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    <Link href={`/careers/${career.slug}`}>
                      {career.title}
                    </Link>
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                    {career.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium mr-1">Eligible:</span>
                      {career.eligibleStreams?.map((st: string) => (
                        <span
                          key={st}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                        >
                          {st}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 text-xs">
                      <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                        {career.resources?.length || 0} verified resources
                      </span>
                      <Link
                        href={`/careers/${career.slug}`}
                        className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Details &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Disha Career Guidance • Built for Class 9–12 Indian Students
        </div>
      </footer>
    </div>
  );
}
