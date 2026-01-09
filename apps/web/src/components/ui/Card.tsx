'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', padding = 'md', hover = false, onClick }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-md transition-shadow' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: string | ReactNode;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function CardHeader({ title, subtitle, action, className = '', children }: CardHeaderProps) {
  // If children are provided, use them directly (backward compatibility)
  if (children) {
    return (
      <div className={`mb-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  // If no title and no children, return empty
  if (!title) {
    return null;
  }
  
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        {typeof title === 'string' ? (
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        ) : (
          <div className="text-lg font-semibold text-gray-900">{title}</div>
        )}
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

