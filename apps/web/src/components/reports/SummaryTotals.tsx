'use client';

import { Card, CardContent } from '@/components/ui';
import { formatCurrency } from '@/lib/format';

interface SummaryTotal {
  label: string;
  value: number;
  currency?: string;
  variant?: 'default' | 'positive' | 'negative';
}

interface SummaryTotalsProps {
  totals: SummaryTotal[];
  className?: string;
}

export function SummaryTotals({ totals, className = '' }: SummaryTotalsProps) {
  const getVariantColor = (variant?: SummaryTotal['variant']) => {
    const colors = {
      default: 'text-gray-900',
      positive: 'text-green-600',
      negative: 'text-red-600',
    };
    return colors[variant || 'default'];
  };

  return (
    <div className={`sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {totals.map((total, index) => (
            <div key={index} className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">{total.label}</p>
              <p className={`text-lg font-bold ${getVariantColor(total.variant)}`}>
                {formatCurrency(total.value, total.currency)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

