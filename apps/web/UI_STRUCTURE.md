# Merchant App - UI Structure Guide

## Overview

This document describes the enterprise-grade UI structure for the Merchant App. The architecture is designed to be scalable, maintainable, and easily wireable to backend APIs.

## Architecture Principles

1. **UI-Only Development**: No backend logic in frontend code
2. **Mock Services Layer**: Centralized mock data services separate from API calls
3. **Reusable Components**: Consistent UI components across all screens
4. **Loading & Empty States**: Every screen has proper loading and empty states
5. **Clean Routes**: Each screen accessible via clean, semantic routes
6. **Type Safety**: Full TypeScript support throughout

## Folder Structure

```
apps/web/src/
├── app/                    # Next.js App Router pages
│   ├── merchant/          # Merchant pages
│   └── partner/           # Partner pages
├── components/
│   ├── ui/                # Base UI component library
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   ├── Pagination.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   ├── layouts/           # Layout components
│   └── dashboard/         # Dashboard-specific components
├── services/
│   ├── mockData.ts        # Mock data generators
│   └── mockServices.ts    # Mock service layer (simulates API calls)
├── lib/
│   ├── api.ts             # Real API client (for future use)
│   └── format.ts          # Formatting utilities
└── contexts/              # React contexts
```

## Component Library

### Base UI Components (`components/ui/`)

All base components are located in `components/ui/` and exported via `index.ts`:

#### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`  
**Sizes**: `sm`, `md`, `lg`

#### Input
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  error={errors.email}
  helperText="Enter your email address"
  required
/>
```

#### Select
```tsx
import { Select } from '@/components/ui';

<Select
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]}
  value={status}
  onChange={(e) => setStatus(e.target.value)}
/>
```

#### Card
```tsx
import { Card, CardHeader, CardContent } from '@/components/ui';

<Card>
  <CardHeader title="Dashboard" subtitle="Overview" />
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Badge
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Active</Badge>
```

**Variants**: `default`, `success`, `warning`, `error`, `info`

#### Table
```tsx
import { Table, TableColumn } from '@/components/ui';

const columns: TableColumn<Transaction>[] = [
  { header: 'Date', accessor: (row) => formatDate(row.date) },
  { header: 'Amount', accessor: 'amountCents' },
];

<Table
  data={transactions}
  columns={columns}
  loading={loading}
  emptyMessage="No transactions found"
  onRowClick={(row) => handleRowClick(row)}
/>
```

#### Pagination
```tsx
import { Pagination } from '@/components/ui';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

#### LoadingSpinner
```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="md" text="Loading data..." />
```

#### EmptyState
```tsx
import { EmptyState } from '@/components/ui';

<EmptyState
  icon={<Icon />}
  title="No data found"
  description="Try adjusting your filters"
  action={<Button>Create New</Button>}
/>
```

## Mock Services Layer

### Usage

The mock services layer (`services/mockServices.ts`) provides a clean interface for fetching data:

```tsx
import { mockServices } from '@/services/mockServices';

// Get transactions with pagination and filters
const response = await mockServices.getTransactions(
  merchantId,
  page,
  limit,
  {
    status: 'COMPLETED',
    type: 'PAYMENT',
    search: 'query',
  }
);

// Response structure
{
  data: Transaction[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  }
}
```

### Available Services

- `getMerchants(page, limit)` - Get paginated merchants
- `getTransactions(merchantId, page, limit, filters)` - Get transactions
- `getPayouts(merchantId, partnerId?, page, limit, filters)` - Get payouts
- `getPartners(page, limit)` - Get partners
- `getAgreements(merchantId?, partnerId?, page, limit)` - Get agreements
- `getDashboardMetrics(merchantId, period)` - Get dashboard metrics

### Replacing with Real API

When ready to connect to real APIs, simply replace the mock service calls:

```tsx
// Before (mock)
const response = await mockServices.getTransactions(...);

// After (real API)
const response = await api.transactions.list(...);
```

The response structure should remain the same, so no component changes are needed.

## Formatting Utilities

Use centralized formatting functions from `lib/format.ts`:

```tsx
import { formatCurrency, formatDate, formatPercentage } from '@/lib/format';

formatCurrency(125000); // "$1,250.00"
formatDate('2024-01-15'); // "Jan 15, 2024"
formatPercentage(25.5); // "25.5%"
```

## Page Structure Pattern

Every page should follow this structure:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layouts/...';
import { Table, Button, Card, ... } from '@/components/ui';
import { mockServices } from '@/services/mockServices';
import { formatCurrency, formatDate } from '@/lib/format';

export default function MyPage() {
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  // Load data
  useEffect(() => {
    loadData();
  }, [page]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await mockServices.getData(page);
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1>Page Title</h1>
          <p>Description</p>
        </div>
        
        {/* Filters */}
        <Card>
          {/* Filter form */}
        </Card>
        
        {/* Content */}
        <Table
          data={data}
          columns={columns}
          loading={loading}
          emptyMessage="No data found"
        />
        
        {/* Pagination */}
        <Pagination ... />
      </div>
    </Layout>
  );
}
```

## Best Practices

### 1. Always Use Mock Services
❌ **Don't** hardcode data in pages:
```tsx
const data = [{ id: '1', name: 'Test' }]; // BAD
```

✅ **Do** use mock services:
```tsx
const response = await mockServices.getData(); // GOOD
```

### 2. Always Include Loading States
```tsx
<Table loading={loading} ... />
```

### 3. Always Include Empty States
```tsx
<Table emptyMessage="No transactions found" ... />
```

### 4. Use Formatting Utilities
```tsx
// BAD
const formatted = `$${(amount / 100).toFixed(2)}`;

// GOOD
const formatted = formatCurrency(amount);
```

### 5. Type Everything
```tsx
const columns: TableColumn<Transaction>[] = [...];
```

## Design System

### Colors
- Primary: Blue (`primary-600`, `primary-700`, etc.)
- Success: Green
- Warning: Yellow
- Error: Red
- Neutral: Gray

### Spacing
- Use Tailwind spacing scale: `space-y-6`, `p-4`, `gap-4`, etc.

### Typography
- Headings: `text-3xl font-bold` (h1), `text-2xl font-semibold` (h2)
- Body: `text-base` or `text-sm`
- Labels: `text-sm font-medium`

## Migration Path to Real APIs

When ready to connect to real APIs:

1. **Update Service Layer**: Replace `mockServices` calls with real API calls
2. **Keep Response Structure**: Ensure API responses match the expected structure
3. **Add Error Handling**: Implement proper error handling and user feedback
4. **Add Optimistic Updates**: For better UX on mutations
5. **Add Caching**: Consider React Query or SWR for data caching

## Example: Complete Page

See `apps/web/src/app/merchant/transactions/page.tsx` for a complete example implementing all patterns.

