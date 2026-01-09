'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Table, TableColumn, Pagination } from '@/components/ui';
import { Button, Badge } from '@/components/ui';
import { mockUserService, ActivityLog, User } from '@/services/mockUsers';
import { formatDate } from '@/lib/format';

export default function UserActivityPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (params.id) {
      loadUser();
      loadActivityLogs();
    }
  }, [params.id, page]);

  const loadUser = async () => {
    try {
      const data = await mockUserService.getUser(params.id as string);
      setUser(data);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadActivityLogs = async () => {
    setLoading(true);
    try {
      const response = await mockUserService.getActivityLogs(params.id as string, page, 20);
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: ActivityLog['action']) => {
    const variants = {
      login: 'success' as const,
      logout: 'default' as const,
      create: 'info' as const,
      update: 'warning' as const,
      delete: 'error' as const,
      invite: 'info' as const,
      role_change: 'warning' as const,
    };
    return variants[action] || 'default';
  };

  const getActionLabel = (action: ActivityLog['action']) => {
    const labels = {
      login: 'Login',
      logout: 'Logout',
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      invite: 'Invited',
      role_change: 'Role Changed',
    };
    return labels[action] || action;
  };

  const columns: TableColumn<ActivityLog>[] = [
    {
      header: 'Timestamp',
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
      header: 'Action',
      accessor: (row) => (
        <Badge variant={getActionBadge(row.action)}>
          {getActionLabel(row.action)}
        </Badge>
      ),
    },
    {
      header: 'Entity',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.entity}</div>
          {row.entityId && (
            <div className="text-xs text-gray-500 font-mono">{row.entityId}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Details',
      accessor: (row) => (
        <span className="text-sm text-gray-600">{row.details}</span>
      ),
    },
    {
      header: 'IP Address',
      accessor: (row) => (
        <span className="text-xs font-mono text-gray-500">{row.ipAddress}</span>
      ),
    },
  ];

  if (loading && !user) {
    return (
      <MerchantLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/merchant/users')}
              className="mb-2"
            >
              ← Back to Users
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">User Activity Logs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Activity history for {user?.name || 'User'} (Read-only)
            </p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <Card>
            <CardHeader title="User Information" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
                  <p className="text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Role</p>
                  <p className="text-gray-900 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Activities</p>
                <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Logins</p>
                <p className="text-3xl font-bold text-green-600">
                  {logs.filter(l => l.action === 'login').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Changes</p>
                <p className="text-3xl font-bold text-blue-600">
                  {logs.filter(l => ['create', 'update', 'delete'].includes(l.action)).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Last Activity</p>
                <p className="text-sm font-medium text-gray-900">
                  {logs.length > 0 ? formatDate(logs[0].timestamp, 'relative') : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Logs Table */}
        <FormSection title="Activity History" readOnly={true}>
          <Table
            data={logs}
            columns={columns}
            loading={loading}
            emptyMessage="No activity logs found"
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
        </FormSection>
      </div>
    </MerchantLayout>
  );
}

