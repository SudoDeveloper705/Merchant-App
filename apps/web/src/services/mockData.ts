/**
 * Mock Data Service
 * 
 * Centralized mock data generator for UI development.
 * This service provides realistic mock data that can be easily
 * replaced with real API calls later.
 */

// Types
export interface MockMerchant {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface MockTransaction {
  id: string;
  merchantId: string;
  clientId: string | null;
  clientName: string | null;
  externalId: string | null;
  type: 'PAYMENT' | 'REFUND' | 'CHARGEBACK';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  amountCents: number;
  feesCents: number;
  netCents: number;
  currency: string;
  description: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface MockPayout {
  id: string;
  merchantId: string;
  partnerId: string;
  amountCents: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING' | 'FAILED';
  payoutMethod: string;
  payoutReference: string | null;
  description: string | null;
  scheduledDate: string;
  processedAt: string | null;
  createdAt: string;
}

export interface MockPartner {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface MockAgreement {
  id: string;
  merchantId: string;
  partnerId: string;
  type: 'PERCENTAGE' | 'MINIMUM_GUARANTEE';
  percentage?: number;
  minimumAmountCents?: number;
  status: 'ACTIVE' | 'INACTIVE';
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

// Helper functions
function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

function randomDate(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mock Data Generators
export const mockDataService = {
  // Merchants
  generateMerchants(count: number = 10): MockMerchant[] {
    const merchants: MockMerchant[] = [];
    const names = ['Acme Corp', 'Tech Solutions', 'Global Trading', 'Digital Services', 'Innovation Labs'];
    
    for (let i = 0; i < count; i++) {
      merchants.push({
        id: randomId('merchant'),
        name: `${names[i % names.length]} ${i > names.length ? Math.floor(i / names.length) + 1 : ''}`.trim(),
        email: `merchant${i + 1}@example.com`,
        createdAt: randomDate(365 - i * 10),
      });
    }
    return merchants;
  },

  // Transactions
  generateTransactions(count: number = 50, merchantId?: string): MockTransaction[] {
    const transactions: MockTransaction[] = [];
    const types: Array<'PAYMENT' | 'REFUND' | 'CHARGEBACK'> = ['PAYMENT', 'REFUND', 'CHARGEBACK'];
    const statuses: Array<'COMPLETED' | 'PENDING' | 'FAILED'> = ['COMPLETED', 'PENDING', 'FAILED'];
    const clients = ['Client A', 'Client B', 'Client C', 'Client D', 'Client E'];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const status = statuses[i % statuses.length];
      const amount = randomAmount(10000, 100000); // $100 - $1,000
      const fees = Math.floor(amount * 0.03); // 3% fee
      
      transactions.push({
        id: randomId('txn'),
        merchantId: merchantId || randomId('merchant'),
        clientId: `client-${i + 1}`,
        clientName: clients[i % clients.length],
        externalId: `EXT-${1000 + i}`,
        type,
        status,
        amountCents: amount,
        feesCents: fees,
        netCents: amount - fees,
        currency: 'USD',
        description: `Transaction ${i + 1} - ${type}`,
        transactionDate: randomDate(i),
        createdAt: randomDate(i),
      });
    }
    return transactions;
  },

  // Payouts
  generatePayouts(count: number = 20, merchantId?: string, partnerId?: string): MockPayout[] {
    const payouts: MockPayout[] = [];
    const statuses: Array<'COMPLETED' | 'PENDING' | 'PROCESSING' | 'FAILED'> = 
      ['COMPLETED', 'PENDING', 'PROCESSING', 'FAILED'];
    const methods = ['BANK_TRANSFER', 'WIRE', 'CHECK'];
    
    for (let i = 0; i < count; i++) {
      const status = statuses[i % statuses.length];
      const amount = randomAmount(50000, 500000); // $500 - $5,000
      
      payouts.push({
        id: randomId('payout'),
        merchantId: merchantId || randomId('merchant'),
        partnerId: partnerId || randomId('partner'),
        amountCents: amount,
        currency: 'USD',
        status,
        payoutMethod: methods[i % methods.length],
        payoutReference: `REF-${2000 + i}`,
        description: `Payout ${i + 1}`,
        scheduledDate: randomDate(i * 7), // Weekly
        processedAt: status === 'COMPLETED' ? randomDate(i * 7) : null,
        createdAt: randomDate(i * 7 + 1),
      });
    }
    return payouts;
  },

  // Partners
  generatePartners(count: number = 10): MockPartner[] {
    const partners: MockPartner[] = [];
    const names = ['Partner A', 'Partner B', 'Partner C', 'Partner D', 'Partner E'];
    const roles = ['partner_owner', 'partner_staff'];
    
    for (let i = 0; i < count; i++) {
      partners.push({
        id: randomId('partner'),
        name: `${names[i % names.length]} ${i > names.length ? Math.floor(i / names.length) + 1 : ''}`.trim(),
        email: `partner${i + 1}@example.com`,
        role: roles[i % roles.length],
        createdAt: randomDate(180 - i * 5),
      });
    }
    return partners;
  },

  // Agreements
  generateAgreements(count: number = 10, merchantId?: string, partnerId?: string): MockAgreement[] {
    const agreements: MockAgreement[] = [];
    const types: Array<'PERCENTAGE' | 'MINIMUM_GUARANTEE'> = ['PERCENTAGE', 'MINIMUM_GUARANTEE'];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const isActive = i % 3 !== 0;
      
      agreements.push({
        id: randomId('agreement'),
        merchantId: merchantId || randomId('merchant'),
        partnerId: partnerId || randomId('partner'),
        type,
        percentage: type === 'PERCENTAGE' ? randomAmount(10, 50) : undefined,
        minimumAmountCents: type === 'MINIMUM_GUARANTEE' ? randomAmount(100000, 500000) : undefined,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        startDate: randomDate(90 - i * 5),
        endDate: isActive ? null : randomDate(30 - i * 2),
        createdAt: randomDate(90 - i * 5),
      });
    }
    return agreements;
  },
};

