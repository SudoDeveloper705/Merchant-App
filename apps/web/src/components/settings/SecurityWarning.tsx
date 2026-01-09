'use client';

import { WarningBanner } from '@/components/company';

interface SecurityWarningProps {
  title: string;
  message: string;
  severity?: 'warning' | 'error' | 'info';
  className?: string;
}

export function SecurityWarning({
  title,
  message,
  severity = 'warning',
  className = '',
}: SecurityWarningProps) {
  return (
    <div className={className}>
      <WarningBanner type={severity} title={title}>
        {message}
      </WarningBanner>
    </div>
  );
}

