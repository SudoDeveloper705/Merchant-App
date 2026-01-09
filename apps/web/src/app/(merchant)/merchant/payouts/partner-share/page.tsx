'use client';

import { useState, useEffect, useMemo } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button, Input, Select, Card, CardHeader, CardContent, Badge, Table, TableColumn, Pagination } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { PartnerShare } from '@/types/payouts';

// Mock data generator
const generateMockPartnerShares = (merchantId: string): PartnerShare[] => {
  const partners = [
    { id: 'partner-001', name: 'Tech Solutions Inc' },
    { id: 'partner-002', name: 'Global Services Ltd' },
    { id: 'partner-003', name: 'Digital Marketing Pro' },
    { id: 'partner-004', name: 'Creative Agency' },
    { id: 'partner-005', name: 'Cloud Systems Group' },
    { id: 'partner-006', name: 'Enterprise Solutions' },
    { id: 'partner-007', name: 'Smart Business Corp' },
  ];

  const periodStart = new Date();
  periodStart.setMonth(periodStart.getMonth() - 1);
  const periodEnd = new Date();

  return partners.map((partner, index) => {
    const revenueCents = (50000 + Math.random() * 200000) * 100; // $50k - $250k
    const sharePercentage = 10 + (index * 2.5); // 10% - 25%
    const shareAmountCents = Math.floor(revenueCents * (sharePercentage / 100));
    const transactionCount = Math.floor(50 + Math.random() * 200);

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      revenueCents: Math.floor(revenueCents),
      sharePercentage,
      shareAmountCents,
      splitRuleId: `rule-${partner.id}`,
      splitRuleName: `${sharePercentage}% Revenue Share`,
      transactionCount,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    };
  });
};

export default function PartnerSharePage() {
  const { user } = useAuth();
  const [partnerShares, setPartnerShares] = useState<PartnerShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'share' | 'amount'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user?.merchantId) {
      loadPartnerShares();
    }
  }, [user?.merchantId]);

  const loadPartnerShares = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const shares = generateMockPartnerShares(user?.merchantId || 'merchant-001');
      setPartnerShares(shares);
      setTotalPages(Math.ceil(shares.length / limit));
    } catch (error) {
      console.error('Failed to load partner shares:', error);
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

  // Filtered and sorted data
  const filteredAndSorted = useMemo(() => {
    let filtered = [...partnerShares];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        share =>
          share.partnerName.toLowerCase().includes(query) ||
          share.splitRuleName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'revenue':
          aValue = a.revenueCents;
          bValue = b.revenueCents;
          break;
        case 'share':
          aValue = a.sharePercentage;
          bValue = b.sharePercentage;
          break;
        case 'amount':
          aValue = a.shareAmountCents;
          bValue = b.shareAmountCents;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [partnerShares, searchQuery, sortBy, sortOrder]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, page, limit]);

  // Totals
  const totals = useMemo(() => {
    return filteredAndSorted.reduce(
      (acc, share) => ({
        revenue: acc.revenue + share.revenueCents,
        shareAmount: acc.shareAmount + share.shareAmountCents,
        transactionCount: acc.transactionCount + share.transactionCount,
      }),
      { revenue: 0, shareAmount: 0, transactionCount: 0 }
    );
  }, [filteredAndSorted]);

  const handleSort = (field: 'revenue' | 'share' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const columns: TableColumn<PartnerShare>[] = [
    {
      header: 'Partner',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.partnerName}</div>
          <div className="text-sm text-gray-500">{row.splitRuleName}</div>
        </div>
      ),
    },
    {
      header: () => (
        <button
          onClick={() => handleSort('revenue')}
          className="flex items-center gap-1 hover:text-gray-900"
        >
          Revenue
          {sortBy === 'revenue' && (
            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ),
      accessor: (row) => (
        <span className="font-medium">{formatCurrency(row.revenueCents)}</span>
      ),
    },
    {
      header: () => (
        <button
          onClick={() => handleSort('share')}
          className="flex items-center gap-1 hover:text-gray-900"
        >
          Share %
          {sortBy === 'share' && (
            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ),
      accessor: (row) => (
        <Badge className="bg-blue-100 text-blue-800">
          {row.sharePercentage.toFixed(2)}%
        </Badge>
      ),
    },
    {
      header: () => (
        <button
          onClick={() => handleSort('amount')}
          className="flex items-center gap-1 hover:text-gray-900"
        >
          Share Amount
          {sortBy === 'amount' && (
            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ),
      accessor: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.shareAmountCents)}
        </span>
      ),
    },
    {
      header: 'Transactions',
      accessor: (row) => (
        <span className="text-gray-600">{row.transactionCount.toLocaleString()}</span>
      ),
    },
    {
      header: 'Period',
      accessor: (row) => (
        <div className="text-sm text-gray-600">
          {formatDate(row.periodStart)} - {formatDate(row.periodEnd)}
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
            <h1 className="text-3xl font-bold text-gray-900">Partner Share Breakdown</h1>
            <p className="mt-1 text-sm text-gray-500">View how revenue is split among partners</p>
          </div>
          <Button onClick={loadPartnerShares}>Refresh</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.revenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Total Share Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.shareAmount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Total Transactions</div>
              <div className="text-2xl font-bold text-gray-900">
                {totals.transactionCount.toLocaleString()}
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
                  placeholder="Search by partner name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'revenue' | 'share' | 'amount');
                    setPage(1);
                  }}
                  options={[
                    { value: 'revenue', label: 'Revenue' },
                    { value: 'share', label: 'Share %' },
                    { value: 'amount', label: 'Share Amount' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <Select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as 'asc' | 'desc');
                    setPage(1);
                  }}
                  options={[
                    { value: 'desc', label: 'Descending' },
                    { value: 'asc', label: 'Ascending' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Shares Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Partner Shares ({filteredAndSorted.length})
            </h2>
          </CardHeader>
          <CardContent>
            <Table
              data={paginatedData}
              columns={columns}
              loading={loading}
            />
            {!loading && filteredAndSorted.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(filteredAndSorted.length / limit)}
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

