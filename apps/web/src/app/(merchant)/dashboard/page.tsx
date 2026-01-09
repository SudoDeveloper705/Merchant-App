'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Table, TableColumn } from '@/components/ui';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { Chart } from '@/components/dashboard/Chart';
import { mockDashboardService, Alert, ActivityItem, Balance } from '@/services/mockDashboard';
import { formatCurrency, formatDate } from '@/lib/format';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await mockDashboardService.getOverview(dateRange);
      setKpis(data.kpis);
      setBalances(data.balances);
      setAlerts(data.alerts);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  const activityColumns: TableColumn<ActivityItem>[] = [
    {
      header: 'Time',
      accessor: (row) => formatDate(row.timestamp, 'relative'),
    },
    {
      header: 'Activity',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => row.amount ? formatCurrency(row.amount) : '—',
    },
    {
      header: 'Status',
      accessor: (row) => row.status ? (
        <Badge variant={row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'error'}>
          {row.status}
        </Badge>
      ) : '—',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor your business metrics and activity</p>
          </div>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              trend={kpi.trend}
              loading={loading}
              icon={
                index === 0 ? '💰' :
                index === 1 ? '📊' :
                index === 2 ? '⏳' : '🤝'
              }
            />
          ))}
        </div>

        {/* Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {balances.map((balance, index) => (
            <Card key={index}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{balance.label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {formatCurrency(balance.amount, balance.currency)}
                    </p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    balance.type === 'available' ? 'bg-green-100' :
                    balance.type === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    {balance.type === 'available' ? '✅' :
                     balance.type === 'pending' ? '⏳' : '🔒'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <Card>
            <CardHeader
              title="Recent Alerts"
              subtitle={`${alerts.filter(a => !a.read).length} unread`}
              action={
                <Link href="/dashboard/notifications">
                  <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View All
                  </button>
                </Link>
              }
            />
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No alerts</p>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        !alert.read ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getSeverityBadge(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            {!alert.read && (
                              <span className="h-2 w-2 rounded-full bg-primary-600"></span>
                            )}
                          </div>
                          <h4 className="mt-2 text-sm font-medium text-gray-900">{alert.title}</h4>
                          <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {formatDate(alert.timestamp, 'relative')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader
              title="Recent Activity"
              action={
                <Link href="/dashboard/activity">
                  <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View All
                  </button>
                </Link>
              }
            />
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : (
                <Table
                  data={recentActivity.slice(0, 5)}
                  columns={activityColumns}
                  emptyMessage="No activity"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Chart
          title="Revenue Trend"
          subtitle="Last 6 months"
          loading={loading}
          data={[
            { label: 'Jan', value: 95000, color: '#3b82f6' },
            { label: 'Feb', value: 110000, color: '#3b82f6' },
            { label: 'Mar', value: 125000, color: '#3b82f6' },
            { label: 'Apr', value: 118000, color: '#3b82f6' },
            { label: 'May', value: 132000, color: '#3b82f6' },
            { label: 'Jun', value: 125450, color: '#3b82f6' },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}

