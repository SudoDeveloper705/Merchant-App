'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Table, TableColumn } from '@/components/ui/Table';
import { Button, Input, Select, Badge, Card, CardHeader, CardContent, Pagination } from '@/components/ui';
import { mockServices, MockTransaction } from '@/services/mockServices';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadTransactions();
  }, [page, statusFilter, typeFilter, searchQuery]);

  const loadTransactions = async () => {
    if (!user?.merchantId) return;
    
    setLoading(true);
    try {
      const response = await mockServices.getTransactions(
        user.merchantId,
        page,
        limit,
        {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          search: searchQuery || undefined,
        }
      );
      
      setTransactions(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'error',
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      PAYMENT: 'text-green-600',
      REFUND: 'text-orange-600',
      CHARGEBACK: 'text-red-600',
    };
    
    return (
      <span className={`font-medium ${colors[type] || 'text-gray-600'}`}>
        {type.charAt(0) + type.slice(1).toLowerCase()}
      </span>
    );
  };

  const columns: TableColumn<MockTransaction>[] = [
    {
      header: 'Date',
      accessor: (row) => formatDate(row.transactionDate),
    },
    {
      header: 'Client',
      accessor: (row) => row.clientName || '—',
    },
    {
      header: 'Description',
      accessor: (row) => (
        <div className="max-w-md">
          <div className="text-gray-900">{row.description || '—'}</div>
          {row.externalId && (
            <div className="text-xs text-gray-500 mt-1">ID: {row.externalId}</div>
          )}
        </div>
      ),
      className: 'max-w-md',
    },
    {
      header: 'Type',
      accessor: (row) => getTypeBadge(row.type),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.amountCents)}
        </span>
      ),
    },
    {
      header: 'Fees',
      accessor: (row) => (
        <span className="text-gray-600">{formatCurrency(row.feesCents)}</span>
      ),
    },
    {
      header: 'Net',
      accessor: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.netCents)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status),
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    loadTransactions();
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all transactions
            </p>
          </div>
          <Button onClick={() => console.log('Export transactions')}>
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Search by client, description, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'FAILED', label: 'Failed' },
                  ]}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                />
                <Select
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'PAYMENT', label: 'Payment' },
                    { value: 'REFUND', label: 'Refund' },
                    { value: 'CHARGEBACK', label: 'Chargeback' },
                  ]}
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Search</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {!loading && transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <div className="text-sm text-gray-600">Total Transactions</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    transactions.reduce((sum, t) => sum + t.amountCents, 0)
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="text-sm text-gray-600">Total Fees</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    transactions.reduce((sum, t) => sum + t.feesCents, 0)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Table */}
        <Table
          data={transactions}
          columns={columns}
          loading={loading}
          emptyMessage="No transactions found"
          onRowClick={(row) => console.log('View transaction:', row.id)}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </MerchantLayout>
  );
}
