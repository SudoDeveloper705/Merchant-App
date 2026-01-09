'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`inline-block animate-spin rounded-full border-b-2 border-primary-600 ${sizes[size]}`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
}

