/**
 * Mock Services
 * 
 * Service layer that provides mock data for UI development.
 * These services simulate API calls with delays and can be easily
 * replaced with real API calls later.
 */

import { mockDataService, MockTransaction, MockPayout, MockMerchant, MockPartner, MockAgreement } from './mockData';

// Re-export types for convenience
export type { MockTransaction, MockPayout, MockMerchant, MockPartner, MockAgreement };

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  status?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const mockServices = {
  // Merchant Services
  async getMerchants(page: number = 1, limit: number = 20): Promise<PaginatedResponse<MockMerchant>> {
    await delay(500);
    const allMerchants = mockDataService.generateMerchants(100);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: allMerchants.slice(start, end),
      pagination: {
        page,
        limit,
        total: allMerchants.length,
        totalPages: Math.ceil(allMerchants.length / limit),
      },
    };
  },

  // Transaction Services
  async getTransactions(
    merchantId: string,
    page: number = 1,
    limit: number = 20,
    filters?: FilterOptions
  ): Promise<PaginatedResponse<MockTransaction>> {
    await delay(600);
    let allTransactions = mockDataService.generateTransactions(200, merchantId);
    
    // Apply filters
    if (filters?.status) {
      allTransactions = allTransactions.filter(t => t.status === filters.status);
    }
    if (filters?.type) {
      allTransactions = allTransactions.filter(t => t.type === filters.type);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      allTransactions = allTransactions.filter(t =>
        t.description?.toLowerCase().includes(search) ||
        t.externalId?.toLowerCase().includes(search) ||
        t.clientName?.toLowerCase().includes(search)
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: allTransactions.slice(start, end),
      pagination: {
        page,
        limit,
        total: allTransactions.length,
        totalPages: Math.ceil(allTransactions.length / limit),
      },
    };
  },

  async getTransactionById(id: string): Promise<MockTransaction | null> {
    await delay(300);
    const transactions = mockDataService.generateTransactions(1);
    return transactions[0] || null;
  },

  // Payout Services
  async getPayouts(
    merchantId: string,
    partnerId?: string,
    page: number = 1,
    limit: number = 20,
    filters?: FilterOptions
  ): Promise<PaginatedResponse<MockPayout>> {
    await delay(600);
    let allPayouts = mockDataService.generatePayouts(100, merchantId, partnerId);
    
    // Apply filters
    if (filters?.status) {
      allPayouts = allPayouts.filter(p => p.status === filters.status);
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: allPayouts.slice(start, end),
      pagination: {
        page,
        limit,
        total: allPayouts.length,
        totalPages: Math.ceil(allPayouts.length / limit),
      },
    };
  },

  // Partner Services
  async getPartners(page: number = 1, limit: number = 20): Promise<PaginatedResponse<MockPartner>> {
    await delay(500);
    const allPartners = mockDataService.generatePartners(50);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: allPartners.slice(start, end),
      pagination: {
        page,
        limit,
        total: allPartners.length,
        totalPages: Math.ceil(allPartners.length / limit),
      },
    };
  },

  // Agreement Services
  async getAgreements(
    merchantId?: string,
    partnerId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<MockAgreement>> {
    await delay(500);
    let allAgreements = mockDataService.generateAgreements(50, merchantId, partnerId);
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: allAgreements.slice(start, end),
      pagination: {
        page,
        limit,
        total: allAgreements.length,
        totalPages: Math.ceil(allAgreements.length / limit),
      },
    };
  },

  // Dashboard Metrics
  async getDashboardMetrics(merchantId: string, period: 'month' | 'year' = 'month') {
    await delay(400);
    const transactions = mockDataService.generateTransactions(100, merchantId);
    const payouts = mockDataService.generatePayouts(20, merchantId);
    
    const totalRevenue = transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amountCents, 0);
    
    const totalFees = transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.feesCents, 0);
    
    const totalPayouts = payouts
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amountCents, 0);
    
    return {
      totalRevenueCents: totalRevenue,
      totalFeesCents: totalFees,
      totalPayoutsCents: totalPayouts,
      netRevenueCents: totalRevenue - totalFees - totalPayouts,
      transactionCount: transactions.length,
      completedCount: transactions.filter(t => t.status === 'COMPLETED').length,
      pendingCount: transactions.filter(t => t.status === 'PENDING').length,
    };
  },
};

