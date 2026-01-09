'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Badge, Button, Table, TableColumn } from '@/components/ui';
import { mockSettlementService, Payout } from '@/services/mockSettlement';
import { formatCurrency, formatDate } from '@/lib/format';

export default function PendingPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<Payout[]>([]);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const data = await mockSettlementService.getPendingPayouts();
      setPayouts(data);
    } catch (error) {
      console.error('Failed to load pending payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (payoutId: string) => {
    // In real app, this would trigger payout processing
    console.log('Process payout:', payoutId);
  };

  const totalPending = payouts.reduce((sum, p) => sum + p.amount, 0);

  const columns: TableColumn<Payout>[] = [
    {
      header: 'Payout ID',
      accessor: (row) => (
        <div>
          <div className="font-mono text-sm text-gray-900">{row.id}</div>
          <div className="text-xs text-gray-500">{row.reference}</div>
        </div>
      ),
    },
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
      header: 'Amount',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-lg text-gray-900">
            {formatCurrency(row.amount, row.currency)}
          </div>
          {row.adjustments.length > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              {row.adjustments.length} adjustment(s) applied
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Scheduled Date',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{formatDate(row.scheduledDate, 'short')}</div>
          <div className="text-xs text-gray-500">
            {Math.ceil((new Date(row.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
          </div>
        </div>
      ),
    },
    {
      header: 'Payment Method',
      accessor: (row) => (
        <span className="text-sm text-gray-600 capitalize">
          {row.paymentMethod.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Invoices',
      accessor: (row) => (
        <span className="text-sm text-gray-600">{row.relatedInvoices.length} invoice(s)</span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleProcessPayout(row.id)}
        >
          Process
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Payouts</h1>
            <p className="mt-1 text-sm text-gray-500">Review and process scheduled payouts</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Pending Payouts</p>
                <p className="text-3xl font-bold text-gray-900">{payouts.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPending)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Next Payout</p>
                <p className="text-sm font-medium text-gray-900">
                  {payouts.length > 0 ? formatDate(payouts[0].scheduledDate, 'short') : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payouts Table */}
        <FormSection title="Scheduled Payouts">
          <Table
            data={payouts}
            columns={columns}
            loading={loading}
            emptyMessage="No pending payouts"
          />
        </FormSection>

        {/* Payout Details */}
        {!loading && payouts.length > 0 && (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <Card key={payout.id}>
                <CardHeader title={`Payout Details: ${payout.reference}`} />
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Partner</p>
                      <p className="text-gray-900">{payout.partnerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(payout.amount, payout.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Scheduled Date</p>
                      <p className="text-gray-900">{formatDate(payout.scheduledDate, 'long')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Payment Method</p>
                      <p className="text-gray-900 capitalize">{payout.paymentMethod.replace('_', ' ')}</p>
                    </div>
                    {payout.adjustments.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600 mb-2">Adjustments</p>
                        <div className="space-y-2">
                          {payout.adjustments.map((adj) => (
                            <div key={adj.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {adj.type === 'increase' ? '+' : '-'}{formatCurrency(adj.amount)}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">{adj.reason}</p>
                                </div>
                                <Badge variant="warning">Adjusted</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

