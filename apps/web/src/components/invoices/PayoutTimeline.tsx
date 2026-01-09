'use client';

import { formatDate, formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui';

interface PayoutEvent {
  id: string;
  date: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  amount: number;
  description: string;
  currency?: string;
}

interface PayoutTimelineProps {
  events: PayoutEvent[];
  className?: string;
}

export function PayoutTimeline({ events, className = '' }: PayoutTimelineProps) {
  const getStatusBadge = (status: PayoutEvent['status']) => {
    const variants = {
      scheduled: 'info' as const,
      processing: 'warning' as const,
      completed: 'success' as const,
      failed: 'error' as const,
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status: PayoutEvent['status']) => {
    const icons = {
      scheduled: '📅',
      processing: '⏳',
      completed: '✓',
      failed: '✕',
    };
    return icons[status] || '○';
  };

  return (
    <div className={className}>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex items-start space-x-4">
              {/* Timeline Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300">
                  <span className="text-sm">{getStatusIcon(event.status)}</span>
                </div>
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getStatusBadge(event.status)}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(event.amount, event.currency)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(event.date, 'long')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

