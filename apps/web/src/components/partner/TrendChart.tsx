'use client';

import { RevenueTrend } from '@/lib/partnerApi';

interface TrendChartProps {
  data: RevenueTrend[];
  loading?: boolean;
}

export function TrendChart({ data, loading }: TrendChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.revenue_cents, d.partner_share_cents)),
    1
  );

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const formatMonth = (month: string) => {
    const date = new Date(month);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h3>
      <div className="space-y-4">
        {/* Chart bars */}
        <div className="flex items-end justify-between space-x-2 h-64">
          {data.map((item, index) => {
            const revenueHeight = (item.revenue_cents / maxValue) * 100;
            const partnerHeight = (item.partner_share_cents / maxValue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                <div className="w-full flex flex-col items-center justify-end space-y-1" style={{ height: '200px' }}>
                  {/* Revenue bar */}
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                    style={{ height: `${revenueHeight}%` }}
                    title={`Revenue: ${formatCurrency(item.revenue_cents)}`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      Revenue: {formatCurrency(item.revenue_cents)}
                    </div>
                  </div>
                  {/* Partner share bar */}
                  <div
                    className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors relative group"
                    style={{ height: `${partnerHeight}%` }}
                    title={`Partner Share: ${formatCurrency(item.partner_share_cents)}`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      Partner: {formatCurrency(item.partner_share_cents)}
                    </div>
                  </div>
                </div>
                {/* Month label */}
                <div className="text-xs text-gray-600 text-center mt-2" style={{ writingMode: 'horizontal-tb' }}>
                  {formatMonth(item.month)}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Total Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Partner Share</span>
          </div>
        </div>
      </div>
    </div>
  );
}

