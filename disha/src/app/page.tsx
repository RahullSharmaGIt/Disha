import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <span>दिशा</span>
            <span className="text-gray-700 text-lg font-normal">Disha</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/careers"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Explore Careers
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            <span>🎓 Built for Indian High School Students (Class 9–12)</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
            Find Your <span className="text-blue-600">Direction</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            Unsure whether to pick Science, Commerce, or Arts? Exploring college options after 12th?
            Take an evidence-based assessment to discover realistic career paths, eligibility, and vetted learning resources.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quiz"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
            >
              Take 3-Min Career Quiz
            </Link>
            <Link
              href="/careers"
              className="bg-white text-gray-700 px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              Browse 50+ Careers
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold">
              🎯
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              RIASEC Career Matching
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Based on the globally validated Holland Codes framework. We evaluate your realistic, investigative, artistic, social, enterprising, and conventional affinities without confusing psychobabble.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold">
              📚
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Curated Free & Paid Resources
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Every career profile links to free YouTube lectures, open-source roadmaps, entrance exam guides, and accredited online courses verified by mentors.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              DPDPA Compliant & Safe
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Browse anonymously with zero tracking. For minor accounts, parent email verification is built-in. No behavioral ads, no dark patterns, no selling student data.
            </p>
          </div>
        </div>
      </section>

      {/* 8 Career Clusters Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200/60">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Explore Across 8 Career Clusters</h2>
          <p className="mt-2 text-gray-600">From STEM to Creative Arts, Law, and Public Administration</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Engineering & Tech', slug: 'engineering-technology', icon: '💻' },
            { name: 'Medicine & Healthcare', slug: 'medicine-healthcare', icon: '🩺' },
            { name: 'Business & Commerce', slug: 'business-commerce', icon: '📈' },
            { name: 'Law & Legal Studies', slug: 'law', icon: '⚖️' },
            { name: 'Design & Architecture', slug: 'design', icon: '🎨' },
            { name: 'Civil & Govt Services', slug: 'government-civil-services', icon: '🏛️' },
            { name: 'Data Science & AI', slug: 'data-science-ai', icon: '🤖' },
            { name: 'Creative Arts & Media', slug: 'creative-arts-media', icon: '🎬' },
          ].map((cluster) => (
            <Link
              key={cluster.slug}
              href={`/careers?cluster=${cluster.slug}`}
              className="p-5 bg-white rounded-xl border border-gray-200/80 hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cluster.icon}</span>
              <span className="font-semibold text-gray-800 text-sm">{cluster.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Disha (दिशा). Open, evidence-based career navigation for Indian students.
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/careers" className="hover:text-blue-600">Careers</Link>
            <Link href="/quiz" className="hover:text-blue-600">Quiz</Link>
            <Link href="/login" className="hover:text-blue-600">Student Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
