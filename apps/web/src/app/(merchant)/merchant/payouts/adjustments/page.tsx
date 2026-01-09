'use client';

import { useState, useEffect, useMemo } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button, Input, Select, Card, CardHeader, CardContent, Badge, Table, TableColumn, Pagination, Textarea } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { PayoutAdjustment, AdjustmentType } from '@/types/payouts';

// Mock data generator
const generateMockAdjustments = (merchantId: string): PayoutAdjustment[] => {
  const partners = [
    { id: 'partner-001', name: 'Tech Solutions Inc' },
    { id: 'partner-002', name: 'Global Services Ltd' },
    { id: 'partner-003', name: 'Digital Marketing Pro' },
    { id: 'partner-004', name: 'Creative Agency' },
    { id: 'partner-005', name: 'Cloud Systems Group' },
  ];

  const types: AdjustmentType[] = ['MANUAL_OVERRIDE', 'CORRECTION', 'REFUND', 'BONUS', 'PENALTY'];
  const statuses = ['PENDING', 'APPLIED', 'REJECTED', 'CANCELLED'];

  const adjustments: PayoutAdjustment[] = [];

  for (let i = 0; i < 30; i++) {
    const partner = partners[Math.floor(Math.random() * partners.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));

    const appliedDate = status === 'APPLIED'
      ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      : undefined;

    const approvedAt = status === 'APPLIED'
      ? new Date(createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)
      : undefined;

    // Positive for BONUS, negative for PENALTY/REFUND, variable for others
    const baseAmount = type === 'BONUS' 
      ? Math.random() * 5000 + 1000
      : type === 'PENALTY' || type === 'REFUND'
      ? -(Math.random() * 5000 + 1000)
      : (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5000 + 500);

    adjustments.push({
      id: `adj-${i + 1}`,
      adjustmentNumber: `ADJ-${String(i + 1).padStart(6, '0')}`,
      payoutId: Math.random() > 0.3 ? `payout-${Math.floor(Math.random() * 10) + 1}` : undefined,
      partnerId: partner.id,
      partnerName: partner.name,
      type,
      amountCents: Math.floor(baseAmount * 100),
      currency: 'USD',
      reason: `Adjustment for ${type.toLowerCase().replace('_', ' ')}`,
      description: `Manual adjustment applied to correct payout calculation discrepancy`,
      appliedDate: appliedDate?.toISOString(),
      status: status as 'PENDING' | 'APPLIED' | 'REJECTED' | 'CANCELLED',
      approvedBy: status === 'APPLIED' ? 'admin@merchant.com' : undefined,
      approvedAt: approvedAt?.toISOString(),
      createdBy: 'merchant-owner@merchant.com',
      createdAt: createdAt.toISOString(),
      updatedAt: appliedDate?.toISOString() || createdAt.toISOString(),
    });
  }

  return adjustments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export default function AdjustmentsPage() {
  const { user } = useAuth();
  const [adjustments, setAdjustments] = useState<PayoutAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    partnerId: '',
    partnerName: '',
    type: 'MANUAL_OVERRIDE' as AdjustmentType,
    amountCents: 0,
    reason: '',
    description: '',
    payoutId: '',
  });

  useEffect(() => {
    if (user?.merchantId) {
      loadAdjustments();
    }
  }, [user?.merchantId]);

  const loadAdjustments = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = generateMockAdjustments(user?.merchantId || 'merchant-001');
      setAdjustments(data);
    } catch (error) {
      console.error('Failed to load adjustments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    const amount = cents / 100;
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeBadge = (type: AdjustmentType) => {
    const styles = {
      MANUAL_OVERRIDE: 'bg-blue-100 text-blue-800',
      CORRECTION: 'bg-yellow-100 text-yellow-800',
      REFUND: 'bg-red-100 text-red-800',
      BONUS: 'bg-green-100 text-green-800',
      PENALTY: 'bg-orange-100 text-orange-800',
    };
    return (
      <Badge className={styles[type]}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPLIED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const handleCreate = () => {
    setFormData({
      partnerId: '',
      partnerName: '',
      type: 'MANUAL_OVERRIDE',
      amountCents: 0,
      reason: '',
      description: '',
      payoutId: '',
    });
    setShowCreateModal(true);
  };

  const handleSave = () => {
    // In a real app, this would call an API
    console.log('Creating adjustment:', formData);
    setShowCreateModal(false);
    loadAdjustments();
  };

  const handleApprove = async (adjustmentId: string) => {
    // In a real app, this would call an API
    console.log('Approving adjustment:', adjustmentId);
    const updated = adjustments.map(a =>
      a.id === adjustmentId
        ? {
            ...a,
            status: 'APPLIED' as const,
            appliedDate: new Date().toISOString(),
            approvedBy: user?.email || 'admin@merchant.com',
            approvedAt: new Date().toISOString(),
          }
        : a
    );
    setAdjustments(updated);
  };

  const handleReject = async (adjustmentId: string) => {
    // In a real app, this would call an API
    if (confirm('Are you sure you want to reject this adjustment?')) {
      console.log('Rejecting adjustment:', adjustmentId);
      const updated = adjustments.map(a =>
        a.id === adjustmentId ? { ...a, status: 'REJECTED' as const } : a
      );
      setAdjustments(updated);
    }
  };

  // Filtered data
  const filteredAdjustments = useMemo(() => {
    let filtered = [...adjustments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.partnerName.toLowerCase().includes(query) ||
          a.adjustmentNumber.toLowerCase().includes(query) ||
          a.reason.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    return filtered;
  }, [adjustments, searchQuery, typeFilter, statusFilter]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredAdjustments.slice(start, end);
  }, [filteredAdjustments, page, limit]);

  // Totals
  const totals = useMemo(() => {
    return filteredAdjustments.reduce(
      (acc, a) => ({
        totalAmount: acc.totalAmount + a.amountCents,
        pendingCount: acc.pendingCount + (a.status === 'PENDING' ? 1 : 0),
        appliedCount: acc.appliedCount + (a.status === 'APPLIED' ? 1 : 0),
      }),
      { totalAmount: 0, pendingCount: 0, appliedCount: 0 }
    );
  }, [filteredAdjustments]);

  const columns: TableColumn<PayoutAdjustment>[] = [
    {
      header: 'Adjustment #',
      accessor: (row) => (
        <span className="font-medium text-blue-600">
          {row.adjustmentNumber}
        </span>
      ),
    },
    {
      header: 'Partner',
      accessor: (row) => row.partnerName,
    },
    {
      header: 'Type',
      accessor: (row) => getTypeBadge(row.type),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className={`font-semibold ${row.amountCents >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(row.amountCents)}
        </span>
      ),
    },
    {
      header: 'Reason',
      accessor: (row) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900">{row.reason}</div>
          <div className="text-xs text-gray-500 truncate">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Created',
      accessor: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Applied',
      accessor: (row) => row.appliedDate ? formatDate(row.appliedDate) : '-',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          {row.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApprove(row.id)}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(row.id)}
                className="text-red-600 hover:text-red-700"
              >
                Reject
              </Button>
            </>
          )}
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
            <h1 className="text-3xl font-bold text-gray-900">Adjustments & Overrides</h1>
            <p className="mt-1 text-sm text-gray-500">Manage payout adjustments and manual overrides</p>
          </div>
          <Button onClick={handleCreate}>Create Adjustment</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Total Adjustments</div>
              <div className="text-2xl font-bold text-gray-900">{filteredAdjustments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Pending Approval</div>
              <div className="text-2xl font-bold text-gray-900">{totals.pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Net Adjustment Amount</div>
              <div className={`text-2xl font-bold ${totals.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.totalAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  placeholder="Search adjustments..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'MANUAL_OVERRIDE', label: 'Manual Override' },
                    { value: 'CORRECTION', label: 'Correction' },
                    { value: 'REFUND', label: 'Refund' },
                    { value: 'BONUS', label: 'Bonus' },
                    { value: 'PENALTY', label: 'Penalty' },
                  ]}
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
                    { value: 'APPLIED', label: 'Applied' },
                    { value: 'REJECTED', label: 'Rejected' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                  ]}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setPage(1);
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adjustments Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Adjustments ({filteredAdjustments.length})
            </h2>
          </CardHeader>
          <CardContent>
            <Table
              data={paginatedData}
              columns={columns}
              loading={loading}
            />
            {!loading && filteredAdjustments.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(filteredAdjustments.length / limit)}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Create Adjustment</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner
                  </label>
                  <Input
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    placeholder="Enter partner name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AdjustmentType })}
                    options={[
                      { value: 'MANUAL_OVERRIDE', label: 'Manual Override' },
                      { value: 'CORRECTION', label: 'Correction' },
                      { value: 'REFUND', label: 'Refund' },
                      { value: 'BONUS', label: 'Bonus' },
                      { value: 'PENALTY', label: 'Penalty' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.amountCents / 100}
                    onChange={(e) => setFormData({ ...formData, amountCents: (parseFloat(e.target.value) || 0) * 100 })}
                    step="0.01"
                    placeholder="Enter amount (negative for deductions)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <Input
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Brief reason for adjustment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the adjustment"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payout ID (Optional)
                  </label>
                  <Input
                    value={formData.payoutId}
                    onChange={(e) => setFormData({ ...formData, payoutId: e.target.value })}
                    placeholder="Link to specific payout (optional)"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Create Adjustment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}

