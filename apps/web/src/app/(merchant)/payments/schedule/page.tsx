'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PayoutTimeline } from '@/components/invoices/PayoutTimeline';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { mockInvoiceService, PayoutSchedule } from '@/services/mockInvoices';
import { formatCurrency, formatDate } from '@/lib/format';

export default function PayoutSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<PayoutSchedule[]>([]);

  useEffect(() => {
    loadPayoutSchedule();
  }, []);

  const loadPayoutSchedule = async () => {
    setLoading(true);
    try {
      const data = await mockInvoiceService.getPayoutSchedule();
      setPayouts(data);
    } catch (error) {
      console.error('Failed to load payout schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: PayoutSchedule['status']) => {
    const variants = {
      scheduled: 'info' as const,
      processing: 'warning' as const,
      completed: 'success' as const,
      failed: 'error' as const,
    };
    return variants[status] || 'default';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payout Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">View scheduled and processed payouts</p>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader title="Payout Timeline" />
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <PayoutTimeline
                events={payouts.map(payout => ({
                  id: payout.id,
                  date: payout.processedDate || payout.scheduledDate,
                  status: payout.status,
                  amount: payout.amount,
                  description: payout.description,
                  currency: payout.currency,
                }))}
              />
            )}
          </CardContent>
        </Card>

        {/* Payouts List */}
        <Card>
          <CardHeader title="All Payouts" />
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{payout.partnerName}</h3>
                        <Badge variant={getStatusBadge(payout.status)}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{payout.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          Scheduled: {formatDate(payout.scheduledDate, 'short')}
                        </span>
                        {payout.processedDate && (
                          <span>
                            Processed: {formatDate(payout.processedDate, 'short')}
                          </span>
                        )}
                        <span>
                          {payout.relatedInvoices.length} invoice(s)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(payout.amount, payout.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

