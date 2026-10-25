import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { RIASEC_DIMENSIONS } from '@/constants/riasec';


export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      recommendations: {
        include: {
          career: {
            include: {
              cluster: true,
              resources: true,
            },
          },
        },
        orderBy: { matchScore: 'desc' },
      },
      quizResponses: {
        orderBy: { completedAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const latestQuiz = user.quizResponses[0];
  const riasecProfile = latestQuiz?.riasecScore as Record<string, number> | null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                {user.role}
              </span>
              {user.parentConsentVerified ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ✓ Parental Consent Verified (DPDPA)
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  ⏳ Parental Consent Pending
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Welcome back, {user.name || 'Student'}!
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Class: <span className="font-semibold text-slate-800">{user.currentClass || 'Not set'}</span> • Stream:{' '}
              <span className="font-semibold text-slate-800">{user.stream || 'Undecided'}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/quiz"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              {latestQuiz ? 'Retake Quiz' : 'Take Career Quiz'}
            </Link>
            {user.role === 'ADMIN' && (
              <Link
                href="/admin/moderation"
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* RIASEC Profile Box (if quiz taken) */}
        {riasecProfile && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Your Personality & Aptitude Breakdown</h2>
            <p className="text-xs text-slate-500 mb-6">
              Normalized Holland Codes (RIASEC) traits computed from your latest assessment.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(riasecProfile).map(([key, score]) => {
                const dim = RIASEC_DIMENSIONS[key as keyof typeof RIASEC_DIMENSIONS];
                return (
                  <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-xs text-slate-500 block truncate">{dim?.label.split(' ')[0] || key}</span>
                    <span className="text-2xl font-black text-blue-600 my-1 block">{score}%</span>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Personalized Career Matches ({user.recommendations.length})
          </h2>

          {user.recommendations.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <span className="text-4xl mb-3 block">🧭</span>
              <h3 className="text-lg font-bold text-slate-900">No career recommendations yet</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6">
                Take our 3-minute RIASEC career quiz to receive evidence-backed matches and tailored pathways.
              </p>
              <Link
                href="/quiz"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm inline-block"
              >
                Start Career Quiz
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {user.recommendations.map((rec) => {
                const reasoning = rec.reasoning as any;
                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          {rec.career.cluster.name}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {rec.matchScore}% Match
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        <Link href={`/careers/${rec.career.slug}`}>{rec.career.title}</Link>
                      </h3>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {rec.career.description}
                      </p>

                      {reasoning?.summary && (
                        <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                          <span className="font-semibold text-slate-900">Why matched: </span>
                          {reasoning.summary}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        {rec.career.resources.length} verified learning links
                      </span>
                      <Link
                        href={`/careers/${rec.career.slug}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Explore Guide &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
