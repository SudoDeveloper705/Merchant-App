'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterDropdown } from '@/components/dashboard/FilterDropdown';
import { Button } from '@/components/dashboard/Button';
import { StatCard } from '@/components/dashboard/StatCard';

interface Payout {
  id: string;
  partnerName: string;
  amount: number;
  method: 'stripe' | 'wise' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledDate: string;
  completedDate?: string;
  description: string;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filteredPayouts, setFilteredPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    loadPayouts();
  }, []);

  useEffect(() => {
    filterPayouts();
  }, [payouts, searchQuery, statusFilter, methodFilter]);

  const loadPayouts = async () => {
    try {
      // Mock data for frontend development
      const mockPayouts: Payout[] = [
        {
          id: '1',
          partnerName: 'Tech Solutions Inc',
          amount: 45000,
          method: 'stripe',
          status: 'completed',
          scheduledDate: '2024-01-10',
          completedDate: '2024-01-10',
          description: 'Monthly revenue share payout',
        },
        {
          id: '2',
          partnerName: 'Global Services Ltd',
          amount: 32000,
          method: 'wise',
          status: 'processing',
          scheduledDate: '2024-01-15',
          description: 'Q4 revenue share payout',
        },
        {
          id: '3',
          partnerName: 'Digital Marketing Pro',
          amount: 18000,
          method: 'bank_transfer',
          status: 'pending',
          scheduledDate: '2024-01-20',
          description: 'Monthly minimum guarantee',
        },
        {
          id: '4',
          partnerName: 'Creative Agency',
          amount: 25000,
          method: 'stripe',
          status: 'failed',
          scheduledDate: '2024-01-05',
          description: 'Revenue share payout - failed',
        },
      ];
      
      setPayouts(mockPayouts);
    } catch (error) {
      console.error('Failed to load payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayouts = () => {
    let filtered = [...payouts];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter((p) => p.method === methodFilter);
    }

    setFilteredPayouts(filtered);
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
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
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

  const formatMethod = (method: string) => {
    return method
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const totalPending = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalProcessing = payouts
    .filter((p) => p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalCompleted = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const columns = [
    {
      header: 'Partner',
      accessor: (row: Payout) => row.partnerName,
    },
    {
      header: 'Amount',
      accessor: (row: Payout) => (
        <span className="font-semibold text-gray-900">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Method',
      accessor: (row: Payout) => formatMethod(row.method),
    },
    {
      header: 'Status',
      accessor: (row: Payout) => getStatusBadge(row.status),
    },
    {
      header: 'Scheduled Date',
      accessor: (row: Payout) => formatDate(row.scheduledDate),
    },
    {
      header: 'Completed Date',
      accessor: (row: Payout) => row.completedDate ? formatDate(row.completedDate) : '-',
    },
    {
      header: 'Description',
      accessor: (row: Payout) => row.description,
      className: 'max-w-md',
    },
  ];

  return (
    <MerchantLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
              <p className="mt-1 text-sm text-gray-500">Manage partner payouts</p>
            </div>
            <Button onClick={() => console.log('Create payout')}>Create Payout</Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Pending Payouts"
              value={formatCurrency(totalPending)}
              subtitle={`${payouts.filter((p) => p.status === 'pending').length} payouts`}
            />
            <StatCard
              title="Processing"
              value={formatCurrency(totalProcessing)}
              subtitle={`${payouts.filter((p) => p.status === 'processing').length} payouts`}
            />
            <StatCard
              title="Completed"
              value={formatCurrency(totalCompleted)}
              subtitle={`${payouts.filter((p) => p.status === 'completed').length} payouts`}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by partner or description..."
              />
            </div>
            <FilterDropdown
              label="Status"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-48"
            />
            <FilterDropdown
              label="Method"
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'stripe', label: 'Stripe' },
                { value: 'wise', label: 'Wise' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
              ]}
              value={methodFilter}
              onChange={setMethodFilter}
              className="w-full sm:w-48"
            />
          </div>

          {/* Payouts Table */}
          <DataTable
            data={filteredPayouts}
            columns={columns}
            loading={loading}
            emptyMessage="No payouts found"
            onRowClick={(row) => console.log('View payout:', row.id)}
          />
        </div>
      </MerchantLayout>
  );
}

