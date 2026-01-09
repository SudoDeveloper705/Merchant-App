'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingHero } from '@/components/LandingHero';
import { LandingFeatures } from '@/components/LandingFeatures';
import { LandingCTA } from '@/components/LandingCTA';
import { LandingFooter } from '@/components/LandingFooter';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user && !redirecting) {
      setRedirecting(true);
      router.push('/merchant/dashboard');
    }
  }, [user, loading, router, redirecting]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user exists, show loading while redirecting
  if (user || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-grow">
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
