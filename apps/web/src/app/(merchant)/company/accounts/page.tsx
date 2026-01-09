'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FormSection } from '@/components/company';
import { ConnectionStatus } from '@/components/company';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { mockCompanyService, LinkedAccount } from '@/services/mockCompany';
import { formatDate } from '@/lib/format';

export default function LinkedAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await mockCompanyService.getLinkedAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load linked accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountIcon = (type: LinkedAccount['type']) => {
    const icons = {
      stripe: '💳',
      quickbooks: '📊',
      bank: '🏦',
    };
    return icons[type] || '🔗';
  };

  const getAccountTypeLabel = (type: LinkedAccount['type']) => {
    const labels = {
      stripe: 'Stripe',
      quickbooks: 'QuickBooks',
      bank: 'Bank Account',
    };
    return labels[type] || type;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Linked Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            View your connected payment processors and accounting systems (Read-only)
          </p>
        </div>

        {/* Accounts List */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            accounts.map((account) => (
              <FormSection
                key={account.id}
                title={
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getAccountIcon(account.type)}</span>
                    <span>{account.name}</span>
                  </div>
                }
                subtitle={getAccountTypeLabel(account.type)}
                readOnly={true}
                action={
                  account.status === 'connected' ? (
                    <Button variant="outline" size="sm" disabled>
                      Manage
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" disabled>
                      Connect
                    </Button>
                  )
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Account ID</p>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{account.accountId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Connection Status</p>
                      <div className="mt-1">
                        <ConnectionStatus
                          status={account.status}
                          lastSync={account.lastSync || undefined}
                        />
                      </div>
                    </div>
                    {account.metadata?.accountName && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Account Name</p>
                        <p className="mt-1 text-sm text-gray-900">{account.metadata.accountName}</p>
                      </div>
                    )}
                    {account.metadata?.accountType && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Account Type</p>
                        <p className="mt-1 text-sm text-gray-900">{account.metadata.accountType}</p>
                      </div>
                    )}
                    {account.metadata?.last4 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last 4 Digits</p>
                        <p className="mt-1 text-sm text-gray-900">**** {account.metadata.last4}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-600">Connected At</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(account.connectedAt, 'short')}
                      </p>
                    </div>
                  </div>
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
                  <h4 className="font-semibold text-blue-900 mb-1">Account Management</h4>
                  <p className="text-sm text-blue-800">
                    To connect or disconnect accounts, please contact support or use the integration settings
                    in your respective service provider's dashboard.
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

