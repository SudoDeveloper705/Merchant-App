'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-dark flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-gray-200 dark:border-slate-700/50 shadow-lg dark:shadow-dark-xl">
        <CardContent className="p-8">
          <div className="text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                <svg
                  className="h-16 w-16 text-red-500 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Something went wrong!
            </h1>
            
            {/* Error Message */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-slate-300 font-mono break-words">
                {error.message || 'An unexpected error occurred'}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
              If this problem persists, please contact support with the error ID above.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm dark:shadow-glow"
              >
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
