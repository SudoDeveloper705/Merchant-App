'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PaymentStatusBadge } from '@/components/invoices/PaymentStatusBadge';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Table, TableColumn } from '@/components/ui';
import { Button, Input, Select, Pagination } from '@/components/ui';
import { mockInvoiceService, Invoice } from '@/services/mockInvoices';
import { formatCurrency, formatDate } from '@/lib/format';

export default function InvoicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [page, statusFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await mockInvoiceService.getInvoices(page, 20, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setInvoices(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<Invoice>[] = [
    {
      header: 'Invoice #',
      accessor: (row) => (
        <button
          onClick={() => router.push(`/invoices/${row.id}`)}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          {row.invoiceNumber}
        </button>
      ),
    },
    {
      header: 'Client',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.clientName}</div>
          <div className="text-sm text-gray-500">{row.clientEmail}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{formatCurrency(row.total)}</div>
          <div className="text-xs text-gray-500">Net: {formatCurrency(row.netAmount)}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
    },
    {
      header: 'Issue Date',
      accessor: (row) => formatDate(row.issueDate, 'short'),
    },
    {
      header: 'Due Date',
      accessor: (row) => formatDate(row.dueDate, 'short'),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/invoices/${row.id}`)}
        >
          View
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
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage all invoices</p>
          </div>
          <Button onClick={() => router.push('/invoices/create')}>
            Create Invoice
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by client or invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'disputed', label: 'Disputed' },
                ]}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader title="All Invoices" />
          <CardContent>
            <Table
              data={invoices}
              columns={columns}
              loading={loading}
              emptyMessage="No invoices found"
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

