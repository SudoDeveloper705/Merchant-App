'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FormSection } from '@/components/company';
import { Card, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { mockCompanyService, Permission } from '@/services/mockCompany';

export default function PermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await mockCompanyService.getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByCategory = (perms: Permission[]) => {
    const grouped: Record<string, Permission[]> = {};
    perms.forEach(perm => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });
    return grouped;
  };

  const getCategoryLabel = (category: Permission['category']) => {
    const labels = {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      partners: 'Partners',
      settings: 'Settings',
      reports: 'Reports',
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category: Permission['category']) => {
    const icons = {
      dashboard: '📊',
      transactions: '💰',
      partners: '🤝',
      settings: '⚙️',
      reports: '📈',
    };
    return icons[category] || '📋';
  };

  const grouped = groupByCategory(permissions);
  const grantedCount = permissions.filter(p => p.granted).length;
  const totalCount = permissions.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Access & Permissions</h1>
          <p className="mt-1 text-sm text-gray-500">View your current access permissions (Read-only)</p>
        </div>

        {/* Summary */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Granted</p>
                <p className="mt-1 text-3xl font-bold text-green-600">{grantedCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Not Granted</p>
                <p className="mt-1 text-3xl font-bold text-gray-400">{totalCount - grantedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions by Category */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            Object.entries(grouped).map(([category, perms]) => (
              <FormSection
                key={category}
                title={
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryIcon(category as Permission['category'])}</span>
                    <span>{getCategoryLabel(category as Permission['category'])}</span>
                  </div>
                }
                subtitle={`${perms.length} permission${perms.length > 1 ? 's' : ''}`}
                readOnly={true}
              >
                <div className="space-y-3">
                  {perms.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900">{perm.name}</h4>
                          {perm.granted ? (
                            <Badge variant="success">Granted</Badge>
                          ) : (
                            <Badge variant="default">Not Granted</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{perm.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>
            ))
          )}
        </div>

        {/* Info Banner */}
        <Card>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-xl">ℹ️</span>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Permission Management</h4>
                  <p className="text-sm text-blue-800">
                    Permissions are managed by your account administrator. Contact support if you need
                    additional access or have questions about your current permissions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

