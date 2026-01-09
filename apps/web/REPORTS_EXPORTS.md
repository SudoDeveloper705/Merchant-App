# Reports & Exports UI

## Overview

Comprehensive reporting interface with financial and transaction reports, advanced filtering, and export capabilities. Built with table-heavy UI, sticky summary totals, and professional export options.

## Screens

### 1. Reports Overview (`/reports`)
- **Report Type Selection**: Cards for different report types
- **Quick Navigation**: Direct links to specific reports
- **Export Info**: Information about CSV and PDF exports
- **Feature Lists**: Highlights of each report type

**Route**: `/reports`

### 2. Financial Reports (`/reports/financial`)
- **Key Metrics Cards**: Total revenue, fees, payouts, net revenue
- **Revenue by Source Table**: Breakdown by Stripe, QuickBooks, Internal
- **Revenue by Partner Table**: Partner revenue breakdown
- **Daily Breakdown Chart**: Visual revenue trend
- **Transaction Summary**: Count and average transaction
- **Advanced Filters**: Date range, status, partner filters
- **Export Buttons**: CSV and PDF export
- **Sticky Summary Totals**: Always visible totals bar

**Route**: `/reports/financial`

### 3. Transaction Reports (`/reports/transactions`)
- **Transaction Table**: Detailed transaction list with pagination
- **Summary Cards**: Total transactions, amount, fees, net
- **Status Breakdown**: Count by status (Completed, Pending, Failed, Disputed)
- **Type Breakdown**: Count by type (Payment, Refund, Chargeback)
- **Advanced Filters**: Date, status, type, partner, amount range, search
- **Export Buttons**: CSV and PDF export
- **Sticky Summary Totals**: Always visible totals bar

**Route**: `/reports/transactions`

## Components

### AdvancedFilters
Advanced filtering panel with expandable sections:
- **Filter Types**: Text, select, date, number inputs
- **Expandable UI**: Collapsible filter panel
- **Clear All**: Reset all filters
- **Dynamic Fields**: Configurable filter options

**Location**: `components/reports/AdvancedFilters.tsx`

### ExportButtons
Export action buttons:
- **CSV Export**: Export to CSV format
- **PDF Export**: Export to PDF format
- **Loading States**: Shows export progress
- **Disabled State**: Prevents multiple exports

**Location**: `components/reports/ExportButtons.tsx`

### SummaryTotals
Sticky summary totals bar:
- **Sticky Positioning**: Always visible at top
- **Multiple Totals**: Display multiple summary values
- **Color Variants**: Positive (green), negative (red), default (gray)
- **Responsive Grid**: Adapts to screen size

**Location**: `components/reports/SummaryTotals.tsx`

## Services

### Mock Reports Service
Provides mock data for all report screens:

```typescript
import { mockReportsService } from '@/services/mockReports';

// Get financial report
const report = await mockReportsService.getFinancialReport(filters);

// Get transaction report
const report = await mockReportsService.getTransactionReport(filters, page, limit);

// Export to CSV
await mockReportsService.exportToCSV('financial', filters);

// Export to PDF
await mockReportsService.exportToPDF('transaction', filters);
```

**Location**: `services/mockReports.ts`

## Features

✅ **Table-Heavy UI** with comprehensive data tables
✅ **Advanced Filter Panels** with expandable sections
✅ **Export Buttons** (CSV and PDF - mocked)
✅ **Summary Totals Always Visible** sticky totals bar
✅ **Date Range Filters** custom date selection
✅ **Multiple Filter Types** text, select, date, number
✅ **Pagination** for large datasets
✅ **Status Badges** color-coded transaction statuses
✅ **Charts** visual data representation
✅ **Responsive Design** works on all screen sizes
✅ **No Backend Calls** all mock data

## Data Structure

### Financial Report
```typescript
{
  period: { start: string; end: string };
  totalRevenue: number;
  totalFees: number;
  totalPayouts: number;
  netRevenue: number;
  transactionCount: number;
  averageTransaction: number;
  bySource: Array<{ source: string; revenue: number; percentage: number }>;
  byPartner: Array<{ partnerId: string; partnerName: string; revenue: number; percentage: number }>;
  dailyBreakdown: Array<{ date: string; revenue: number; transactions: number }>;
}
```

### Transaction Report
```typescript
{
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
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
```

### Report Filter
```typescript
{
  dateRange?: { start: Date; end: Date };
  status?: string;
  type?: string;
  partnerId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}
```

## Filter Options

### Financial Reports
- Date Range
- Status (All, Completed, Pending)
- Partner (All, specific partners)

### Transaction Reports
- Date Range
- Status (All, Completed, Pending, Failed, Disputed)
- Type (All, Payment, Refund, Chargeback)
- Partner (All, specific partners)
- Min Amount
- Max Amount
- Search (text search)

## Export Functionality

### CSV Export
- Exports all filtered data
- Includes summary totals
- Suitable for Excel/spreadsheet analysis
- Mock implementation (shows alert)

### PDF Export
- Formatted PDF report
- Includes charts and tables
- Suitable for printing/sharing
- Mock implementation (shows alert)

## Summary Totals

The sticky summary totals bar displays:
- **Financial Reports**: Total Revenue, Total Fees, Total Payouts, Net Revenue, Transactions, Avg Transaction
- **Transaction Reports**: Total Amount, Total Fees, Net Amount, Transactions

Totals are always visible at the top of the page (sticky positioning).

## Table Features

All report tables include:
- **Sortable Columns**: Click to sort
- **Status Badges**: Color-coded status indicators
- **Currency Formatting**: Proper currency display
- **Date Formatting**: Relative and absolute dates
- **Pagination**: For large datasets
- **Empty States**: When no data available

## Integration with Real Backend

When ready to connect to real APIs:

1. Replace `mockReportsService` calls with real API calls
2. Update data structures to match backend responses
3. Implement real CSV generation and download
4. Implement real PDF generation and download
5. Add real-time data updates
6. Implement report scheduling
7. Add email report delivery

The UI structure remains the same - only the service layer changes.

## Styling

All screens use:
- Tailwind CSS
- Professional, data-focused design
- Clear visual hierarchy
- Sticky elements for important data
- Responsive grid layouts
- Table-heavy layouts for data display

## Example Usage

```tsx
import { AdvancedFilters } from '@/components/reports/AdvancedFilters';
import { ExportButtons } from '@/components/reports/ExportButtons';
import { SummaryTotals } from '@/components/reports/SummaryTotals';
import { mockReportsService } from '@/services/mockReports';

const report = await mockReportsService.getFinancialReport(filters);
// Use report data in components
```

