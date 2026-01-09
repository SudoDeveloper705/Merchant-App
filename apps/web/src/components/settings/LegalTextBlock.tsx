'use client';

import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';

interface LegalTextBlockProps {
  title: string;
  lastUpdated: string;
  content: string;
  onAccept?: () => void;
  accepted?: boolean;
  className?: string;
}

export function LegalTextBlock({
  title,
  lastUpdated,
  content,
  onAccept,
  accepted = false,
  className = '',
}: LegalTextBlockProps) {
  return (
    <Card className={className}>
      <CardHeader
        title={title}
        subtitle={`Last updated: ${new Date(lastUpdated).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`}
      />
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {content}
            </pre>
          </div>
        </div>
        {onAccept && (
          <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {accepted && (
                <span className="inline-flex items-center text-sm text-green-600">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Accepted
                </span>
              )}
            </div>
            <Button
              onClick={onAccept}
              variant={accepted ? 'outline' : 'primary'}
              disabled={accepted}
            >
              {accepted ? 'Accepted' : 'Accept Terms'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

