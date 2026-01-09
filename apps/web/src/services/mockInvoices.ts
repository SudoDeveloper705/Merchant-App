/**
 * Mock Invoice & Payment Service
 * 
 * Provides mock data for invoicing and payment screens.
 */

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  status: 'draft' | 'sent' | 'paid' | 'pending' | 'failed' | 'disputed' | 'refunded';
  subtotal: number;
  salesTax: number;
  total: number;
  fees: number;
  netAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  description: string;
  lineItems: InvoiceLineItem[];
  partnerSplits: Array<{ partnerId: string; partnerName: string; percentage: number }>;
  paymentMethod: string | null;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'disputed' | 'refunded' | 'partial';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'disputed' | 'refunded';
  paymentMethod: string;
  transactionId: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PayoutSchedule {
  id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  currency: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  scheduledDate: string;
  processedDate: string | null;
  description: string;
  relatedInvoices: string[];
}

export interface RevenueSplit {
  subtotal: number;
  salesTax: number;
  fees: number;
  merchantShare: number;
  partnerSplits: Array<{ partnerId: string; partnerName: string; amount: number; percentage: number }>;
  netAmount: number;
}

export const mockInvoiceService = {
  /**
   * Create Invoice
   */
  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    await delay(800);
    
    return {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      clientName: data.clientName || '',
      clientEmail: data.clientEmail || '',
      status: 'draft',
      subtotal: data.subtotal || 0,
      salesTax: data.salesTax || 0,
      total: (data.subtotal || 0) + (data.salesTax || 0),
      fees: 0,
      netAmount: 0,
      currency: data.currency || 'USD',
      issueDate: new Date().toISOString(),
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paidDate: null,
      description: data.description || '',
      lineItems: data.lineItems || [],
      partnerSplits: data.partnerSplits || [],
      paymentMethod: null,
      paymentStatus: 'pending',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Get Invoice
   */
  async getInvoice(id: string): Promise<Invoice | null> {
    await delay(300);
    
    // Mock invoice data
    return {
      id,
      invoiceNumber: 'INV-001234',
      clientName: 'Acme Corporation',
      clientEmail: 'billing@acmecorp.com',
      status: 'sent',
      subtotal: 1000000, // $10,000
      salesTax: 80000, // $800 (8%)
      total: 1080000, // $10,800
      fees: 32400, // $324 (3%)
      netAmount: 1047600, // $10,476
      currency: 'USD',
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      paidDate: null,
      description: 'Monthly service subscription',
      lineItems: [
        { id: '1', description: 'Premium Plan', quantity: 1, unitPrice: 1000000, amount: 1000000 },
      ],
      partnerSplits: [
        { partnerId: 'partner-001', partnerName: 'Tech Solutions Inc', percentage: 30 },
      ],
      paymentMethod: null,
      paymentStatus: 'pending',
      notes: '',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  /**
   * Get Invoices
   */
  async getInvoices(page: number = 1, limit: number = 20, filters?: {
    status?: string;
    clientName?: string;
  }): Promise<{ data: Invoice[]; pagination: any }> {
    await delay(500);
    
    const invoices: Invoice[] = [];
    const statuses: Invoice['status'][] = ['draft', 'sent', 'paid', 'pending', 'failed', 'disputed'];
    
    for (let i = 0; i < limit; i++) {
      const status: Invoice['status'] = (filters?.status as Invoice['status']) || statuses[i % statuses.length];
      const daysAgo = i * 2;
      
      invoices.push({
        id: `inv-${i + 1}`,
        invoiceNumber: `INV-${String(100000 + i).slice(-6)}`,
        clientName: `Client ${i + 1}`,
        clientEmail: `client${i + 1}@example.com`,
        status,
        subtotal: 50000 + (i * 10000),
        salesTax: Math.floor((50000 + (i * 10000)) * 0.08),
        total: Math.floor((50000 + (i * 10000)) * 1.08),
        fees: Math.floor((50000 + (i * 10000)) * 0.03),
        netAmount: Math.floor((50000 + (i * 10000)) * 1.05),
        currency: 'USD',
        issueDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + (30 - daysAgo) * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: status === 'paid' ? new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString() : null,
        description: `Invoice ${i + 1} description`,
        lineItems: [
          { id: '1', description: `Item ${i + 1}`, quantity: 1, unitPrice: 50000 + (i * 10000), amount: 50000 + (i * 10000) },
        ],
        partnerSplits: i % 2 === 0 ? [
          { partnerId: 'partner-001', partnerName: 'Tech Solutions Inc', percentage: 30 },
        ] : [],
        paymentMethod: status === 'paid' ? 'credit_card' : null,
        paymentStatus: status === 'paid' ? 'paid' : status === 'failed' ? 'failed' : 'pending',
        notes: '',
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: 5,
      },
    };
  },

  /**
   * Get Payment Status
   */
  async getPaymentStatus(invoiceId: string): Promise<Payment | null> {
    await delay(300);
    
    return {
      id: `pay-${invoiceId}`,
      invoiceId,
      invoiceNumber: 'INV-001234',
      amount: 1080000,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'credit_card',
      transactionId: null,
      failureReason: null,
      paidAt: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  /**
   * Calculate Revenue Split
   */
  async calculateRevenueSplit(data: {
    subtotal: number;
    salesTax: number;
    partnerSplits: Array<{ partnerId: string; percentage: number }>;
  }): Promise<RevenueSplit> {
    await delay(200);
    
    const fees = Math.floor(data.subtotal * 0.03); // 3% processing fee
    const partnerTotal = data.partnerSplits.reduce((sum, partner) => {
      return sum + (data.subtotal * partner.percentage / 100);
    }, 0);
    const merchantShare = data.subtotal - partnerTotal;
    const netAmount = data.subtotal + data.salesTax - fees - partnerTotal;
    
    return {
      subtotal: data.subtotal,
      salesTax: data.salesTax,
      fees,
      merchantShare,
      partnerSplits: data.partnerSplits.map(partner => ({
        partnerId: partner.partnerId,
        partnerName: `Partner ${partner.partnerId}`,
        amount: data.subtotal * partner.percentage / 100,
        percentage: partner.percentage,
      })),
      netAmount,
    };
  },

  /**
   * Get Payout Schedule
   */
  async getPayoutSchedule(partnerId?: string): Promise<PayoutSchedule[]> {
    await delay(400);
    
    return [
      {
        id: 'payout-001',
        partnerId: 'partner-001',
        partnerName: 'Tech Solutions Inc',
        amount: 3000000, // $30,000
        currency: 'USD',
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: null,
        description: 'Monthly payout for October 2024',
        relatedInvoices: ['inv-1', 'inv-2', 'inv-3'],
      },
      {
        id: 'payout-002',
        partnerId: 'partner-001',
        partnerName: 'Tech Solutions Inc',
        amount: 2500000, // $25,000
        currency: 'USD',
        status: 'processing',
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: null,
        description: 'Monthly payout for September 2024',
        relatedInvoices: ['inv-4', 'inv-5'],
      },
      {
        id: 'payout-003',
        partnerId: 'partner-002',
        partnerName: 'Global Services Ltd',
        amount: 1800000, // $18,000
        currency: 'USD',
        status: 'completed',
        scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Monthly payout for September 2024',
        relatedInvoices: ['inv-6', 'inv-7'],
      },
    ];
  },

  /**
   * Get Failed/Disputed Payments
   */
  async getFailedPayments(page: number = 1, limit: number = 20): Promise<{
    data: Payment[];
    pagination: any;
  }> {
    await delay(400);
    
    const payments: Payment[] = [];
    
    for (let i = 0; i < limit; i++) {
      const isFailed = i % 2 === 0;
      const daysAgo = i * 3;
      
      payments.push({
        id: `pay-failed-${i + 1}`,
        invoiceId: `inv-${i + 1}`,
        invoiceNumber: `INV-${String(100000 + i).slice(-6)}`,
        amount: 50000 + (i * 10000),
        currency: 'USD',
        status: isFailed ? 'failed' : 'disputed',
        paymentMethod: 'credit_card',
        transactionId: `txn-${i + 1}`,
        failureReason: isFailed ? 'Insufficient funds' : 'Chargeback dispute',
        paidAt: null,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    return {
      data: payments,
      pagination: {
        page,
        limit,
        total: 50,
        totalPages: 3,
      },
    };
  },
};

