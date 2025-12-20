'use client';

import { useRouter } from 'next/navigation';

export function LandingCTA() {
  const router = useRouter();

  return (
    <section className="bg-blue-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join merchants who are already streamlining their financial operations
        </p>
        <button
          onClick={() => router.push('/signup')}
          className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Start Free Trial
        </button>
      </div>
    </section>
  );
}

