/**
 * Mock Reports Service
 * 
 * Provides mock data for reports and exports screens.
 */

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface ReportFilter {
  dateRange?: { start: Date; end: Date };
  status?: string;
  type?: string;
  partnerId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface FinancialReport {
  period: { start: string; end: string };
  totalRevenue: number;
  totalFees: number;
  totalPayouts: number;
  netRevenue: number;
  transactionCount: number;
  averageTransaction: number;
  bySource: Array<{
    source: string;
    revenue: number;
    percentage: number;
  }>;
  byPartner: Array<{
    partnerId: string;
    partnerName: string;
    revenue: number;
    percentage: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

export interface TransactionReport {
  period: { start: string; end: string };
  transactions: Array<{
    id: string;
    date: string;
    clientName: string;
    type: string;
    status: string;
    amount: number;
    fees: number;
    netAmount: number;
    partnerShare: number;
    merchantShare: number;
  }>;
  summary: {
    totalTransactions: number;
    totalAmount: number;
    totalFees: number;
    totalNet: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const mockReportsService = {
  /**
   * Get Financial Report
   */
  async getFinancialReport(filters?: ReportFilter): Promise<FinancialReport> {
    await delay(800);
    
    const start = filters?.dateRange?.start || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = filters?.dateRange?.end || new Date();
    
    const totalRevenue = 15000000; // $150,000
    const totalFees = 450000; // $4,500 (3%)
    const totalPayouts = 4500000; // $45,000 (30% to partners)
    const netRevenue = totalRevenue - totalFees - totalPayouts;
    const transactionCount = 234;
    
    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      totalRevenue,
      totalFees,
      totalPayouts,
      netRevenue,
      transactionCount,
      averageTransaction: Math.floor(totalRevenue / transactionCount),
      bySource: [
        { source: 'Stripe', revenue: 10500000, percentage: 70 },
        { source: 'QuickBooks', revenue: 3000000, percentage: 20 },
        { source: 'Internal', revenue: 1500000, percentage: 10 },
      ],
      byPartner: [
        { partnerId: 'partner-001', partnerName: 'Tech Solutions Inc', revenue: 2700000, percentage: 18 },
        { partnerId: 'partner-002', partnerName: 'Global Services Ltd', revenue: 1800000, percentage: 12 },
      ],
      dailyBreakdown: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(end);
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString(),
          revenue: 400000 + Math.floor(Math.random() * 200000),
          transactions: 5 + Math.floor(Math.random() * 10),
        };
      }),
    };
  },

  /**
   * Get Transaction Report
   */
  async getTransactionReport(
    filters?: ReportFilter,
    page: number = 1,
    limit: number = 50
  ): Promise<TransactionReport> {
    await delay(600);
    
    const start = filters?.dateRange?.start || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = filters?.dateRange?.end || new Date();
    
    const transactions = [];
    const totalTransactions = 234;
    
    for (let i = 0; i < limit; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(end);
      date.setDate(date.getDate() - daysAgo);
      
      const amount = 50000 + Math.floor(Math.random() * 100000);
      const fees = Math.floor(amount * 0.03);
      const partnerShare = Math.floor(amount * 0.3);
      const merchantShare = amount - fees - partnerShare;
      
      transactions.push({
        id: `txn-${i + 1}`,
        date: date.toISOString(),
        clientName: `Client ${i + 1}`,
        type: i % 3 === 0 ? 'PAYMENT' : i % 3 === 1 ? 'REFUND' : 'CHARGEBACK',
        status: i % 4 === 0 ? 'COMPLETED' : i % 4 === 1 ? 'PENDING' : i % 4 === 2 ? 'FAILED' : 'DISPUTED',
        amount,
        fees,
        netAmount: amount - fees,
        partnerShare,
        merchantShare,
      });
    }
    
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.fees, 0);
    const totalNet = transactions.reduce((sum, t) => sum + t.netAmount, 0);
    
    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      transactions,
      summary: {
        totalTransactions,
        totalAmount,
        totalFees,
        totalNet,
        byStatus: {
          COMPLETED: transactions.filter(t => t.status === 'COMPLETED').length,
          PENDING: transactions.filter(t => t.status === 'PENDING').length,
          FAILED: transactions.filter(t => t.status === 'FAILED').length,
          DISPUTED: transactions.filter(t => t.status === 'DISPUTED').length,
        },
        byType: {
          PAYMENT: transactions.filter(t => t.type === 'PAYMENT').length,
          REFUND: transactions.filter(t => t.type === 'REFUND').length,
          CHARGEBACK: transactions.filter(t => t.type === 'CHARGEBACK').length,
        },
      },
      pagination: {
        page,
        limit,
        total: totalTransactions,
        totalPages: Math.ceil(totalTransactions / limit),
      },
    };
  },

  /**
   * Export Report to CSV
   */
  async exportToCSV(reportType: 'financial' | 'transaction', filters?: ReportFilter): Promise<void> {
    await delay(1500);
    // In real app, this would generate and download CSV
    console.log('Exporting to CSV:', reportType, filters);
  },

  /**
   * Export Report to PDF
   */
  async exportToPDF(reportType: 'financial' | 'transaction', filters?: ReportFilter): Promise<void> {
    await delay(2000);
    // In real app, this would generate and download PDF
    console.log('Exporting to PDF:', reportType, filters);
  },
};

