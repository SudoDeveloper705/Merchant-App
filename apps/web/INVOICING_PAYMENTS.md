# Invoicing & Payments UI Module

## Overview

Complete invoicing and payment management interface with step-based invoice creation, revenue split previews, payment tracking, and payout scheduling. Built with reusable components and mock services.

## Screens

### 1. Create Invoice (`/invoices/create`)
- **Step-Based UI**: 4-step wizard (Client Info, Line Items, Partners, Review)
- **Line Items**: Dynamic line item management
- **Sales Tax**: Visual separation and calculation
- **Partner Splits**: Add partners with percentage splits
- **Revenue Split Preview**: Real-time preview of revenue distribution
- **Form Validation**: Client-side validation

**Route**: `/invoices/create`

### 2. Invoice Details View (`/invoices/[id]`)
- **Complete Invoice Display**: All invoice information
- **Line Items Table**: Detailed line item breakdown
- **Totals Section**: Subtotal, tax, fees, total (visually separated)
- **Revenue Split Preview**: Partner splits displayed
- **Payment Status**: Current payment status badge
- **Invoice Metadata**: Issue date, due date, status

**Route**: `/invoices/[id]`

### 3. Invoice List / History (`/invoices`)
- **Invoice Table**: All invoices with pagination
- **Status Filtering**: Filter by payment status
- **Search**: Search by client or invoice number
- **Payment Status Badges**: Visual status indicators
- **Quick Actions**: View invoice details

**Route**: `/invoices`

### 4. Payment Status Tracking (`/payments/status/[invoiceId]`)
- **Payment Details**: Amount, method, transaction ID
- **Status Information**: Current status with badge
- **Timeline**: Payment creation and processing dates
- **Failure Details**: Failure reason if applicable
- **Retry Actions**: Retry failed payments

**Route**: `/payments/status/[invoiceId]`

### 5. Revenue Split Preview (`/payments/split-preview`)
- **Split Breakdown**: Merchant, partners, tax, fees
- **Visual Progress Bars**: Percentage visualization
- **Summary Cards**: Merchant share, partner total, net amount
- **Before Payout**: Preview before processing payout

**Route**: `/payments/split-preview?invoiceId=xxx`

### 6. Payout Schedule (`/payments/schedule`)
- **Timeline UI**: Visual timeline of scheduled/processed payouts
- **Payout List**: All payouts with status
- **Status Badges**: Scheduled, Processing, Completed, Failed
- **Partner Information**: Partner name and details
- **Related Invoices**: Links to related invoices

**Route**: `/payments/schedule`

### 7. Failed / Disputed Payments (`/payments/failed`)
- **Failed Payments Table**: All failed and disputed payments
- **Summary Cards**: Total failed, disputed, amount
- **Failure Reasons**: Display failure reasons
- **Retry Actions**: Retry payment buttons
- **Status Filtering**: Filter by failed/disputed

**Route**: `/payments/failed`

## Components

### InvoiceFormSteps
Step indicator component for multi-step forms:
- **Visual Steps**: Numbered steps with completion indicators
- **Active Step**: Highlighted current step
- **Completed Steps**: Checkmark indicators
- **Connector Lines**: Visual flow between steps

**Location**: `components/invoices/InvoiceFormSteps.tsx`

### RevenueSplitPreview
Revenue split visualization component:
- **Split Breakdown**: Merchant, partners, tax, fees
- **Progress Bars**: Visual percentage representation
- **Summary Section**: Subtotal, tax, fees, net amount
- **Color Coding**: Different colors for different split types

**Location**: `components/invoices/RevenueSplitPreview.tsx`

### PaymentStatusBadge
Payment status indicator:
- **Status Types**: Paid, Pending, Failed, Disputed, Refunded, Partial
- **Color Coded**: Visual status indicators
- **Icons**: Status-specific icons

**Location**: `components/invoices/PaymentStatusBadge.tsx`

### PayoutTimeline
Timeline visualization for payouts:
- **Timeline View**: Vertical timeline with events
- **Status Indicators**: Visual status badges
- **Event Details**: Amount, description, dates
- **Chronological Order**: Latest first

**Location**: `components/invoices/PayoutTimeline.tsx`

## Services

### Mock Invoice Service
Provides mock data for all invoicing and payment screens:

```typescript
import { mockInvoiceService } from '@/services/mockInvoices';

// Create invoice
const invoice = await mockInvoiceService.createInvoice(data);

// Get invoice
const invoice = await mockInvoiceService.getInvoice(id);

// Get invoices list
const response = await mockInvoiceService.getInvoices(page, limit, filters);

// Get payment status
const payment = await mockInvoiceService.getPaymentStatus(invoiceId);

// Calculate revenue split
const split = await mockInvoiceService.calculateRevenueSplit(data);

// Get payout schedule
const payouts = await mockInvoiceService.getPayoutSchedule();

// Get failed payments
const response = await mockInvoiceService.getFailedPayments(page, limit);
```

**Location**: `services/mockInvoices.ts`

## Features

✅ **Step-Based Invoice Creation** with 4-step wizard
✅ **Sales Tax Separation** visually separated from subtotal
✅ **Partner Split Preview** real-time revenue distribution
✅ **Status Indicators** (Paid, Pending, Failed, Disputed)
✅ **Timeline UI** for payout schedule
✅ **Payment Tracking** detailed payment status
✅ **Failed Payment Management** retry and resolution
✅ **Revenue Split Calculation** automatic split calculation
✅ **Form Validation** client-side validation
✅ **No Backend Calls** all mock data

## Data Structure

### Invoice
```typescript
{
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
  lineItems: InvoiceLineItem[];
  partnerSplits: Array<{ partnerId: string; partnerName: string; percentage: number }>;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'disputed' | 'refunded' | 'partial';
}
```

### Payment
```typescript
{
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
}
```

### Payout Schedule
```typescript
{
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
```

## Invoice Creation Flow

1. **Step 1: Client Info** - Enter client name, email, description, due date
2. **Step 2: Line Items** - Add line items with quantity and unit price
3. **Step 3: Partners** - Select partners and set revenue split percentages
4. **Step 4: Review** - Review all information and create invoice

## Revenue Split Calculation

- **Subtotal**: Sum of all line items
- **Sales Tax**: Calculated as percentage of subtotal
- **Processing Fees**: 3% of subtotal
- **Partner Splits**: Percentage-based splits from subtotal
- **Merchant Share**: Subtotal minus partner splits
- **Net Amount**: Total minus fees minus partner splits

## Integration with Real Backend

When ready to connect to real APIs:

1. Replace `mockInvoiceService` calls with real API calls
2. Update data structures to match backend responses
3. Add real payment processing integration
4. Implement real-time payment status updates
5. Add real invoice PDF generation
6. Implement real payout processing

The UI structure remains the same - only the service layer changes.

## Styling

All screens use:
- Tailwind CSS
- Consistent form styling
- Visual separation of tax and fees
- Color-coded status indicators
- Professional timeline visualization
- Responsive grid layouts

## Example Usage

```tsx
import { InvoiceFormSteps } from '@/components/invoices/InvoiceFormSteps';
import { RevenueSplitPreview } from '@/components/invoices/RevenueSplitPreview';
import { PaymentStatusBadge } from '@/components/invoices/PaymentStatusBadge';
import { PayoutTimeline } from '@/components/invoices/PayoutTimeline';
import { mockInvoiceService } from '@/services/mockInvoices';

const invoice = await mockInvoiceService.createInvoice(data);
// Use invoice data in components
```

