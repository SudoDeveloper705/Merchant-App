'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui';

export default function MaintenancePage() {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    // Simulate maintenance countdown
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Maintenance complete');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">We'll be back soon</h1>
            <p className="text-gray-600 mb-4">
              We're currently performing scheduled maintenance to improve your experience.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              We expect to be back online shortly. Thank you for your patience.
            </p>
            {timeRemaining && (
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">
                    Estimated time remaining: {timeRemaining}
                  </span>
                </div>
              </div>
            )}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">What's happening?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• System updates and improvements</li>
                <li>• Database optimization</li>
                <li>• Security enhancements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

