'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: 'default' | 'minimal' | 'illustrated';
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '',
  variant = 'default'
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="w-16 h-16 text-gray-400 dark:text-slate-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  if (variant === 'minimal') {
    return (
      <div className={`text-center py-8 ${className}`}>
        {icon && <div className="mb-3 flex justify-center text-gray-400 dark:text-slate-500">{icon}</div>}
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  if (variant === 'illustrated') {
    return (
      <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
        <div className="mb-6 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-full">
          {icon || defaultIcon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-6 max-w-md mx-auto text-center leading-relaxed">
            {description}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="mb-6 flex justify-center">
        {icon || (
          <div className="p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg">
            {defaultIcon}
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

