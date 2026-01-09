'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { RoleBadge } from '@/components/users/RoleBadge';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Table, TableColumn } from '@/components/ui';
import { Button, Badge, Input, Select, Pagination } from '@/components/ui';
import { mockUserService, User } from '@/services/mockUsers';
import { formatDate } from '@/lib/format';

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await mockUserService.getUsers(page, 20);
      let filtered = response.data;
      
      if (roleFilter !== 'all') {
        filtered = filtered.filter(u => u.role === roleFilter);
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(u => u.status === statusFilter);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(u =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        );
      }
      
      setUsers(filtered);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'success' as const,
      inactive: 'default' as const,
      pending: 'warning' as const,
    };
    return variants[status] || 'default';
  };

  const columns: TableColumn<User>[] = [
    {
      header: 'User',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row) => <RoleBadge role={row.role} />,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={getStatusBadge(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Last Login',
      accessor: (row) => row.lastLogin ? formatDate(row.lastLogin, 'relative') : 'Never',
    },
    {
      header: 'Created',
      accessor: (row) => formatDate(row.createdAt, 'short'),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/merchant/users/${row.id}/permissions`)}
          >
            Permissions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/merchant/users/${row.id}/activity`)}
          >
            Activity
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage users, roles, and permissions</p>
          </div>
          <Button onClick={() => router.push('/merchant/users/invite')}>
            Invite User
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Inactive</p>
                <p className="text-3xl font-bold text-gray-400">
                  {users.filter(u => u.status === 'inactive').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'merchant_owner', label: 'Merchant Owner' },
                  { value: 'merchant_manager', label: 'Manager' },
                  { value: 'merchant_accountant', label: 'Accountant' },
                  { value: 'viewer', label: 'Viewer' },
                ]}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader title="All Users" />
          <CardContent>
            <Table
              data={users}
              columns={columns}
              loading={loading}
              emptyMessage="No users found"
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
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}

