'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button, Input, Select, Card, CardHeader, CardContent, Badge, Table, TableColumn, Pagination } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { HistoricalPayout, PayoutStatus, PayoutMethod } from '@/types/payouts';

// Mock data generator
const generateMockHistoricalPayouts = (merchantId: string): HistoricalPayout[] => {
  const partners = [
    { id: 'partner-001', name: 'Tech Solutions Inc' },
    { id: 'partner-002', name: 'Global Services Ltd' },
    { id: 'partner-003', name: 'Digital Marketing Pro' },
    { id: 'partner-004', name: 'Creative Agency' },
    { id: 'partner-005', name: 'Cloud Systems Group' },
  ];

  const methods: PayoutMethod[] = ['STRIPE', 'WISE', 'BANK_TRANSFER', 'PAYPAL'];
  const statuses: PayoutStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED'];

  const payouts: HistoricalPayout[] = [];

  for (let i = 0; i < 50; i++) {
    const partner = partners[Math.floor(Math.random() * partners.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 180));
    
    const processedDate = status === 'COMPLETED' 
      ? new Date(scheduledDate.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000)
      : undefined;
    
    const completedDate = status === 'COMPLETED'
      ? new Date(processedDate!.getTime() + Math.random() * 24 * 60 * 60 * 1000)
      : undefined;

    const periodStart = new Date(scheduledDate);
    periodStart.setMonth(periodStart.getMonth() - 1);
    const periodEnd = new Date(scheduledDate);

    const amountCents = Math.floor((10000 + Math.random() * 100000) * 100); // $10k - $110k
    const feesCents = Math.floor(amountCents * 0.02); // 2% fee
    const netAmountCents = amountCents - feesCents;

    payouts.push({
      id: `payout-${i + 1}`,
      payoutNumber: `PO-${String(i + 1).padStart(6, '0')}`,
      partnerId: partner.id,
      partnerName: partner.name,
      amountCents,
      currency: 'USD',
      method,
      status,
      scheduledDate: scheduledDate.toISOString(),
      processedDate: processedDate?.toISOString(),
      completedDate: completedDate?.toISOString(),
      description: `Monthly revenue share payout - ${periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      transactionIds: Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, j) => `txn-${i}-${j}`),
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      feesCents,
      netAmountCents,
      createdAt: scheduledDate.toISOString(),
      updatedAt: completedDate?.toISOString() || scheduledDate.toISOString(),
    });
  }

  return payouts.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
};

export default function HistoricalPayoutsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [payouts, setPayouts] = useState<HistoricalPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    if (user?.merchantId) {
      loadPayouts();
    }
  }, [user?.merchantId]);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = generateMockHistoricalPayouts(user?.merchantId || 'merchant-001');
      setPayouts(data);
    } catch (error) {
      console.error('Failed to load historical payouts:', error);
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
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
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

    if (dateRange.start) {
      filtered = filtered.filter(p => new Date(p.scheduledDate) >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      filtered = filtered.filter(p => new Date(p.scheduledDate) <= new Date(dateRange.end));
    }

    return filtered;
  }, [payouts, searchQuery, statusFilter, methodFilter, dateRange]);

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

  const columns: TableColumn<HistoricalPayout>[] = [
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
      header: 'Scheduled',
      accessor: (row) => formatDate(row.scheduledDate),
    },
    {
      header: 'Completed',
      accessor: (row) => row.completedDate ? formatDate(row.completedDate) : '-',
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/merchant/payouts/history/${row.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historical Payouts</h1>
            <p className="mt-1 text-sm text-gray-500">View past payout records and history</p>
          </div>
          <Button onClick={loadPayouts}>Refresh</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Total Payouts</div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'FAILED', label: 'Failed' },
                    { value: 'CANCELLED', label: 'Cancelled' },
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, start: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, end: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Historical Payouts ({filteredPayouts.length})
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

