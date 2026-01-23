'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui';

export default function ErrorPage() {
  const router = useRouter();

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
              Something went wrong
            </h1>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-slate-300 mb-2 text-base">
              We encountered an unexpected error. Don't worry, our team has been notified and is working on it.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
              Please try again in a few moments, or contact support if the problem persists.
            </p>

            {/* Info Box */}
            <div className="mb-8 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg p-4 text-left">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0"
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
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Need immediate help?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Contact support at{' '}
                    <a
                      href="mailto:support@merchantapp.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      support@merchantapp.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/merchant/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm dark:shadow-glow"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

