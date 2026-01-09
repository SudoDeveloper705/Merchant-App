'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button, Input, Select, Card, CardHeader, CardContent, Badge, Table, TableColumn, Pagination } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { PendingPayout, PayoutStatus, PayoutMethod } from '@/types/payouts';

// Mock data generator
const generateMockPendingPayouts = (merchantId: string): PendingPayout[] => {
  const partners = [
    { id: 'partner-001', name: 'Tech Solutions Inc' },
    { id: 'partner-002', name: 'Global Services Ltd' },
    { id: 'partner-003', name: 'Digital Marketing Pro' },
    { id: 'partner-004', name: 'Creative Agency' },
    { id: 'partner-005', name: 'Cloud Systems Group' },
  ];

  const methods: PayoutMethod[] = ['STRIPE', 'WISE', 'BANK_TRANSFER', 'PAYPAL'];
  const statuses: PayoutStatus[] = ['PENDING', 'PROCESSING'];

  const payouts: PendingPayout[] = [];

  for (let i = 0; i < 15; i++) {
    const partner = partners[Math.floor(Math.random() * partners.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 30));

    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - 1);
    const periodEnd = new Date();

    const amountCents = Math.floor((10000 + Math.random() * 100000) * 100); // $10k - $110k
    const feesCents = Math.floor(amountCents * 0.02); // 2% fee
    const netAmountCents = amountCents - feesCents;

    payouts.push({
      id: `pending-payout-${i + 1}`,
      payoutNumber: `PO-P-${String(i + 1).padStart(6, '0')}`,
      partnerId: partner.id,
      partnerName: partner.name,
      amountCents,
      currency: 'USD',
      method,
      status,
      scheduledDate: scheduledDate.toISOString(),
      description: `Monthly revenue share payout - ${periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      transactionIds: Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, j) => `txn-${i}-${j}`),
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      feesCents,
      netAmountCents,
      canApprove: status === 'PENDING',
      canCancel: status === 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return payouts.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
};

export default function PendingPayoutsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [payouts, setPayouts] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.merchantId) {
      loadPayouts();
    }
  }, [user?.merchantId]);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = generateMockPendingPayouts(user?.merchantId || 'merchant-001');
      setPayouts(data);
    } catch (error) {
      console.error('Failed to load pending payouts:', error);
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

  const getStatusBadge = (status: PayoutStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={styles[status]}>
        {status}
      </Badge>
    );
  };

  const formatMethod = (method: PayoutMethod) => {
    return method.replace('_', ' ');
  };

  const handleApprove = async (payoutId: string) => {
    // In a real app, this would call an API
    console.log('Approving payout:', payoutId);
    const updated = payouts.map(p =>
      p.id === payoutId ? { ...p, status: 'PROCESSING' as PayoutStatus, canApprove: false, canCancel: false } : p
    );
    setPayouts(updated);
  };

  const handleCancel = async (payoutId: string) => {
    // In a real app, this would call an API
    if (confirm('Are you sure you want to cancel this payout?')) {
      console.log('Cancelling payout:', payoutId);
      const updated = payouts.filter(p => p.id !== payoutId);
      setPayouts(updated);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPayouts.size === 0) return;
    if (confirm(`Are you sure you want to approve ${selectedPayouts.size} payout(s)?`)) {
      // In a real app, this would call an API
      console.log('Bulk approving payouts:', Array.from(selectedPayouts));
      const updated = payouts.map(p =>
        selectedPayouts.has(p.id) && p.canApprove
          ? { ...p, status: 'PROCESSING' as PayoutStatus, canApprove: false, canCancel: false }
          : p
      );
      setPayouts(updated);
      setSelectedPayouts(new Set());
    }
  };

  const handleSelectPayout = (payoutId: string) => {
    const newSelected = new Set(selectedPayouts);
    if (newSelected.has(payoutId)) {
      newSelected.delete(payoutId);
    } else {
      newSelected.add(payoutId);
    }
    setSelectedPayouts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPayouts.size === filteredPayouts.filter(p => p.canApprove).length) {
      setSelectedPayouts(new Set());
    } else {
      setSelectedPayouts(new Set(filteredPayouts.filter(p => p.canApprove).map(p => p.id)));
    }
  };

  // Filtered data
  const filteredPayouts = useMemo(() => {
    let filtered = [...payouts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.partnerName.toLowerCase().includes(query) ||
          p.payoutNumber.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(p => p.method === methodFilter);
    }

    return filtered;
  }, [payouts, searchQuery, statusFilter, methodFilter]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredPayouts.slice(start, end);
  }, [filteredPayouts, page, limit]);

  // Totals
  const totals = useMemo(() => {
    return filteredPayouts.reduce(
      (acc, p) => ({
        amount: acc.amount + p.amountCents,
        fees: acc.fees + p.feesCents,
        netAmount: acc.netAmount + p.netAmountCents,
        count: acc.count + 1,
      }),
      { amount: 0, fees: 0, netAmount: 0, count: 0 }
    );
  }, [filteredPayouts]);

  const columns: TableColumn<PendingPayout>[] = [
    {
      header: () => (
        <input
          type="checkbox"
          checked={selectedPayouts.size === filteredPayouts.filter(p => p.canApprove).length && filteredPayouts.filter(p => p.canApprove).length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      accessor: (row) => (
        <input
          type="checkbox"
          checked={selectedPayouts.has(row.id)}
          onChange={() => handleSelectPayout(row.id)}
          disabled={!row.canApprove}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
        />
      ),
    },
    {
      header: 'Payout #',
      accessor: (row) => (
        <span className="font-medium text-blue-600 cursor-pointer hover:underline">
          {row.payoutNumber}
        </span>
      ),
    },
    {
      header: 'Partner',
      accessor: (row) => row.partnerName,
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{formatCurrency(row.amountCents)}</div>
          <div className="text-xs text-gray-500">Net: {formatCurrency(row.netAmountCents)}</div>
        </div>
      ),
    },
    {
      header: 'Method',
      accessor: (row) => formatMethod(row.method),
    },
    {
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Scheduled Date',
      accessor: (row) => formatDate(row.scheduledDate),
    },
    {
      header: 'Period',
      accessor: (row) => (
        <div className="text-sm text-gray-600">
          {formatDate(row.periodStart)} - {formatDate(row.periodEnd)}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          {row.canApprove && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApprove(row.id)}
            >
              Approve
            </Button>
          )}
          {row.canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancel(row.id)}
              className="text-red-600 hover:text-red-700"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/merchant/payouts/pending/${row.id}`)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Payouts</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage pending payouts</p>
          </div>
          <div className="flex gap-2">
            {selectedPayouts.size > 0 && (
              <Button onClick={handleBulkApprove}>
                Approve Selected ({selectedPayouts.size})
              </Button>
            )}
            <Button onClick={loadPayouts}>Refresh</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Pending Payouts</div>
              <div className="text-2xl font-bold text-gray-900">{totals.count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.amount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Total Fees</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.fees)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Net Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.netAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search payouts..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'PROCESSING', label: 'Processing' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method
                </label>
                <Select
                  value={methodFilter}
                  onChange={(e) => {
                    setMethodFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Methods' },
                    { value: 'STRIPE', label: 'Stripe' },
                    { value: 'WISE', label: 'Wise' },
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                    { value: 'PAYPAL', label: 'PayPal' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Payouts ({filteredPayouts.length})
            </h2>
          </CardHeader>
          <CardContent>
            <Table
              data={paginatedData}
              columns={columns}
              loading={loading}
            />
            {!loading && filteredPayouts.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(filteredPayouts.length / limit)}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}

