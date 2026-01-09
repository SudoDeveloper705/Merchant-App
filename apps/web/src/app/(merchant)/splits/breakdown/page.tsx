'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { Badge, Table, TableColumn } from '@/components/ui';
import { mockSettlementService, PartnerShare } from '@/services/mockSettlement';
import { formatCurrency, formatDate } from '@/lib/format';

export default function PartnerShareBreakdownPage() {
  const [loading, setLoading] = useState(true);
  const [shares, setShares] = useState<PartnerShare[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  useEffect(() => {
    loadBreakdown();
  }, [dateRange]);

  const loadBreakdown = async () => {
    setLoading(true);
    try {
      const data = await mockSettlementService.getPartnerShareBreakdown({
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      });
      setShares(data);
    } catch (error) {
      console.error('Failed to load partner share breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = shares.reduce((sum, share) => sum + share.revenueShare, 0);
  const totalShares = shares.reduce((sum, share) => sum + share.actualShare, 0);

  const columns: TableColumn<PartnerShare>[] = [
    {
      header: 'Partner',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.partnerName}</div>
          <div className="text-xs text-gray-500">ID: {row.partnerId}</div>
        </div>
      ),
    },
    {
      header: 'Split Type',
      accessor: (row) => (
        <Badge variant={row.splitRule.type === 'percentage' ? 'info' : 'warning'}>
          {row.splitRule.type === 'percentage' ? 'Percentage' : 'Minimum Guarantee'}
        </Badge>
      ),
    },
    {
      header: 'Configuration',
      accessor: (row) => (
        <div className="text-sm">
          {row.splitRule.type === 'percentage' ? (
            <span className="font-medium text-gray-900">{row.splitRule.percentage}%</span>
          ) : (
            <span className="font-medium text-gray-900">
              Min: {formatCurrency(row.splitRule.minimumAmount || 0)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Revenue Share',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{formatCurrency(row.revenueShare)}</div>
          {row.splitRule.type === 'percentage' && (
            <div className="text-xs text-gray-500">
              {((row.revenueShare / totalRevenue) * 100).toFixed(2)}% of total
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Minimum Guarantee',
      accessor: (row) => (
        <div className="text-sm">
          {row.minimumGuarantee > 0 ? (
            <span className="font-medium text-gray-900">{formatCurrency(row.minimumGuarantee)}</span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actual Share',
      accessor: (row) => (
        <div>
          <div className="font-bold text-lg text-gray-900">{formatCurrency(row.actualShare)}</div>
          {row.actualShare > row.revenueShare && (
            <div className="text-xs text-green-600">Minimum guarantee applied</div>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Share Breakdown</h1>
            <p className="mt-1 text-sm text-gray-500">Revenue distribution analysis by partner</p>
          </div>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Shares</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalShares)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Active Partners</p>
                <p className="text-2xl font-bold text-gray-900">{shares.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Period</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(dateRange.start.toISOString(), 'short')} - {formatDate(dateRange.end.toISOString(), 'short')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Table */}
        <FormSection
          title="Partner Share Details"
          subtitle={`Period: ${formatDate(dateRange.start.toISOString(), 'short')} - ${formatDate(dateRange.end.toISOString(), 'short')}`}
          readOnly={true}
        >
          <Table
            data={shares}
            columns={columns}
            loading={loading}
            emptyMessage="No partner shares for this period"
          />
        </FormSection>

        {/* Visual Breakdown */}
        {!loading && shares.length > 0 && (
          <Card>
            <CardHeader title="Share Distribution" />
            <CardContent>
              <div className="space-y-4">
                {shares.map((share) => {
                  const percentage = (share.actualShare / totalShares) * 100;
                  return (
                    <div key={share.partnerId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{share.partnerName}</span>
                        <span className="text-gray-600">
                          {formatCurrency(share.actualShare)} ({percentage.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

