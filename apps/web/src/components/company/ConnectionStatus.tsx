'use client';

import { Badge } from '@/components/ui';

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync?: string;
  className?: string;
}

export function ConnectionStatus({ status, lastSync, className = '' }: ConnectionStatusProps) {
  const statusConfig = {
    connected: {
      variant: 'success' as const,
      label: 'Connected',
      icon: '✓',
    },
    disconnected: {
      variant: 'default' as const,
      label: 'Disconnected',
      icon: '○',
    },
    pending: {
      variant: 'warning' as const,
      label: 'Pending',
      icon: '⏳',
    },
    error: {
      variant: 'error' as const,
      label: 'Error',
      icon: '✕',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge variant={config.variant}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
      {lastSync && status === 'connected' && (
        <span className="text-xs text-gray-500">
          Last sync: {new Date(lastSync).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

