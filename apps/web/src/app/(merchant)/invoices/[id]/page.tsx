'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PaymentStatusBadge } from '@/components/invoices/PaymentStatusBadge';
import { RevenueSplitPreview } from '@/components/invoices/RevenueSplitPreview';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button, Badge } from '@/components/ui';
import { mockInvoiceService, Invoice } from '@/services/mockInvoices';
import { formatCurrency, formatDate } from '@/lib/format';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const data = await mockInvoiceService.getInvoice(params.id as string);
      setInvoice(data);
    } catch (error) {
      console.error('Failed to load invoice:', error);
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

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Invoice not found</p>
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
              onClick={() => router.push('/invoices')}
              className="mb-2"
            >
              ← Back to Invoices
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
            <p className="mt-1 text-sm text-gray-500">Invoice details and payment status</p>
          </div>
          <div className="flex items-center space-x-3">
            <PaymentStatusBadge status={invoice.paymentStatus} />
            <Button variant="outline">Actions</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader title="Client Information" />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Client Name</p>
                    <p className="font-medium text-gray-900">{invoice.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{invoice.clientEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader title="Line Items" />
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader title="Totals" />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales Tax:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(invoice.salesTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Processing Fees:</span>
                    <span className="font-medium">-{formatCurrency(invoice.fees)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revenue Split Preview */}
            {invoice.partnerSplits.length > 0 && (
              <RevenueSplitPreview
                subtotal={invoice.subtotal}
                salesTax={invoice.salesTax}
                fees={invoice.fees}
                partnerSplits={invoice.partnerSplits.map(partner => ({
                  name: partner.partnerName,
                  percentage: partner.percentage,
                }))}
              />
            )}

            {/* Invoice Details */}
            <Card>
              <CardHeader title="Invoice Details" />
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Invoice Number</p>
                    <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Issue Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(invoice.issueDate, 'short')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(invoice.dueDate, 'short')}</p>
                  </div>
                  {invoice.paidDate && (
                    <div>
                      <p className="text-xs text-gray-500">Paid Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(invoice.paidDate, 'short')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <div className="mt-1">
                      <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'default'}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

