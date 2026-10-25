'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currentClass: '10',
    stream: 'SCIENCE',
    parentEmail: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.auth.register(formData);

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to create account');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-black text-blue-600 mb-2">
            दिशा <span className="text-gray-800 text-lg font-bold">Disha</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create Student Account</h1>
          <p className="text-slate-500 text-xs mt-1">
            Personalized guidance & roadmaps for Class 9–12 students
          </p>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
              ✉️
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Parent Consent Sent!</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Under India&apos;s DPDPA guidelines for students aged 14–18, we sent a verification link to{' '}
              <strong>{formData.parentEmail}</strong>. Once approved, you can log in and view your personalized roadmap.
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors text-center"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Class</label>
                <select
                  value={formData.currentClass}
                  onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stream</label>
                <select
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SCIENCE">Science</option>
                  <option value="COMMERCE">Commerce</option>
                  <option value="ARTS">Arts</option>
                  <option value="UNDECIDED">Undecided</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Parent / Guardian Email</label>
                <span className="text-[11px] text-blue-600 font-medium">DPDPA 2023 Required</span>
              </div>
              <input
                type="email"
                required
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="parent@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                We will email a 1-click verification link to your parent for minor consent.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up for Disha'}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Already registered? </span>
              <Link href="/login" className="text-xs font-semibold text-blue-600 hover:underline">
                Log In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
