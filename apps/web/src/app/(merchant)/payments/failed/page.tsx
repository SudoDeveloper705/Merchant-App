'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PaymentStatusBadge } from '@/components/invoices/PaymentStatusBadge';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Table, TableColumn } from '@/components/ui';
import { Button, Pagination } from '@/components/ui';
import { mockInvoiceService, Payment } from '@/services/mockInvoices';
import { formatCurrency, formatDate } from '@/lib/format';

export default function FailedPaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadFailedPayments();
  }, [page]);

  const loadFailedPayments = async () => {
    setLoading(true);
    try {
      const response = await mockInvoiceService.getFailedPayments(page, 20);
      setPayments(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load failed payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<Payment>[] = [
    {
      header: 'Invoice #',
      accessor: (row) => (
        <button
          onClick={() => router.push(`/invoices/${row.invoiceId}`)}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          {row.invoiceNumber}
        </button>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.amount, row.currency)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <PaymentStatusBadge status={row.status} />,
    },
    {
      header: 'Payment Method',
      accessor: (row) => (
        <span className="capitalize">{row.paymentMethod.replace('_', ' ')}</span>
      ),
    },
    {
      header: 'Failure Reason',
      accessor: (row) => (
        <span className="text-red-600 font-medium">{row.failureReason || '—'}</span>
      ),
    },
    {
      header: 'Date',
      accessor: (row) => formatDate(row.createdAt, 'short'),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/payments/status/${row.invoiceId}`)}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => console.log('Retry payment', row.id)}
          >
            Retry
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Failed & Disputed Payments</h1>
          <p className="mt-1 text-sm text-gray-500">Review and resolve payment issues</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-2">Total Failed</p>
                <p className="text-3xl font-bold text-red-600">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-2">Total Disputed</p>
                <p className="text-3xl font-bold text-orange-600">
                  {payments.filter(p => p.status === 'disputed').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Failed Payments Table */}
        <Card>
          <CardHeader title="Failed & Disputed Payments" />
          <CardContent>
            <Table
              data={payments}
              columns={columns}
              loading={loading}
              emptyMessage="No failed or disputed payments"
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

