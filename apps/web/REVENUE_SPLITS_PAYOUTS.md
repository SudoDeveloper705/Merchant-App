# Revenue Splits & Payout Logic UI

## Overview

Complete revenue split configuration and payout management interface with financial-grade layout. Includes split rules, partner share breakdowns, payout scheduling, adjustments, and comprehensive audit trail.

## Screens

### 1. Split Configuration (`/splits/configuration`)
- **Split Rule Management**: Create and edit split rules
- **Percentage-Based Splits**: Configure percentage allocations
- **Minimum Guarantee**: Set minimum guarantee amounts
- **Validation**: Total percentage validation (cannot exceed 100%)
- **Active/Inactive Status**: Manage rule status
- **Effective Dates**: Set start and end dates for rules

**Route**: `/splits/configuration`

### 2. Partner Share Breakdown (`/splits/breakdown`)
- **Revenue Analysis**: Period-based revenue breakdown
- **Share Calculation**: Revenue share vs minimum guarantee
- **Visual Distribution**: Progress bars showing share percentages
- **Summary Cards**: Total revenue, shares, active partners
- **Date Range Filter**: Filter by time period
- **Read-Only Display**: Historical analysis view

**Route**: `/splits/breakdown`

### 3. Historical Payouts (`/splits/payouts/historical`)
- **Completed Payouts**: All processed payouts
- **Pagination**: Navigate through payout history
- **Status Tracking**: Completed, failed, cancelled statuses
- **Payment Details**: Method, reference, dates
- **Related Invoices**: Links to associated invoices
- **Read-Only View**: Historical data only

**Route**: `/splits/payouts/historical`

### 4. Pending Payouts (`/splits/payouts/pending`)
- **Scheduled Payouts**: Upcoming payouts to process
- **Payout Details**: Amount, partner, scheduled date
- **Adjustments Display**: Show existing adjustments
- **Process Actions**: Process payout buttons
- **Summary Cards**: Pending count, total amount, next payout

**Route**: `/splits/payouts/pending`

### 5. Adjustments / Overrides (`/splits/adjustments`)
- **Adjustment Types**: Increase, Decrease, Override
- **Warning Banners**: Financial impact warnings
- **Adjustment Form**: Amount and reason required
- **Existing Adjustments**: Display current adjustments
- **Override Warnings**: Special warnings for overrides
- **Audit Trail Integration**: All adjustments logged

**Route**: `/splits/adjustments`

### 6. Audit Trail (`/splits/audit`)
- **Complete History**: All changes to splits and payouts
- **Timeline View**: Chronological event display
- **Change Tracking**: Field-level change tracking
- **User Information**: Who made changes, when, from where
- **Filters**: Filter by entity type and action
- **Read-Only View**: Complete audit history

**Route**: `/splits/audit`

## Components

### SplitConfigurationForm
Split rule configuration form:
- **Split Type Selection**: Percentage or Minimum Guarantee
- **Percentage Input**: With total percentage validation
- **Minimum Amount Input**: For guarantee-based splits
- **Validation Warnings**: Total percentage cannot exceed 100%
- **Save/Cancel**: Form actions

**Location**: `components/splits/SplitConfigurationForm.tsx`

### AuditTimeline
Audit event timeline visualization:
- **Timeline View**: Vertical timeline with events
- **Change Display**: Field-level old → new values
- **User Information**: Name, email, role, IP address
- **Action Badges**: Color-coded action types
- **Reason Display**: Adjustment reasons
- **Chronological Order**: Latest events first

**Location**: `components/splits/AuditTimeline.tsx`

## Services

### Mock Settlement Service
Provides mock data for all split and payout screens:

```typescript
import { mockSettlementService } from '@/services/mockSettlement';

// Get split rules
const rules = await mockSettlementService.getSplitRules();

// Save split rule
await mockSettlementService.saveSplitRule(rule);

// Get partner share breakdown
const shares = await mockSettlementService.getPartnerShareBreakdown(period);

// Get historical payouts
const response = await mockSettlementService.getHistoricalPayouts(page, limit);

// Get pending payouts
const payouts = await mockSettlementService.getPendingPayouts();

// Create adjustment
await mockSettlementService.createAdjustment(adjustment);

// Get audit trail
const events = await mockSettlementService.getAuditTrail(entityType, entityId);
```

**Location**: `services/mockSettlement.ts`

## Features

✅ **Percentage + Minimum Guarantee UI** for split configuration
✅ **Read-Only Historical Views** for completed payouts
✅ **Adjustment Warning Banners** for financial impact
✅ **Audit Timeline** showing who changed what
✅ **Financial-Grade Layout** professional, no playful UI
✅ **Split Validation** percentage totals cannot exceed 100%
✅ **Adjustment Types** increase, decrease, override
✅ **Complete Audit Trail** with user, IP, timestamps
✅ **Field-Level Change Tracking** old → new values
✅ **No Backend Calls** all mock data

## Data Structure

### Split Rule
```typescript
{
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
```

### Partner Share
```typescript
{
  partnerId: string;
  partnerName: string;
  splitRule: SplitRule;
  revenueShare: number;
  minimumGuarantee: number;
  actualShare: number;
  period: { start: string; end: string };
}
```

### Payout
```typescript
{
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
}
```

### Adjustment
```typescript
{
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
```

### Audit Event
```typescript
{
  id: string;
  timestamp: string;
  user: { id: string; name: string; email: string; role: string };
  action: 'created' | 'updated' | 'deleted' | 'adjusted' | 'approved' | 'rejected';
  entity: string;
  entityId: string;
  changes: Array<{ field: string; oldValue: any; newValue: any }>;
  reason?: string;
  ipAddress?: string;
}
```

## Split Types

### Percentage-Based Split
- Partner receives a fixed percentage of revenue
- Calculated as: `revenue * percentage / 100`
- Total of all percentage splits cannot exceed 100%

### Minimum Guarantee
- Partner receives at least a minimum amount
- If percentage calculation is less than minimum, minimum is paid
- Can be combined with percentage splits

## Adjustment Types

### Increase
- Adds to the payout amount
- New amount = original + adjustment

### Decrease
- Reduces the payout amount
- New amount = original - adjustment

### Override
- Replaces the calculated amount entirely
- Requires special warning and approval
- New amount = override amount

## Financial-Grade Design

All screens use:
- **Professional Color Scheme**: Grays, blues, minimal color
- **Clear Typography**: Readable, hierarchical
- **Structured Layouts**: Grid-based, organized
- **No Playful Elements**: Serious, business-focused
- **Clear Warnings**: Prominent warning banners
- **Data Tables**: Structured, scannable
- **Read-Only Indicators**: Clear when data is read-only

## Integration with Real Backend

When ready to connect to real APIs:

1. Replace `mockSettlementService` calls with real API calls
2. Update data structures to match backend responses
3. Add real-time validation for split rules
4. Implement real payout processing
5. Add real-time audit logging
6. Implement approval workflows for adjustments

The UI structure remains the same - only the service layer changes.

## Example Usage

```tsx
import { SplitConfigurationForm } from '@/components/splits/SplitConfigurationForm';
import { AuditTimeline } from '@/components/splits/AuditTimeline';
import { mockSettlementService } from '@/services/mockSettlement';

const rules = await mockSettlementService.getSplitRules();
// Use rules in configuration
```

