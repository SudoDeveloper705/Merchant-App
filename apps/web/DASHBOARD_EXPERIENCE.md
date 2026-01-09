# Core Dashboard Experience UI

## Overview

Complete dashboard experience with KPIs, revenue breakdown, activity feed, and notifications center. Built with reusable components and mock services.

## Screens

### 1. Main Overview Dashboard (`/dashboard`)
- **KPIs**: Total Revenue, Active Transactions, Pending Payouts, Partner Share
- **Balances**: Available, Pending, Reserved balances
- **Alerts**: Recent alerts with severity badges
- **Recent Activity**: Latest transactions and system events
- **Revenue Trend Chart**: 6-month revenue visualization
- **Date Range Selector**: Filter data by time period

**Route**: `/dashboard`

### 2. Revenue Breakdown (`/dashboard/revenue`)
- **Total Revenue**: Summary card
- **Revenue Sources**: Stripe, QuickBooks, Internal breakdown
- **Source Cards**: Individual cards with percentages and progress bars
- **Revenue Trend Chart**: Monthly breakdown visualization
- **Detailed Table**: Complete revenue source breakdown

**Route**: `/dashboard/revenue`

### 3. Activity Feed (`/dashboard/activity`)
- **Activity Table**: All recent transactions and system activity
- **Pagination**: Navigate through activity history
- **Activity Types**: Transaction, Payout, Alert, System
- **Status Badges**: Visual status indicators
- **Time Display**: Relative and absolute timestamps

**Route**: `/dashboard/activity`

### 4. Notifications & Alerts Center (`/dashboard/notifications`)
- **Notification List**: All alerts and notifications
- **Severity Badges**: Info, Warning, Error, Success
- **Unread Indicators**: Visual markers for unread items
- **Mark as Read**: Individual and bulk actions
- **Action Links**: Direct links to related items
- **Pagination**: Navigate through notification history

**Route**: `/dashboard/notifications`

## Components

### DashboardLayout
Shared layout component with:
- **Sidebar Navigation**: Collapsible sidebar with menu items
- **Top Header**: Sticky header with notifications bell
- **User Section**: User info and logout
- **Responsive**: Mobile-friendly with overlay

**Location**: `components/dashboard/DashboardLayout.tsx`

### KPICard
Reusable KPI display component:
- **Title & Value**: Main metric display
- **Subtitle**: Additional context
- **Trend Indicator**: Percentage change with direction
- **Icon Support**: Visual icon display
- **Loading State**: Skeleton loader

**Location**: `components/dashboard/KPICard.tsx`

### SkeletonLoader
Loading state components:
- **SkeletonLoader**: Generic text skeleton
- **TableSkeleton**: Table loading state
- **CardSkeleton**: Card loading state

**Location**: `components/dashboard/SkeletonLoader.tsx`

### DateRangeSelector
Date range picker component:
- **Presets**: Today, Last 7/30/90 days, This/Last month
- **Custom Range**: Placeholder for future implementation
- **Visual Display**: Formatted date range display

**Location**: `components/dashboard/DateRangeSelector.tsx`

### Chart
Mock chart visualization component:
- **Bar Chart**: Simple bar chart visualization
- **Data Support**: Array of data points
- **Loading State**: Skeleton loader
- **Customizable**: Height, colors, labels

**Location**: `components/dashboard/Chart.tsx`

## Services

### Mock Dashboard Service
Provides mock data for all dashboard screens:

```typescript
import { mockDashboardService } from '@/services/mockDashboard';

// Get overview data
const data = await mockDashboardService.getOverview(dateRange);

// Get revenue breakdown
const revenue = await mockDashboardService.getRevenueBreakdown(dateRange);

// Get activity feed
const activities = await mockDashboardService.getActivityFeed(page, limit);

// Get notifications
const notifications = await mockDashboardService.getNotifications(page, limit);
```

**Location**: `services/mockDashboard.ts`

## Features

✅ **Shared DashboardLayout** with sidebar and top header
✅ **KPI Cards** with trends and icons
✅ **Skeleton Loaders** for all loading states
✅ **Date Range Selector** with presets
✅ **Mock Charts** for data visualization
✅ **Alerts with Severity Badges** (info, warning, error, success)
✅ **Activity Feed** with pagination
✅ **Notifications Center** with read/unread states
✅ **Responsive Design** mobile-friendly
✅ **No Backend Calls** all mock data

## Data Structure

### KPI Data
```typescript
{
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
}
```

### Alert
```typescript
{
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
```

### Activity Item
```typescript
{
  id: string;
  type: 'transaction' | 'payout' | 'alert' | 'system';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  status?: string;
}
```

### Revenue Source
```typescript
{
  name: string;
  amount: number;
  percentage: number;
  color: string;
}
```

## Navigation

The DashboardLayout includes sidebar navigation:
- Overview → `/dashboard`
- Revenue Breakdown → `/dashboard/revenue`
- Activity Feed → `/dashboard/activity`
- Notifications → `/dashboard/notifications`

## Integration with Real Backend

When ready to connect to real APIs:

1. Replace `mockDashboardService` calls with real API calls
2. Update data structures to match backend responses
3. Add real chart library (e.g., Recharts, Chart.js)
4. Implement real date range filtering
5. Add real-time updates (WebSockets/polling)

The UI structure remains the same - only the service layer changes.

## Styling

All screens use:
- Tailwind CSS
- Consistent color scheme
- Professional spacing
- Responsive grid layouts
- Smooth transitions and animations

## Example Usage

```tsx
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { mockDashboardService } from '@/services/mockDashboard';

const data = await mockDashboardService.getOverview();
// Use data.kpis, data.balances, data.alerts, etc.
```

