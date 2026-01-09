'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Table, TableColumn } from '@/components/ui/Table';
import { Button, Input, Select, Badge, Card, CardHeader, CardContent, Pagination } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export type InvoicePlatform = 'STRIPE' | 'QUICKBOOKS' | 'AUTHORIZE_NET' | 'PAYPAL' | 'SQUARE' | 'MANUAL' | null;

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  dueDate: string;
  issueDate: string;
  description?: string;
  lineItems: InvoiceLineItem[];
  platform: InvoicePlatform;
  platformInvoiceLink?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

// Mock data generator with realistic dummy invoice data
const generateMockInvoices = (count: number, merchantId: string): Invoice[] => {
  const invoices: Invoice[] = [];
  const statuses: Invoice['status'][] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
  const platforms: InvoicePlatform[] = ['STRIPE', 'QUICKBOOKS', 'AUTHORIZE_NET', 'PAYPAL', 'SQUARE', 'MANUAL', null];
  
  // Enhanced client data
  const clients = [
    { name: 'Acme Corporation', email: 'accounts@acmecorp.com' },
    { name: 'Tech Solutions Inc', email: 'billing@techsolutions.com' },
    { name: 'Global Industries Ltd', email: 'finance@globalindustries.com' },
    { name: 'Digital Services Co', email: 'payments@digitalservices.com' },
    { name: 'Innovation Labs', email: 'accounting@innovationlabs.com' },
    { name: 'Cloud Systems Group', email: 'billing@cloudsystems.com' },
    { name: 'Enterprise Solutions', email: 'accounts@enterprisesolutions.com' },
    { name: 'Smart Business Corp', email: 'finance@smartbusiness.com' },
    { name: 'Future Technologies', email: 'payments@futuretech.com' },
    { name: 'NextGen Services', email: 'billing@nextgenservices.com' },
    { name: 'Alpha Industries', email: 'accounts@alphaindustries.com' },
    { name: 'Beta Solutions', email: 'finance@betasolutions.com' },
  ];

  // Enhanced service descriptions
  const serviceDescriptions = [
    'Web Development Services',
    'Mobile App Development',
    'Cloud Infrastructure Setup',
    'Database Migration Services',
    'API Integration Services',
    'UI/UX Design Services',
    'Maintenance & Support (Monthly)',
    'Consulting Services',
    'Security Audit & Implementation',
    'Performance Optimization',
    'Content Management System',
    'E-commerce Platform Setup',
    'Payment Gateway Integration',
    'Data Analytics Services',
    'DevOps Implementation',
    'Software License (Annual)',
    'Training & Documentation',
    'Custom Software Development',
    'Third-party API Subscriptions',
    'Server Hosting (Monthly)',
  ];

  // Invoice descriptions
  const invoiceDescriptions = [
    'Professional services for software development and implementation',
    'Monthly recurring services and maintenance',
    'Project-based development services',
    'One-time implementation and setup services',
    'Consulting and advisory services',
    'Subscription-based services for the billing period',
    'Custom development and integration services',
  ];

  for (let i = 0; i < count; i++) {
    // Generate varied dates - some recent, some older
    const daysAgo = Math.floor(Math.random() * 180); // 0-180 days ago
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - daysAgo);
    issueDate.setHours(0, 0, 0, 0);
    
    // Due date is 15-45 days from issue date
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 15 + Math.floor(Math.random() * 30));
    
    // Select client
    const client = clients[Math.floor(Math.random() * clients.length)];
    
    // Generate line items with realistic services
    const lineItems: InvoiceLineItem[] = [];
    const itemCount = Math.floor(Math.random() * 5) + 1; // 1-5 items
    
    let calculatedSubtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const serviceDesc = serviceDescriptions[Math.floor(Math.random() * serviceDescriptions.length)];
      const quantity = j === 0 ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 5) + 1;
      // Vary unit prices more realistically - $50 to $500
      const unitPrice = Math.floor(Math.random() * 45000) + 5000; // $50 - $500
      const totalCents = quantity * unitPrice;
      
      lineItems.push({
        id: `item-${i}-${j}`,
        description: serviceDesc,
        quantity,
        unitPriceCents: unitPrice,
        totalCents: totalCents,
      });
      
      calculatedSubtotal += totalCents;
    }
    
    // Calculate tax (8-12% range)
    const taxRate = 0.08 + (Math.random() * 0.04); // 8% - 12%
    const taxCents = Math.floor(calculatedSubtotal * taxRate);
    const totalCents = calculatedSubtotal + taxCents;
    
    // Assign platform - weighted towards having a platform
    const platformRand = Math.random();
    let platform: InvoicePlatform;
    if (platformRand < 0.3) {
      platform = platforms[Math.floor(Math.random() * (platforms.length - 2))] || 'STRIPE'; // Exclude MANUAL and null
    } else if (platformRand < 0.5) {
      platform = 'MANUAL';
    } else {
      platform = null;
    }
    
    const invoiceId = `inv-${merchantId}-${i + 1}`;
    const platformLink = platform && platform !== 'MANUAL' 
      ? getPlatformInvoiceLink(platform, invoiceId)
      : null;
    
    // Status distribution - more PAID and SENT, fewer CANCELLED
    const statusRand = Math.random();
    let status: Invoice['status'];
    if (statusRand < 0.4) {
      status = 'PAID';
    } else if (statusRand < 0.7) {
      status = 'SENT';
    } else if (statusRand < 0.85) {
      status = 'DRAFT';
    } else if (statusRand < 0.95) {
      status = 'OVERDUE';
    } else {
      status = 'CANCELLED';
    }
    
    // If invoice is older than due date and not PAID/CANCELLED, likely OVERDUE
    if (status !== 'PAID' && status !== 'CANCELLED' && new Date() > dueDate) {
      const shouldBeOverdue = Math.random() > 0.3; // 70% chance
      if (shouldBeOverdue) {
        status = 'OVERDUE';
      }
    }
    
    const description = invoiceDescriptions[Math.floor(Math.random() * invoiceDescriptions.length)];
    
    invoices.push({
      id: invoiceId,
      invoiceNumber: `INV-${String(i + 1).padStart(6, '0')}`,
      clientName: client.name,
      clientEmail: client.email,
      status: status,
      subtotalCents: calculatedSubtotal,
      taxCents: taxCents,
      totalCents: totalCents,
      currency: 'USD',
      dueDate: dueDate.toISOString(),
      issueDate: issueDate.toISOString(),
      description: description,
      lineItems,
      platform: platform,
      platformInvoiceLink: platformLink,
      createdAt: issueDate.toISOString(),
      updatedAt: issueDate.toISOString(),
    });
  }
  
  return invoices;
};

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

export default function InvoicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.merchantId) {
      loadInvoices();
    }
  }, [page, statusFilter, platformFilter, searchQuery, user?.merchantId]);

  const loadInvoices = async () => {
    if (!user?.merchantId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let allInvoices = generateMockInvoices(150, user.merchantId);
      
      // Apply filters
      if (statusFilter !== 'all') {
        allInvoices = allInvoices.filter(inv => inv.status === statusFilter);
      }
      if (platformFilter !== 'all' && platformFilter !== 'null') {
        allInvoices = allInvoices.filter(inv => inv.platform === platformFilter);
      } else if (platformFilter === 'null') {
        allInvoices = allInvoices.filter(inv => inv.platform === null);
      }
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        allInvoices = allInvoices.filter(inv =>
          inv.invoiceNumber.toLowerCase().includes(search) ||
          inv.clientName.toLowerCase().includes(search) ||
          inv.clientEmail.toLowerCase().includes(search)
        );
      }
      
      // Sort by date (newest first)
      allInvoices.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
      
      const start = (page - 1) * limit;
      const end = start + limit;
      
      setInvoices(allInvoices.slice(start, end));
      setTotalPages(Math.ceil(allInvoices.length / limit));
      setTotal(allInvoices.length);
    } catch (error) {
      console.error('Failed to load invoices:', error);
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

  const getStatusBadge = (status: Invoice['status']) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      PAID: 'success',
      SENT: 'warning',
      OVERDUE: 'error',
      DRAFT: 'default',
      CANCELLED: 'default',
    };
    
    const colors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      SENT: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-gray-100 text-gray-500',
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || colors.DRAFT}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const getPlatformBadge = (platform: InvoicePlatform) => {
    if (!platform) return null;
    
    const platformNames: Record<string, string> = {
      STRIPE: 'Stripe',
      QUICKBOOKS: 'QuickBooks',
      AUTHORIZE_NET: 'Authorize.net',
      PAYPAL: 'PayPal',
      SQUARE: 'Square',
      MANUAL: 'Manual',
    };
    
    const platformColors: Record<string, string> = {
      STRIPE: 'bg-purple-100 text-purple-800',
      QUICKBOOKS: 'bg-blue-100 text-blue-800',
      AUTHORIZE_NET: 'bg-orange-100 text-orange-800',
      PAYPAL: 'bg-yellow-100 text-yellow-800',
      SQUARE: 'bg-green-100 text-green-800',
      MANUAL: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${platformColors[platform] || platformColors.MANUAL}`}>
        {platformNames[platform] || platform}
      </span>
    );
  };

  // Define columns using useMemo to ensure it's always defined
  const columns: TableColumn<Invoice>[] = useMemo(() => [
    {
      header: 'Invoice #',
      accessor: (row) => (
        <button
          onClick={() => router.push(`/merchant/invoices/${row.id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {row.invoiceNumber}
        </button>
      ),
    },
    {
      header: 'Client',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.clientName}</div>
          <div className="text-sm text-gray-500">{row.clientEmail}</div>
        </div>
      ),
    },
    {
      header: 'Issue Date',
      accessor: (row) => formatDate(row.issueDate),
    },
    {
      header: 'Due Date',
      accessor: (row) => formatDate(row.dueDate),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900">{formatCurrency(row.totalCents)}</div>
          <div className="text-sm text-gray-500">{row.currency}</div>
        </div>
      ),
    },
    {
      header: 'Platform',
      accessor: (row) => getPlatformBadge(row.platform) || <span className="text-gray-400 text-sm">—</span>,
    },
    {
      header: 'Platform Link',
      accessor: (row) => row.platformInvoiceLink ? (
        <a
          href={row.platformInvoiceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
        >
          View
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/merchant/invoices/${row.id}`)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          {row.status === 'DRAFT' && (
            <button
              onClick={() => router.push(`/merchant/invoices/${row.id}/edit`)}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>
      ),
    },
  ], [router]);

  // Wait for user to be loaded
  if (!user) {
    return (
      <MerchantLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track your invoices
            </p>
          </div>
          <Button
            onClick={() => router.push('/merchant/invoices/create')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </Button>
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
                  type="text"
                  placeholder="Search by invoice #, client name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full"
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'SENT', label: 'Sent' },
                    { value: 'PAID', label: 'Paid' },
                    { value: 'OVERDUE', label: 'Overdue' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <Select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full"
                  options={[
                    { value: 'all', label: 'All Platforms' },
                    { value: 'STRIPE', label: 'Stripe' },
                    { value: 'QUICKBOOKS', label: 'QuickBooks' },
                    { value: 'AUTHORIZE_NET', label: 'Authorize.net' },
                    { value: 'PAYPAL', label: 'PayPal' },
                    { value: 'SQUARE', label: 'Square' },
                    { value: 'MANUAL', label: 'Manual' },
                    { value: 'null', label: 'No Platform' },
                  ]}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPlatformFilter('all');
                    setPage(1);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Invoice History
              </h2>
              <span className="text-sm text-gray-500">
                {total} total invoices
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No invoices found</p>
                <Button
                  onClick={() => router.push('/merchant/invoices/create')}
                  className="mt-4"
                >
                  Create Your First Invoice
                </Button>
              </div>
            ) : (
              <>
                {Array.isArray(invoices) && Array.isArray(columns) && invoices.length > 0 ? (
                  <>
                    <Table data={invoices} columns={columns} />
                    {totalPages > 1 && (
                      <div className="mt-4 flex justify-center">
                        <Pagination
                          currentPage={page}
                          totalPages={totalPages}
                          onPageChange={setPage}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No invoices to display</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}

