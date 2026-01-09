'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Pagination } from '@/components/ui';
import { mockDashboardService, Alert } from '@/services/mockDashboard';
import { formatDate } from '@/lib/format';
import Link from 'next/link';

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await mockDashboardService.getNotifications(page, limit);
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    if (unreadCount > 0) {
      setUnreadCount(unreadCount - 1);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    const variants: Record<Alert['severity'], 'success' | 'warning' | 'error' | 'info'> = {
      success: 'success',
      warning: 'warning',
      error: 'error',
      info: 'info',
    };
    return variants[severity] || 'default';
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
    };
    return icons[severity] || '📢';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications & Alerts</h1>
            <p className="mt-1 text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader
            title="All Notifications"
            subtitle={`${notifications.length} total`}
          />
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-4 rounded-lg border transition-colors
                      ${!notification.read
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 text-2xl">
                        {getSeverityIcon(notification.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getSeverityBadge(notification.severity)}>
                              {notification.severity}
                            </Badge>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary-600"></span>
                            )}
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {formatDate(notification.timestamp, 'relative')}
                          </p>
                          {notification.actionUrl && (
                            <Link href={notification.actionUrl}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

