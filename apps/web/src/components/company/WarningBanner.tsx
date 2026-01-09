'use client';

import { ReactNode } from 'react';

interface WarningBannerProps {
  type: 'warning' | 'error' | 'info' | 'legal';
  title: string;
  children: ReactNode;
  className?: string;
}

export function WarningBanner({ type, title, children, className = '' }: WarningBannerProps) {
  const styles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    legal: 'bg-amber-50 border-amber-200 text-amber-900',
  };

  const icons = {
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    legal: '⚖️',
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[type]} ${className}`}>
      <div className="flex items-start space-x-3">
        <span className="text-xl flex-shrink-0">{icons[type]}</span>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

