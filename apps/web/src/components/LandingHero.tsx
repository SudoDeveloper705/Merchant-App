'use client';

import { useRouter } from 'next/navigation';

export function LandingHero() {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Financial SaaS Platform
            <span className="block text-blue-600 mt-2">Built for Merchants</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your financial operations with automated revenue splits, 
            partner management, and comprehensive reporting. Built for modern businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/signup')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/login')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

