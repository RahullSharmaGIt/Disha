'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const user = session?.user as any;
  const isAdminOrMod = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  const navLinks = [
    { href: '/careers', label: 'Explore Careers' },
    { href: '/quiz', label: 'Career Quiz' },
  ];

  return (
    <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-blue-600">दिशा</span>
          <span className="text-lg font-bold text-gray-800">Disha</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-5">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAdminOrMod && (
              <Link
                href="/admin/moderation"
                className={`text-sm font-semibold transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Moderation
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-16 h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-950'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-gray-950 px-3 py-1.5"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
