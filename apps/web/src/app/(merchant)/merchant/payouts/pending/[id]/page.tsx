'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button, Badge, Card, CardHeader, CardContent } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { PendingPayout, PayoutStatus, PayoutMethod } from '@/types/payouts';

// Mock data generator - same as in list page
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

  return payouts;
};

export default function PendingPayoutDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const payoutId = params?.id as string;

  const [payout, setPayout] = useState<PendingPayout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.merchantId && payoutId) {
      loadPayout();
    }
  }, [user?.merchantId, payoutId]);

  const loadPayout = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const allPayouts = generateMockPendingPayouts(user?.merchantId || 'merchant-001');
      const foundPayout = allPayouts.find(p => p.id === payoutId);
      
      if (foundPayout) {
        setPayout(foundPayout);
      } else {
        // If not found, create a mock payout with the ID
        const partners = [
          { id: 'partner-001', name: 'Tech Solutions Inc' },
          { id: 'partner-002', name: 'Global Services Ltd' },
          { id: 'partner-003', name: 'Digital Marketing Pro' },
          { id: 'partner-004', name: 'Creative Agency' },
          { id: 'partner-005', name: 'Cloud Systems Group' },
        ];
        const partner = partners[Math.floor(Math.random() * partners.length)];
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 30));
        
        const periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - 1);
        const periodEnd = new Date();

        const amountCents = Math.floor((10000 + Math.random() * 100000) * 100);
        const feesCents = Math.floor(amountCents * 0.02);
        const netAmountCents = amountCents - feesCents;

        setPayout({
          id: payoutId,
          payoutNumber: `PO-P-${payoutId.split('-')[2]?.padStart(6, '0') || '000001'}`,
          partnerId: partner.id,
          partnerName: partner.name,
          amountCents,
          currency: 'USD',
          method: 'STRIPE',
          status: 'PENDING',
          scheduledDate: scheduledDate.toISOString(),
          description: `Monthly revenue share payout - ${periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
          transactionIds: Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, j) => `txn-${j}`),
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          feesCents,
          netAmountCents,
          canApprove: true,
          canCancel: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to load payout:', error);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const handleApprove = async () => {
    if (!payout) return;
    if (confirm('Are you sure you want to approve this payout?')) {
      // In a real app, this would call an API
      setPayout({
        ...payout,
        status: 'PROCESSING',
        canApprove: false,
        canCancel: false,
      });
    }
  };

  const handleCancel = async () => {
    if (!payout) return;
    if (confirm('Are you sure you want to cancel this payout?')) {
      // In a real app, this would call an API
      router.push('/merchant/payouts/pending');
    }
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading payout details...</div>
        </div>
      </MerchantLayout>
    );
  }

  if (!payout) {
    return (
      <MerchantLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Payout Not Found</h1>
            <Button onClick={() => router.push('/merchant/payouts/pending')}>
              Back to Pending
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">The payout you are looking for does not exist.</p>
            </CardContent>
          </Card>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payout Details</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage pending payout</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/merchant/payouts/pending')}>
              Back to Pending
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payout Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Payout Information</h2>
                  {getStatusBadge(payout.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payout Number</p>
                    <p className="text-lg font-semibold text-gray-900">{payout.payoutNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Partner</p>
                    <p className="text-lg font-semibold text-gray-900">{payout.partnerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Method</p>
                    <p className="text-lg font-medium text-gray-900">{formatMethod(payout.method)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="text-lg font-medium text-gray-900">{payout.currency}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-900">{payout.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Financial Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gross Amount</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(payout.amountCents)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fees</span>
                    <span className="text-lg font-medium text-red-600">
                      -{formatCurrency(payout.feesCents)}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Net Amount</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(payout.netAmountCents)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction IDs */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  Related Transactions ({payout.transactionIds.length})
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {payout.transactionIds.map((txnId, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-mono text-gray-700">{txnId}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/merchant/transactions?search=${txnId}`)}
                      >
                        View Transaction
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {payout.canApprove || payout.canCancel ? (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {payout.canApprove && (
                    <Button
                      onClick={handleApprove}
                      className="w-full"
                    >
                      Approve Payout
                    </Button>
                  )}
                  {payout.canCancel && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      Cancel Payout
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Scheduled Date */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Scheduled Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(payout.scheduledDate)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Period */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Period</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(payout.periodStart)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(payout.periodEnd)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(payout.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(payout.updatedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}

