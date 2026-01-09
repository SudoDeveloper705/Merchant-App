'use client';

import { Card, CardHeader, CardContent } from '@/components/ui';
import { formatCurrency, formatPercentage } from '@/lib/format';

interface SplitItem {
  name: string;
  amount: number;
  percentage: number;
  type: 'merchant' | 'partner' | 'tax' | 'fees';
}

interface RevenueSplitPreviewProps {
  subtotal: number;
  salesTax: number;
  fees: number;
  partnerSplits: Array<{ name: string; percentage: number }>;
  currency?: string;
  className?: string;
}

export function RevenueSplitPreview({
  subtotal,
  salesTax,
  fees,
  partnerSplits,
  currency = 'USD',
  className = '',
}: RevenueSplitPreviewProps) {
  const total = subtotal + salesTax;
  const partnerTotal = partnerSplits.reduce((sum, partner) => {
    return sum + (subtotal * partner.percentage / 100);
  }, 0);
  const merchantShare = subtotal - partnerTotal;
  const netAmount = total - fees - partnerTotal;

  const splits: SplitItem[] = [
    {
      name: 'Merchant Share',
      amount: merchantShare,
      percentage: (merchantShare / subtotal) * 100,
      type: 'merchant',
    },
    ...partnerSplits.map(partner => ({
      name: partner.name,
      amount: subtotal * partner.percentage / 100,
      percentage: partner.percentage,
      type: 'partner' as const,
    })),
    {
      name: 'Sales Tax',
      amount: salesTax,
      percentage: (salesTax / total) * 100,
      type: 'tax',
    },
    {
      name: 'Processing Fees',
      amount: fees,
      percentage: (fees / total) * 100,
      type: 'fees',
    },
  ];

  const getTypeColor = (type: SplitItem['type']) => {
    const colors = {
      merchant: 'bg-blue-100 text-blue-800',
      partner: 'bg-green-100 text-green-800',
      tax: 'bg-yellow-100 text-yellow-800',
      fees: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={className}>
      <CardHeader title="Revenue Split Preview" />
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sales Tax:</span>
              <span className="font-medium text-gray-900">{formatCurrency(salesTax, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Processing Fees:</span>
              <span className="font-medium text-red-600">-{formatCurrency(fees, currency)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Net Amount:</span>
                <span className="font-bold text-lg text-gray-900">{formatCurrency(netAmount, currency)}</span>
              </div>
            </div>
          </div>

          {/* Split Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Split Breakdown</h4>
            {splits.map((split, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(split.type)}`}>
                      {split.type === 'merchant' ? 'Merchant' :
                       split.type === 'partner' ? 'Partner' :
                       split.type === 'tax' ? 'Tax' : 'Fees'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{split.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(split.amount, currency)}
                    </div>
                    {split.type !== 'tax' && split.type !== 'fees' && (
                      <div className="text-xs text-gray-500">
                        {formatPercentage(split.percentage)}
                      </div>
                    )}
                  </div>
                </div>
                {split.type !== 'tax' && split.type !== 'fees' && (
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 transition-all"
                      style={{ width: `${split.percentage}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

