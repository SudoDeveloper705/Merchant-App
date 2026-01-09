/**
 * Mock Settlement Service
 * 
 * Provides mock data for revenue splits and payout logic screens.
 */

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SplitRule {
  id: string;
  partnerId: string;
  partnerName: string;
  type: 'percentage' | 'minimum_guarantee';
  percentage?: number;
  minimumAmount?: number;
  effectiveDate: string;
  endDate: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  createdBy: string;
}

export interface PartnerShare {
  partnerId: string;
  partnerName: string;
  splitRule: SplitRule;
  revenueShare: number;
  minimumGuarantee: number;
  actualShare: number;
  period: {
    start: string;
    end: string;
  };
}

export interface Payout {
  id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduledDate: string;
  processedDate: string | null;
  paymentMethod: string;
  reference: string;
  relatedInvoices: string[];
  adjustments: Adjustment[];
  createdAt: string;
}

export interface Adjustment {
  id: string;
  payoutId: string;
  type: 'increase' | 'decrease' | 'override';
  amount: number;
  reason: string;
  approvedBy: string;
  approvedAt: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: 'created' | 'updated' | 'deleted' | 'adjusted' | 'approved' | 'rejected';
  entity: string;
  entityId: string;
  changes: Array<{
    field: string;
    oldValue: string | number | null;
    newValue: string | number | null;
  }>;
  reason?: string;
  ipAddress?: string;
}

export const mockSettlementService = {
  /**
   * Get Split Rules
   */
  async getSplitRules(partnerId?: string): Promise<SplitRule[]> {
    await delay(400);
    
    return [
      {
        id: 'rule-001',
        partnerId: 'partner-001',
        partnerName: 'Tech Solutions Inc',
        type: 'percentage',
        percentage: 30,
        effectiveDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: null,
        status: 'active',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user-001',
      },
      {
        id: 'rule-002',
        partnerId: 'partner-002',
        partnerName: 'Global Services Ltd',
        type: 'minimum_guarantee',
        minimumAmount: 5000000, // $50,000
        effectiveDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: null,
        status: 'active',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user-001',
      },
      {
        id: 'rule-003',
        partnerId: 'partner-003',
        partnerName: 'Digital Marketing Pro',
        type: 'percentage',
        percentage: 25,
        effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user-002',
      },
    ];
  },

  /**
   * Create/Update Split Rule
   */
  async saveSplitRule(rule: Partial<SplitRule>): Promise<SplitRule> {
    await delay(600);
    
    return {
      id: rule.id || `rule-${Date.now()}`,
      partnerId: rule.partnerId || '',
      partnerName: rule.partnerName || '',
      type: rule.type || 'percentage',
      percentage: rule.percentage,
      minimumAmount: rule.minimumAmount,
      effectiveDate: rule.effectiveDate || new Date().toISOString(),
      endDate: rule.endDate || null,
      status: rule.status || 'active',
      createdAt: rule.createdAt || new Date().toISOString(),
      createdBy: rule.createdBy || 'current-user',
    };
  },

  /**
   * Get Partner Share Breakdown
   */
  async getPartnerShareBreakdown(period?: { start: string; end: string }): Promise<PartnerShare[]> {
    await delay(500);
    
    const now = new Date();
    const start = period?.start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = period?.end || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    return [
      {
        partnerId: 'partner-001',
        partnerName: 'Tech Solutions Inc',
        splitRule: {
          id: 'rule-001',
          partnerId: 'partner-001',
          partnerName: 'Tech Solutions Inc',
          type: 'percentage',
          percentage: 30,
          effectiveDate: start,
          endDate: null,
          status: 'active',
          createdAt: start,
          createdBy: 'user-001',
        },
        revenueShare: 4500000, // $45,000 (30% of $150,000)
        minimumGuarantee: 0,
        actualShare: 4500000,
        period: { start, end },
      },
      {
        partnerId: 'partner-002',
        partnerName: 'Global Services Ltd',
        splitRule: {
          id: 'rule-002',
          partnerId: 'partner-002',
          partnerName: 'Global Services Ltd',
          type: 'minimum_guarantee',
          minimumAmount: 5000000,
          effectiveDate: start,
          endDate: null,
          status: 'active',
          createdAt: start,
          createdBy: 'user-001',
        },
        revenueShare: 3000000, // $30,000 (20% of $150,000)
        minimumGuarantee: 5000000, // $50,000 minimum
        actualShare: 5000000, // Gets minimum guarantee
        period: { start, end },
      },
    ];
  },

  /**
   * Get Historical Payouts
   */
  async getHistoricalPayouts(page: number = 1, limit: number = 20): Promise<{
    data: Payout[];
    pagination: any;
  }> {
    await delay(500);
    
    const payouts: Payout[] = [];
    
    for (let i = 0; i < limit; i++) {
      const monthsAgo = i;
      const status: Payout['status'] = i % 4 === 0 ? 'completed' : 'completed';
      
      payouts.push({
        id: `payout-hist-${i + 1}`,
        partnerId: i % 2 === 0 ? 'partner-001' : 'partner-002',
        partnerName: i % 2 === 0 ? 'Tech Solutions Inc' : 'Global Services Ltd',
        amount: 3000000 + (i * 500000),
        currency: 'USD',
        status,
        scheduledDate: new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000 + 2 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'BANK_TRANSFER',
        reference: `REF-${2000 + i}`,
        relatedInvoices: [`inv-${i + 1}`, `inv-${i + 2}`],
        adjustments: [],
        createdAt: new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    return {
      data: payouts,
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: 5,
      },
    };
  },

  /**
   * Get Pending Payouts
   */
  async getPendingPayouts(): Promise<Payout[]> {
    await delay(400);
    
    return [
      {
        id: 'payout-pending-001',
        partnerId: 'partner-001',
        partnerName: 'Tech Solutions Inc',
        amount: 4500000, // $45,000
        currency: 'USD',
        status: 'pending',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: null,
        paymentMethod: 'BANK_TRANSFER',
        reference: 'REF-PENDING-001',
        relatedInvoices: ['inv-101', 'inv-102', 'inv-103'],
        adjustments: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'payout-pending-002',
        partnerId: 'partner-002',
        partnerName: 'Global Services Ltd',
        amount: 5000000, // $50,000 (minimum guarantee)
        currency: 'USD',
        status: 'pending',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: null,
        paymentMethod: 'BANK_TRANSFER',
        reference: 'REF-PENDING-002',
        relatedInvoices: ['inv-104', 'inv-105'],
        adjustments: [
          {
            id: 'adj-001',
            payoutId: 'payout-pending-002',
            type: 'increase',
            amount: 500000, // $5,000 bonus
            reason: 'Performance bonus for Q4',
            approvedBy: 'admin-001',
            approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-001',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },

  /**
   * Create Adjustment
   */
  async createAdjustment(adjustment: Partial<Adjustment>): Promise<Adjustment> {
    await delay(600);
    
    return {
      id: `adj-${Date.now()}`,
      payoutId: adjustment.payoutId || '',
      type: adjustment.type || 'increase',
      amount: adjustment.amount || 0,
      reason: adjustment.reason || '',
      approvedBy: adjustment.approvedBy || 'pending',
      approvedAt: adjustment.approvedAt || new Date().toISOString(),
      createdBy: adjustment.createdBy || 'current-user',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Get Audit Trail
   */
  async getAuditTrail(entityType?: string, entityId?: string): Promise<AuditEvent[]> {
    await delay(400);
    
    return [
      {
        id: 'audit-001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'user-001',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Merchant Owner',
        },
        action: 'adjusted',
        entity: 'Payout',
        entityId: 'payout-pending-002',
        changes: [
          { field: 'amount', oldValue: 5000000, newValue: 5500000 },
        ],
        reason: 'Performance bonus for Q4',
        ipAddress: '192.168.1.100',
      },
      {
        id: 'audit-002',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'user-002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Accountant',
        },
        action: 'updated',
        entity: 'Split Rule',
        entityId: 'rule-003',
        changes: [
          { field: 'percentage', oldValue: 20, newValue: 25 },
          { field: 'endDate', oldValue: null, newValue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        reason: 'Updated contract terms',
        ipAddress: '192.168.1.101',
      },
      {
        id: 'audit-003',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'user-001',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Merchant Owner',
        },
        action: 'created',
        entity: 'Split Rule',
        entityId: 'rule-002',
        changes: [
          { field: 'type', oldValue: null, newValue: 'minimum_guarantee' },
          { field: 'minimumAmount', oldValue: null, newValue: 5000000 },
        ],
        reason: 'New partner agreement',
        ipAddress: '192.168.1.100',
      },
      {
        id: 'audit-004',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'admin-001',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'System Admin',
        },
        action: 'approved',
        entity: 'Payout',
        entityId: 'payout-hist-001',
        changes: [],
        reason: 'Payout approved for processing',
        ipAddress: '192.168.1.200',
      },
    ];
  },
};

