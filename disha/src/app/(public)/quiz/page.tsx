'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { RIASEC_DIMENSIONS } from '@/constants/riasec';

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  questionText: string;
  orderIndex: number;
  options: QuestionOption[];
}

interface Recommendation {
  careerId: string;
  title: string;
  slug: string;
  description: string;
  cluster: { id: string; name: string; slug: string };
  matchScore: number;
  reasoning: {
    matchedDimensions: string[];
    streamCompatible: boolean;
    topStrengths: string[];
    summary: string;
  };
}

export default function QuizPage() {
  const [loading, setLoading] = useState(true);
  const [versionId, setVersionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    profile: Record<string, number>;
    recommendations: Recommendation[];
    isAuthenticated: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch('/api/quiz');
        const json = await res.json();
        if (json.success) {
          setVersionId(json.data.versionId);
          setQuestions(json.data.questions);
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, []);

  const handleSelectOption = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    // Auto-advance after small delay for smooth feel
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 250);
    }
  };

  const handleSubmit = async () => {
    if (!versionId) return;
    setSubmitting(true);

    const payloadResponses = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      selectedValues: [value],
    }));

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId,
          responses: payloadResponses,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Preparing your career assessment...</p>
        </div>
      </div>
    );
  }

  // Results View
  if (results) {
    const sortedTraits = Object.entries(results.profile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm mb-10 text-center">
            <span className="text-4xl">🎉</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Your Career Match Profile
            </h1>
            <p className="mt-2 text-slate-600 text-base max-w-2xl mx-auto">
              Based on your answers across Holland Codes (RIASEC) aptitude dimensions, here are the top careers tailored for you:
            </p>

            {/* Top Traits Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {sortedTraits.map(([key, score]) => {
                const dim = RIASEC_DIMENSIONS[key as keyof typeof RIASEC_DIMENSIONS];
                return (
                  <span
                    key={key}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 text-sm font-semibold border border-blue-200/50"
                  >
                    ⭐ {dim ? dim.label : key}: {score}%
                  </span>
                );
              })}
            </div>

            {!results.isAuthenticated && (
              <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-left max-w-2xl mx-auto">
                <div>
                  <span className="font-bold block">Save your recommendations?</span>
                  Create a student account with parental consent to bookmark careers, track resources, and review recommendations anytime.
                </div>
                <Link
                  href="/register"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl whitespace-nowrap shadow-sm text-xs"
                >
                  Create Student Account
                </Link>
              </div>
            )}
          </div>

          {/* Recommendations List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Top Career Recommendations ({results.recommendations.length})
            </h2>

            {results.recommendations.map((rec, idx) => (
              <div
                key={rec.careerId}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {rec.cluster.name}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      🎯 {rec.matchScore}% Match
                    </span>
                    {!rec.reasoning.streamCompatible && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        ⚠️ Stream Transition Required
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    <Link href={`/careers/${rec.slug}`}>{rec.title}</Link>
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {rec.description}
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                    <span className="font-semibold text-slate-900">Why matched: </span>
                    {rec.reasoning.summary}
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <Link
                    href={`/careers/${rec.slug}`}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    View Career Guide &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => {
                setResults(null);
                setCurrentIndex(0);
                setAnswers({});
              }}
              className="text-slate-500 hover:text-slate-800 text-sm font-semibold underline"
            >
              Retake the Assessment
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Active Question View
  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCurrentAnswered = currentQ && answers[currentQ.id];
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm flex flex-col">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-6">
              {currentQ.questionText}
            </h2>

            <div className="space-y-3 mb-8">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.value)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between text-sm sm:text-base font-medium ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
              >
                &larr; Previous
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Matching Careers...' : 'See My Matches 🚀'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={!isCurrentAnswered}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-40"
                >
                  Next &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
