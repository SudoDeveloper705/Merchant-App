'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { RoleBadge } from '@/components/users/RoleBadge';
import { PermissionMatrix } from '@/components/users/PermissionMatrix';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button, Select, Badge } from '@/components/ui';
import { mockUserService, User, Permission } from '@/services/mockUsers';
import { formatDate } from '@/lib/format';

export default function EditPermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      loadUser();
    }
  }, [params.id]);

  useEffect(() => {
    if (selectedRole) {
      loadPermissions();
    }
  }, [selectedRole]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await mockUserService.getUser(params.id as string);
      if (data) {
        setUser(data);
        setSelectedRole(data.role);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await mockUserService.getPermissionsForRole(selectedRole);
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (!user) return;
    
    setSaving(true);
    try {
      await mockUserService.updateUserRole(user.id, newRole);
      setSelectedRole(newRole);
      await loadPermissions();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionChange = async (permissionId: string, granted: boolean) => {
    const updated = permissions.map(p =>
      p.id === permissionId ? { ...p, granted } : p
    );
    setPermissions(updated);
    
    try {
      await mockUserService.updatePermissions(user!.id, updated);
    } catch (error) {
      console.error('Failed to update permission:', error);
    }
  };

  if (loading) {
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

  if (!user) {
    return (
      <MerchantLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">User not found</p>
            <Button onClick={() => router.push('/merchant/users')} className="mt-4">
              Back to Users
            </Button>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  const grantedCount = permissions.filter(p => p.granted).length;
  const totalCount = permissions.length;

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Roles & Permissions</h1>
            <p className="mt-1 text-sm text-gray-500">Manage user role and permissions</p>
          </div>
        </div>

        {/* User Info */}
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
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <Badge variant={user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'default'}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Last Login</p>
                <p className="text-gray-900">{user.lastLogin ? formatDate(user.lastLogin, 'relative') : 'Never'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Created</p>
                <p className="text-gray-900">{formatDate(user.createdAt, 'short')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <FormSection title="User Role">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Select
                  label="Role"
                  options={[
                    { value: 'merchant_owner', label: 'Merchant Owner' },
                    { value: 'merchant_manager', label: 'Manager' },
                    { value: 'merchant_accountant', label: 'Accountant' },
                    { value: 'viewer', label: 'Viewer' },
                    { value: 'partner_owner', label: 'Partner Owner' },
                    { value: 'partner_staff', label: 'Partner Staff' },
                  ]}
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                />
              </div>
              <div className="pt-6">
                <RoleBadge role={selectedRole} />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Changing the role will update the default permissions. You can then customize individual permissions below.
              </p>
            </div>
          </div>
        </FormSection>

        {/* Permissions */}
        <FormSection
          title="Permissions"
          subtitle={`${grantedCount} of ${totalCount} permissions granted`}
        >
          <PermissionMatrix
            permissions={permissions}
            onPermissionChange={handlePermissionChange}
            readOnly={false}
          />
        </FormSection>

        {/* Responsibility Summary */}
        <Card>
          <CardHeader title="Responsibility Summary" />
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Can Access Dashboard</span>
                <Badge variant={permissions.find(p => p.id === 'perm-001')?.granted ? 'success' : 'default'}>
                  {permissions.find(p => p.id === 'perm-001')?.granted ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Can Create/Edit</span>
                <Badge variant={permissions.some(p => p.category === 'transactions' && p.granted && p.name.includes('Create')) ? 'success' : 'default'}>
                  {permissions.some(p => p.category === 'transactions' && p.granted && p.name.includes('Create')) ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Can Manage Users</span>
                <Badge variant={permissions.find(p => p.id === 'perm-010')?.granted ? 'success' : 'default'}>
                  {permissions.find(p => p.id === 'perm-010')?.granted ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Can Export Data</span>
                <Badge variant={permissions.find(p => p.id === 'perm-008')?.granted ? 'success' : 'default'}>
                  {permissions.find(p => p.id === 'perm-008')?.granted ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}

