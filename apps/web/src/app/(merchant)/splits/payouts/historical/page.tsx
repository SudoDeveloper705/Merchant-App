'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Badge, Table, TableColumn, Pagination } from '@/components/ui';
import { mockSettlementService, Payout } from '@/services/mockSettlement';
import { formatCurrency, formatDate } from '@/lib/format';

export default function HistoricalPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPayouts();
  }, [page]);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const response = await mockSettlementService.getHistoricalPayouts(page, 20);
      setPayouts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load historical payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Payout['status']) => {
    const variants: Record<Payout['status'], 'success' | 'error' | 'warning' | 'info' | 'default'> = {
      completed: 'success',
      failed: 'error',
      cancelled: 'default',
      pending: 'warning',
      processing: 'info',
    };
    return variants[status] || 'default';
  };

  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);

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
          <div className="font-semibold text-gray-900">{formatCurrency(row.amount, row.currency)}</div>
          {row.adjustments.length > 0 && (
            <div className="text-xs text-gray-500">
              {row.adjustments.length} adjustment(s)
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={getStatusBadge(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Scheduled Date',
      accessor: (row) => formatDate(row.scheduledDate, 'short'),
    },
    {
      header: 'Processed Date',
      accessor: (row) => row.processedDate ? formatDate(row.processedDate, 'short') : '—',
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
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historical Payouts</h1>
          <p className="mt-1 text-sm text-gray-500">View all completed and processed payouts (Read-only)</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Payouts</p>
                <p className="text-3xl font-bold text-gray-900">{payouts.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {payouts.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payouts Table */}
        <FormSection title="All Historical Payouts" readOnly={true}>
          <Table
            data={payouts}
            columns={columns}
            loading={loading}
            emptyMessage="No historical payouts found"
          />
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </FormSection>
      </div>
    </DashboardLayout>
  );
}

