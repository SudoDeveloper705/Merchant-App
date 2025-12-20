'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterDropdown } from '@/components/dashboard/FilterDropdown';
import { Button } from '@/components/dashboard/Button';

interface Transaction {
  id: string;
  date: string;
  client: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'revenue' | 'expense';
  description: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, statusFilter, typeFilter]);

  const loadTransactions = async () => {
    try {
      // Mock data for frontend development
      // When backend is ready, replace with:
      // const response = await api.transactions.list({ page, limit, search, status, type });
      // setTransactions(response.data.data);
      
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: '2024-01-15',
          client: 'Acme Corp',
          amount: 125000,
          status: 'completed',
          type: 'revenue',
          description: 'Product sale - Invoice #1234',
        },
        {
          id: '2',
          date: '2024-01-14',
          client: 'Tech Solutions Inc',
          amount: 87500,
          status: 'completed',
          type: 'revenue',
          description: 'Service payment - Invoice #1233',
        },
        {
          id: '3',
          date: '2024-01-13',
          client: 'Office Supplies Co',
          amount: 25000,
          status: 'pending',
          type: 'expense',
          description: 'Office supplies purchase',
        },
        {
          id: '4',
          date: '2024-01-12',
          client: 'Global Services',
          amount: 200000,
          status: 'completed',
          type: 'revenue',
          description: 'Monthly retainer payment',
        },
        {
          id: '5',
          date: '2024-01-11',
          client: 'Marketing Agency',
          amount: 15000,
          status: 'failed',
          type: 'expense',
          description: 'Marketing campaign payment',
        },
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    setFilteredTransactions(filtered);
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
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      header: 'Date',
      accessor: (row: Transaction) => formatDate(row.date),
    },
    {
      header: 'Client',
      accessor: (row: Transaction) => row.client,
    },
    {
      header: 'Description',
      accessor: (row: Transaction) => row.description,
      className: 'max-w-md',
    },
    {
      header: 'Type',
      accessor: (row: Transaction) => (
        <span className={`capitalize ${row.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
          {row.type}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: (row: Transaction) => (
        <span className={`font-semibold ${row.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
          {row.type === 'revenue' ? '+' : '-'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Transaction) => getStatusBadge(row.status),
    },
  ];

  return (
    <MerchantLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="mt-1 text-sm text-gray-500">View and manage all transactions</p>
            </div>
            <Button onClick={() => console.log('Export')}>Export</Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by client, description, or ID..."
              />
            </div>
            <FilterDropdown
              label="Status"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-48"
            />
            <FilterDropdown
              label="Type"
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'revenue', label: 'Revenue' },
                { value: 'expense', label: 'Expense' },
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-full sm:w-48"
            />
          </div>

          {/* Transactions Table */}
          <DataTable
            data={filteredTransactions}
            columns={columns}
            loading={loading}
            emptyMessage="No transactions found"
            onRowClick={(row) => console.log('View transaction:', row.id)}
          />

          {/* Summary */}
          {filteredTransactions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Transactions:</span>
                <span className="font-semibold text-gray-900">{filteredTransactions.length}</span>
              </div>
            </div>
          )}
        </div>
      </MerchantLayout>
  );
}

