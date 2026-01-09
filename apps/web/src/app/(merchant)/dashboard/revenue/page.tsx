'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { Chart } from '@/components/dashboard/Chart';
import { mockDashboardService, RevenueSource } from '@/services/mockDashboard';
import { formatCurrency, formatPercentage } from '@/lib/format';

export default function RevenueBreakdownPage() {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sources, setSources] = useState<RevenueSource[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
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
      const data = await mockDashboardService.getRevenueBreakdown(dateRange);
      setTotal(data.total);
      setSources(data.sources);
      setChartData(data.chartData);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Breakdown</h1>
            <p className="mt-1 text-sm text-gray-500">Analyze revenue by source</p>
          </div>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        {/* Total Revenue */}
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
              {loading ? (
                <div className="h-12 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
              ) : (
                <p className="text-5xl font-bold text-gray-900">{formatCurrency(total)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sources.map((source, index) => (
            <Card key={index}>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: source.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                  </div>
                </div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(source.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatPercentage(source.percentage)} of total revenue
                    </p>
                    {/* Progress bar */}
                    <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${source.percentage}%`,
                          backgroundColor: source.color,
                        }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart */}
        <Chart
          title="Revenue Trend by Source"
          subtitle="Monthly breakdown"
          loading={loading}
          data={chartData}
        />

        {/* Detailed Breakdown Table */}
        <Card>
          <CardHeader title="Detailed Breakdown" />
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sources.map((source, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div
                              className="h-3 w-3 rounded"
                              style={{ backgroundColor: source.color }}
                            />
                            <span className="text-sm font-medium text-gray-900">{source.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(source.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatPercentage(source.percentage)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-green-600 font-medium">↑ 5.2%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

