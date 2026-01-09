'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PaymentStatusBadge } from '@/components/invoices/PaymentStatusBadge';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button, Badge } from '@/components/ui';
import { mockInvoiceService, Payment } from '@/services/mockInvoices';
import { formatCurrency, formatDate } from '@/lib/format';

export default function PaymentStatusPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (params.invoiceId) {
      loadPaymentStatus();
    }
  }, [params.invoiceId]);

  const loadPaymentStatus = async () => {
    setLoading(true);
    try {
      const data = await mockInvoiceService.getPaymentStatus(params.invoiceId as string);
      setPayment(data);
    } catch (error) {
      console.error('Failed to load payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!payment) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Payment not found</p>
            <Button onClick={() => router.push('/invoices')} className="mt-4">
              Back to Invoices
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push(`/invoices/${params.invoiceId}`)}
              className="mb-2"
            >
              ← Back to Invoice
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Payment Status</h1>
            <p className="mt-1 text-sm text-gray-500">Track payment processing and status</p>
          </div>
          <PaymentStatusBadge status={payment.status} />
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Payment Information" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-medium text-gray-900">{payment.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {payment.paymentMethod?.replace('_', ' ') || '—'}
                  </p>
                </div>
                {payment.transactionId && (
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono text-sm text-gray-900">{payment.transactionId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Status Details" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(payment.createdAt, 'long')}
                  </p>
                </div>
                {payment.paidAt && (
                  <div>
                    <p className="text-sm text-gray-600">Paid At</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(payment.paidAt, 'long')}
                    </p>
                  </div>
                )}
                {payment.failureReason && (
                  <div>
                    <p className="text-sm text-gray-600">Failure Reason</p>
                    <p className="font-medium text-red-600">{payment.failureReason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {payment.status === 'failed' && (
          <Card>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Payment Failed</h4>
                    <p className="text-sm text-red-800">
                      This payment could not be processed. Please review the failure reason and retry.
                    </p>
                  </div>
                  <Button variant="primary">Retry Payment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

