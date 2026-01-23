'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui';

export default function MaintenancePage() {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate maintenance countdown
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Maintenance complete');
        setIsComplete(true);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-dark flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-gray-200 dark:border-slate-700/50 shadow-lg dark:shadow-dark-xl">
        <CardContent className="p-8 md:p-10">
          <div className="text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 dark:bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                <div className="relative p-5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <svg
                    className="h-16 w-16 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {isComplete ? 'We\'re Back!' : 'We\'ll be back soon'}
            </h1>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-slate-300 mb-2 text-base">
              {isComplete 
                ? 'Maintenance has been completed successfully. The system is now back online.'
                : 'We\'re currently performing scheduled maintenance to improve your experience.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
              {isComplete 
                ? 'Thank you for your patience. You can now continue using the application.'
                : 'We expect to be back online shortly. Thank you for your patience.'}
            </p>

            {/* Countdown Timer */}
            {timeRemaining && !isComplete && (
              <div className="mb-8">
                <div className="inline-flex items-center px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg shadow-sm dark:shadow-glow">
                  <svg 
                    className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 animate-spin" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Estimated time remaining
                    </div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-300">
                      {timeRemaining}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Badge */}
            {isComplete && (
              <div className="mb-8">
                <div className="inline-flex items-center px-6 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg shadow-sm">
                  <svg 
                    className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <span className="text-sm font-semibold text-green-900 dark:text-green-300">
                    All systems operational
                  </span>
                </div>
              </div>
            )}

            {/* What's Happening */}
            <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg p-6 text-left mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg 
                  className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                What's happening?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">•</span>
                  <span>System updates and improvements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">•</span>
                  <span>Database optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">•</span>
                  <span>Security enhancements</span>
                </li>
              </ul>
            </div>

            {/* Refresh Button */}
            {isComplete && (
              <button
                onClick={() => window.location.reload()}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm dark:shadow-glow transition-all duration-200"
              >
                Refresh Page
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

