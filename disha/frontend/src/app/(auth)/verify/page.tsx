'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No verification token provided in the link.');
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        const res = await apiClient.auth.verifyConsent(token!);
        if (res.success) {
          setSuccess(true);
          setStudentName((res as any).studentName || null);
        } else {
          setError(res.error || 'Verification failed');
        }
      } catch (err) {
        setError('An unexpected network error occurred.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  if (loading) {
    return (
      <div>
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Verifying parental consent...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Consent Verified!</h1>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Thank you! Verified parental consent has been successfully recorded for{' '}
          <strong>{studentName || 'your child'}</strong> in compliance with the Digital Personal Data Protection Act (DPDPA).
        </p>
        <Link
          href="/login"
          className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm"
        >
          Continue to Student Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
        ✕
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h1>
      <p className="text-slate-600 text-sm mb-6">{error}</p>
      <Link
        href="/login"
        className="inline-block w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl text-sm transition-colors"
      >
        Back to Login
      </Link>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
        <Link href="/" className="inline-block text-2xl font-black text-blue-600 mb-6">
          दिशा <span className="text-gray-800 text-lg font-bold">Disha</span>
        </Link>
        <Suspense fallback={<p className="text-slate-500 text-sm">Loading verification...</p>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
