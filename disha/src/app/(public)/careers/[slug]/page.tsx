import prisma from '@/lib/prisma';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentStatus } from '@prisma/client';
import { RIASEC_DIMENSIONS } from '@/constants/riasec';


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CareerDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const career = await prisma.career.findUnique({
    where: { slug },
    include: {
      cluster: true,
      resources: {
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!career || career.status !== ContentStatus.PUBLISHED) {
    notFound();
  }

  const relatedCareers = await prisma.career.findMany({
    where: {
      clusterId: career.clusterId,
      id: { not: career.id },
      status: ContentStatus.PUBLISHED,
    },
    take: 3,
  });

  const prereqs = Array.isArray(career.prerequisites)
    ? (career.prerequisites as string[])
    : [];

  const riasecScores = [
    { key: 'realistic', label: RIASEC_DIMENSIONS.realistic.label, score: career.riasecRealistic },
    { key: 'investigative', label: RIASEC_DIMENSIONS.investigative.label, score: career.riasecInvestigative },
    { key: 'artistic', label: RIASEC_DIMENSIONS.artistic.label, score: career.riasecArtistic },
    { key: 'social', label: RIASEC_DIMENSIONS.social.label, score: career.riasecSocial },
    { key: 'enterprising', label: RIASEC_DIMENSIONS.enterprising.label, score: career.riasecEnterprising },
    { key: 'conventional', label: RIASEC_DIMENSIONS.conventional.label, score: career.riasecConventional },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/careers" className="hover:text-slate-900 transition-colors">Careers</Link>
          <span>/</span>
          <Link
            href={`/careers?cluster=${career.cluster.slug}`}
            className="hover:text-slate-900 transition-colors"
          >
            {career.cluster.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate">{career.title}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              {career.cluster.name}
            </span>
            {career.averageDuration && (
              <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                ⏱️ Education: {career.averageDuration}
              </span>
            )}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs text-slate-400 font-medium">Eligible Streams:</span>
              {career.eligibleStreams.map((st) => (
                <span
                  key={st}
                  className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/50"
                >
                  {st}
                </span>
              ))}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {career.title}
          </h1>

          <p className="mt-6 text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
            {career.description}
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              Curious if this career fits your personal strengths?
            </div>
            <Link
              href="/quiz"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
            >
              Take Assessment Quiz &rarr;
            </Link>
          </div>
        </div>

        {/* Prerequisites & RIASEC Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Prerequisites */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <span>📋</span> Requirements & Prerequisites
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Standard eligibility, subject selections, and competitive entrance exam paths in India.
            </p>
            <ul className="space-y-3.5">
              {prereqs.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-slate-700 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Personality Alignment (RIASEC Profile) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <span>🧠</span> Holland Codes (RIASEC) Profile
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              How this career aligns with foundational aptitude and personality dimensions.
            </p>
            <div className="space-y-4">
              {riasecScores.map((dim) => (
                <div key={dim.key}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-700">{dim.label}</span>
                    <span className="text-slate-500">{dim.score} / 10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(dim.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Learning Resources */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm mb-12">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📚</span> Verified Learning Resources ({career.resources.length})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Curated courses, reference books, tutorials, and platforms to start exploring now.
              </p>
            </div>
          </div>

          {career.resources.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No learning resources added yet. Community submissions are currently being reviewed.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {career.resources.map((res) => {
                const costBadge = {
                  FREE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  PAID: 'bg-amber-50 text-amber-700 border-amber-200',
                  FREEMIUM: 'bg-blue-50 text-blue-700 border-blue-200',
                }[res.cost];

                return (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {res.type}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${costBadge}`}>
                          {res.cost}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {res.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>{res.platform || 'Online Resource'}</span>
                      <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Open Link &rarr;
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Related Careers */}
        {relatedCareers.length > 0 && (
          <div className="pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Other Paths in {career.cluster.name}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedCareers.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/careers/${rel.slug}`}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <h3 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                    {rel.title}
                  </h3>
                  {rel.averageDuration && (
                    <span className="text-xs text-slate-400 mt-1 block">
                      ⏱️ {rel.averageDuration}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
