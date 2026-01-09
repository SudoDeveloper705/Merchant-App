'use client';

import { Badge } from '@/components/ui';

interface PaymentStatusBadgeProps {
  status: 'paid' | 'pending' | 'failed' | 'disputed' | 'refunded' | 'partial';
  className?: string;
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const statusConfig = {
    paid: {
      variant: 'success' as const,
      label: 'Paid',
      icon: '✓',
    },
    pending: {
      variant: 'warning' as const,
      label: 'Pending',
      icon: '⏳',
    },
    failed: {
      variant: 'error' as const,
      label: 'Failed',
      icon: '✕',
    },
    disputed: {
      variant: 'error' as const,
      label: 'Disputed',
      icon: '⚠️',
    },
    refunded: {
      variant: 'default' as const,
      label: 'Refunded',
      icon: '↩️',
    },
    partial: {
      variant: 'warning' as const,
      label: 'Partial',
      icon: '◐',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={className}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

