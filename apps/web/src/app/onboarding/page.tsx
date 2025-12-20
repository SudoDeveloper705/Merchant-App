'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">Onboarding</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Complete your account setup</p>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-600">Onboarding flow will be implemented here.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Skip to Login
          </button>
        </div>
      </div>
    </div>
  );
}

