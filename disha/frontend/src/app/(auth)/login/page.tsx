'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-black text-blue-600 mb-2">
            दिशा <span className="text-gray-800 text-lg font-bold">Disha</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-xs mt-1">
            Log in to view your career matches and saved pathways
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
          <span className="font-bold text-slate-800 block mb-1">🔑 Demo Accounts:</span>
          <div className="flex justify-between items-center py-0.5">
            <span>Admin: <code className="text-blue-700">admin@disha.app</code></span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@disha.app');
                setPassword('Admin@12345');
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Fill
            </button>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span>Moderator: <code className="text-blue-700">moderator@disha.app</code></span>
            <button
              type="button"
              onClick={() => {
                setEmail('moderator@disha.app');
                setPassword('Mod@12345');
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Fill
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Don&apos;t have an account yet? </span>
            <Link href="/register" className="text-xs font-semibold text-blue-600 hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
