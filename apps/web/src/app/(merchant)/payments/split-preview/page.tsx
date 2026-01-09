'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RevenueSplitPreview } from '@/components/invoices/RevenueSplitPreview';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { mockInvoiceService, RevenueSplit } from '@/services/mockInvoices';
import { formatCurrency } from '@/lib/format';

export default function RevenueSplitPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  
  const [loading, setLoading] = useState(true);
  const [split, setSplit] = useState<RevenueSplit | null>(null);

  useEffect(() => {
    if (invoiceId) {
      loadSplit();
    }
  }, [invoiceId]);

  const loadSplit = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, get from invoice
      const data = await mockInvoiceService.calculateRevenueSplit({
        subtotal: 1000000, // $10,000
        salesTax: 80000, // $800
        partnerSplits: [
          { partnerId: 'partner-001', percentage: 30 },
          { partnerId: 'partner-002', percentage: 20 },
        ],
      });
      setSplit(data);
    } catch (error) {
      console.error('Failed to load revenue split:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!split) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Revenue split not found</p>
            <Button onClick={() => router.push('/invoices')} className="mt-4">
              Back to Invoices
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Split Preview</h1>
            <p className="mt-1 text-sm text-gray-500">Review revenue distribution before payout</p>
          </div>
          <Button onClick={() => router.push('/invoices')}>
            Back to Invoices
          </Button>
        </div>

        {/* Revenue Split Preview */}
        <RevenueSplitPreview
          subtotal={split.subtotal}
          salesTax={split.salesTax}
          fees={split.fees}
          partnerSplits={split.partnerSplits.map(partner => ({
            name: partner.partnerName,
            percentage: partner.percentage,
          }))}
        />

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-2">Merchant Share</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(split.merchantShare)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-2">Partner Total</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(split.partnerSplits.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-2">Net Amount</p>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(split.netAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

