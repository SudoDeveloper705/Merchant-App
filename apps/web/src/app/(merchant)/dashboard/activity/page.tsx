'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Table, TableColumn } from '@/components/ui';
import { Pagination } from '@/components/ui';
import { TableSkeleton } from '@/components/dashboard/SkeletonLoader';
import { mockDashboardService, ActivityItem } from '@/services/mockDashboard';
import { formatCurrency, formatDate } from '@/lib/format';

export default function ActivityFeedPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadActivities();
  }, [page]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await mockDashboardService.getActivityFeed(page, limit);
      setActivities(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: ActivityItem['type']) => {
    const icons = {
      transaction: '💰',
      payout: '💸',
      alert: '🔔',
      system: '⚙️',
    };
    return icons[type] || '📋';
  };

  const columns: TableColumn<ActivityItem>[] = [
    {
      header: 'Time',
      accessor: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatDate(row.timestamp, 'short')}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(row.timestamp, 'relative')}
          </div>
        </div>
      ),
    },
    {
      header: 'Activity',
      accessor: (row) => (
        <div className="flex items-center space-x-3">
          <span className="text-xl">{getTypeIcon(row.type)}</span>
          <div>
            <div className="font-medium text-gray-900">{row.title}</div>
            <div className="text-sm text-gray-500">{row.description}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => (
        <Badge variant="info">
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => row.amount ? (
        <span className="font-semibold text-gray-900">{formatCurrency(row.amount)}</span>
      ) : (
        <span className="text-gray-400">—</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => row.status ? (
        <Badge
          variant={
            row.status === 'completed' ? 'success' :
            row.status === 'pending' ? 'warning' : 'error'
          }
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ) : (
        <span className="text-gray-400">—</span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
          <p className="mt-1 text-sm text-gray-500">View all recent transactions and system activity</p>
        </div>

        {/* Activity Table */}
        <Card>
          <CardHeader title="Recent Activity" />
          <CardContent>
            {loading ? (
              <TableSkeleton rows={10} cols={5} />
            ) : (
              <>
                <Table
                  data={activities}
                  columns={columns}
                  emptyMessage="No activity found"
                />
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

