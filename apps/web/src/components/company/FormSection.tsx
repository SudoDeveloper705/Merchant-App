'use client';

import { ReactNode } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui';

interface FormSectionProps {
  title: string | ReactNode;
  subtitle?: string;
  children: ReactNode;
  readOnly?: boolean;
  action?: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  subtitle,
  children,
  readOnly = false,
  action,
  className = '',
}: FormSectionProps) {
  return (
    <Card className={className}>
      <CardHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              {typeof title === 'string' ? (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              ) : (
                <div className="text-lg font-semibold text-gray-900">{title}</div>
              )}
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            {readOnly && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Read Only
              </span>
            )}
            {action && <div>{action}</div>}
          </div>
        }
      />
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

