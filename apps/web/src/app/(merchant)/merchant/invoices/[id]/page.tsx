'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button, Badge, Card, CardHeader, CardContent } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, InvoiceLineItem, InvoicePlatform } from '../page';
import { generateInvoicePDF } from '@/utils/invoicePDF';

// Generate platform-specific invoice links
function getPlatformInvoiceLink(platform: InvoicePlatform, invoiceId: string): string {
  const baseLinks: Record<string, string> = {
    STRIPE: 'https://dashboard.stripe.com/invoices',
    QUICKBOOKS: 'https://app.quickbooks.com/invoice',
    AUTHORIZE_NET: 'https://account.authorize.net/invoice',
    PAYPAL: 'https://www.paypal.com/invoice',
    SQUARE: 'https://squareup.com/invoices',
  };
  
  const baseLink = baseLinks[platform || ''] || '';
  return baseLink ? `${baseLink}/${invoiceId}` : '';
}

// Get platform display name
function getPlatformName(platform: InvoicePlatform): string {
  const platformNames: Record<string, string> = {
    STRIPE: 'Stripe',
    QUICKBOOKS: 'QuickBooks',
    AUTHORIZE_NET: 'Authorize.net',
    PAYPAL: 'PayPal',
    SQUARE: 'Square',
    MANUAL: 'Manual',
  };
  return platformNames[platform || ''] || 'N/A';
}

// Get platform badge color
function getPlatformBadgeColor(platform: InvoicePlatform): string {
  const colors: Record<string, string> = {
    STRIPE: 'bg-purple-100 text-purple-800',
    QUICKBOOKS: 'bg-blue-100 text-blue-800',
    AUTHORIZE_NET: 'bg-orange-100 text-orange-800',
    PAYPAL: 'bg-yellow-100 text-yellow-800',
    SQUARE: 'bg-green-100 text-green-800',
    MANUAL: 'bg-gray-100 text-gray-800',
  };
  return colors[platform || ''] || 'bg-gray-100 text-gray-800';
}

export default function InvoiceDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    if (!user?.merchantId || !invoiceId) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock invoice
      const issueDate = new Date();
      issueDate.setDate(issueDate.getDate() - 30);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30);
      
      const lineItems: InvoiceLineItem[] = [
        {
          id: 'item-1',
          description: 'Web Development Services',
          quantity: 40,
          unitPriceCents: 15000, // $150/hour
          totalCents: 600000, // $6,000
        },
        {
          id: 'item-2',
          description: 'UI/UX Design',
          quantity: 20,
          unitPriceCents: 12000, // $120/hour
          totalCents: 240000, // $2,400
        },
        {
          id: 'item-3',
          description: 'Consulting Services',
          quantity: 10,
          unitPriceCents: 20000, // $200/hour
          totalCents: 200000, // $2,000
        },
      ];
      
      const subtotal = lineItems.reduce((sum, item) => sum + item.totalCents, 0);
      const tax = Math.floor(subtotal * 0.1); // 10% tax
      const total = subtotal + tax;
      
      const platforms: Invoice['platform'][] = ['STRIPE', 'QUICKBOOKS', 'AUTHORIZE_NET', 'PAYPAL', 'SQUARE', 'MANUAL', null];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const platformLink = platform && platform !== 'MANUAL' 
        ? getPlatformInvoiceLink(platform, invoiceId)
        : null;

      const mockInvoice: Invoice = {
        id: invoiceId,
        invoiceNumber: `INV-${invoiceId.slice(-6).toUpperCase()}`,
        clientName: 'Acme Corporation',
        clientEmail: 'billing@acmecorp.com',
        status: 'SENT',
        subtotalCents: subtotal,
        taxCents: tax,
        totalCents: total,
        currency: 'USD',
        dueDate: dueDate.toISOString(),
        issueDate: issueDate.toISOString(),
        description: 'Monthly services invoice for web development, design, and consulting services.',
        lineItems,
        platform,
        platformInvoiceLink: platformLink,
        createdAt: issueDate.toISOString(),
        updatedAt: issueDate.toISOString(),
      };
      
      setInvoice(mockInvoice);
    } catch (error) {
      console.error('Failed to load invoice:', error);
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
    });
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const colors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      SENT: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-gray-100 text-gray-500',
    };
    
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${colors[status] || colors.DRAFT}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const handleSendInvoice = () => {
    // TODO: Implement send invoice functionality
    alert('Invoice sent! (This is a mock action)');
  };

  const handleMarkAsPaid = () => {
    // TODO: Implement mark as paid functionality
    alert('Invoice marked as paid! (This is a mock action)');
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    try {
      await generateInvoicePDF({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        description: invoice.description,
        lineItems: invoice.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          totalCents: item.totalCents,
        })),
        subtotalCents: invoice.subtotalCents,
        taxCents: invoice.taxCents,
        totalCents: invoice.totalCents,
        currency: invoice.currency,
        status: invoice.status,
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </MerchantLayout>
    );
  }

  if (!invoice) {
    return (
      <MerchantLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Invoice not found</p>
          <Button onClick={() => router.push('/merchant/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/merchant/invoices')}
              variant="outline"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Invoice Details
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(invoice.status)}
            {invoice.status === 'DRAFT' && (
              <Button
                onClick={() => router.push(`/merchant/invoices/${invoice.id}/edit`)}
                variant="outline"
              >
                Edit
              </Button>
            )}
            {invoice.status === 'SENT' && (
              <>
                <Button
                  onClick={handleMarkAsPaid}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark as Paid
                </Button>
              </>
            )}
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Invoice Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Invoice</h2>
                    <p className="text-sm text-gray-500 mt-1">{invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(invoice.issueDate)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill To</h3>
                  <div className="text-gray-900">
                    <p className="font-medium">{invoice.clientName}</p>
                    <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
                  </div>
                </div>

                {/* Description */}
                {invoice.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600">{invoice.description}</p>
                  </div>
                )}

                {/* Line Items */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Line Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoice.lineItems && invoice.lineItems.length > 0 ? (
                          invoice.lineItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.unitPriceCents)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.totalCents)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 text-center">
                              No line items
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotalCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">{formatCurrency(invoice.taxCents)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.totalCents)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{invoice.currency}</p>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Dates</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Platform Information */}
            {invoice.platform && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Platform</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Generated By</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPlatformBadgeColor(invoice.platform)}`}>
                      {getPlatformName(invoice.platform)}
                    </span>
                  </div>
                  {invoice.platformInvoiceLink && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Platform Invoice Link</p>
                      <a
                        href={invoice.platformInvoiceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center break-all"
                      >
                        <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {invoice.platformInvoiceLink}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {invoice.status === 'DRAFT' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={handleSendInvoice}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Send Invoice
                  </Button>
                  <Button
                    onClick={() => router.push(`/merchant/invoices/${invoice.id}/edit`)}
                    variant="outline"
                    className="w-full"
                  >
                    Edit Invoice
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}

