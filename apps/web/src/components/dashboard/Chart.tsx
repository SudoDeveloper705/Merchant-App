'use client';

import { ReactNode } from 'react';

interface ChartProps {
  title?: string;
  subtitle?: string;
  data?: Array<{ label: string; value: number; color?: string }>;
  loading?: boolean;
  height?: number;
  children?: ReactNode;
  className?: string;
}

export function Chart({
  title,
  subtitle,
  data,
  loading = false,
  height = 300,
  children,
  className = '',
}: ChartProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {title && (
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            {subtitle && <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>}
          </div>
        )}
        <div
          className="bg-gray-100 rounded animate-pulse"
          style={{ height: `${height}px` }}
        ></div>
      </div>
    );
  }

  // Mock chart visualization
  const maxValue = data ? Math.max(...data.map(d => d.value)) : 100;
  const chartHeight = height - 60; // Account for labels

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      {children ? (
        children
      ) : data ? (
        <div className="space-y-4">
          {/* Simple bar chart */}
          <div className="flex items-end space-x-2" style={{ height: `${chartHeight}px` }}>
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${(item.value / maxValue) * chartHeight}px`,
                    backgroundColor: item.color || '#3b82f6',
                    minHeight: item.value > 0 ? '4px' : '0',
                  }}
                  title={`${item.label}: ${item.value}`}
                />
                <div className="mt-2 text-xs text-gray-600 text-center transform -rotate-45 origin-top-left whitespace-nowrap">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color || '#3b82f6' }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No chart data available
        </div>
      )}
    </div>
  );
}

