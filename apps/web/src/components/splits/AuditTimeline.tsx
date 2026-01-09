'use client';

import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui';

interface AuditEvent {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: 'created' | 'updated' | 'deleted' | 'adjusted' | 'approved' | 'rejected';
  entity: string;
  entityId: string;
  changes: Array<{
    field: string;
    oldValue: string | number | null;
    newValue: string | number | null;
  }>;
  reason?: string;
  ipAddress?: string;
}

interface AuditTimelineProps {
  events: AuditEvent[];
  className?: string;
}

export function AuditTimeline({ events, className = '' }: AuditTimelineProps) {
  const getActionBadge = (action: AuditEvent['action']) => {
    const variants = {
      created: 'success' as const,
      updated: 'info' as const,
      deleted: 'error' as const,
      adjusted: 'warning' as const,
      approved: 'success' as const,
      rejected: 'error' as const,
    };
    return variants[action] || 'default';
  };

  const getActionLabel = (action: AuditEvent['action']) => {
    const labels = {
      created: 'Created',
      updated: 'Updated',
      deleted: 'Deleted',
      adjusted: 'Adjusted',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[action] || action;
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
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                </div>
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getActionBadge(event.action)}>
                        {getActionLabel(event.action)}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">{event.entity}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{event.user.name}</span>
                      {' '}({event.user.email}) - {event.user.role}
                    </div>
                    {event.reason && (
                      <div className="text-sm text-gray-500 italic mb-2">
                        Reason: {event.reason}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <div>{formatDate(event.timestamp, 'long')}</div>
                    {event.ipAddress && (
                      <div className="mt-1 font-mono">{event.ipAddress}</div>
                    )}
                  </div>
                </div>

                {/* Changes */}
                {event.changes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-500 mb-2">Changes:</div>
                    <div className="space-y-1">
                      {event.changes.map((change, idx) => (
                        <div key={idx} className="text-xs text-gray-600 font-mono">
                          <span className="font-medium">{change.field}:</span>{' '}
                          <span className="text-red-600">{change.oldValue ?? 'null'}</span>
                          {' → '}
                          <span className="text-green-600">{change.newValue ?? 'null'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

