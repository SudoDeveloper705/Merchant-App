// Revenue Split & Payout Types

export type SplitType = 'PERCENTAGE' | 'FIXED' | 'TIERED';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PayoutMethod = 'STRIPE' | 'WISE' | 'BANK_TRANSFER' | 'PAYPAL';
export type AdjustmentType = 'MANUAL_OVERRIDE' | 'CORRECTION' | 'REFUND' | 'BONUS' | 'PENALTY';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'CANCEL';

export interface SplitRule {
  id: string;
  partnerId: string;
  partnerName: string;
  splitType: SplitType;
  percentage?: number; // 0-100 for percentage splits
  fixedAmountCents?: number; // For fixed amount splits
  tierRules?: TierRule[]; // For tiered splits
  priority: number; // Order of application
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TierRule {
  id: string;
  minAmountCents: number;
  maxAmountCents?: number;
  percentage: number;
}

export interface PartnerShare {
  partnerId: string;
  partnerName: string;
  revenueCents: number;
  sharePercentage: number;
  shareAmountCents: number;
  splitRuleId: string;
  splitRuleName: string;
  transactionCount: number;
  periodStart: string;
  periodEnd: string;
}

export interface HistoricalPayout {
  id: string;
  payoutNumber: string;
  partnerId: string;
  partnerName: string;
  amountCents: number;
  currency: string;
  method: PayoutMethod;
  status: PayoutStatus;
  scheduledDate: string;
  processedDate?: string;
  completedDate?: string;
  description: string;
  transactionIds: string[];
  periodStart: string;
  periodEnd: string;
  feesCents: number;
  netAmountCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface PendingPayout {
  id: string;
  payoutNumber: string;
  partnerId: string;
  partnerName: string;
  amountCents: number;
  currency: string;
  method: PayoutMethod;
  status: PayoutStatus;
  scheduledDate: string;
  description: string;
  transactionIds: string[];
  periodStart: string;
  periodEnd: string;
  feesCents: number;
  netAmountCents: number;
  canApprove: boolean;
  canCancel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutAdjustment {
  id: string;
  adjustmentNumber: string;
  payoutId?: string;
  partnerId: string;
  partnerName: string;
  type: AdjustmentType;
  amountCents: number; // Positive for additions, negative for deductions
  currency: string;
  reason: string;
  description: string;
  appliedDate?: string;
  status: 'PENDING' | 'APPLIED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  entityType: 'SPLIT_RULE' | 'PAYOUT' | 'ADJUSTMENT' | 'PARTNER_SHARE';
  entityId: string;
  action: AuditAction;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  changes: AuditChange[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  description: string;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

