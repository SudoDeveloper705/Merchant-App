# Error & Edge Case UI

## Overview

Comprehensive error handling and edge case UI components with clear, calm messaging, reusable empty states, permission denied screens, and maintenance pages. Designed to handle all error scenarios gracefully without technical jargon.

## Screens

### 1. Error Page (`/error`)
- **Generic Error**: Handles unexpected errors
- **Clear Messaging**: User-friendly error messages
- **Action Buttons**: Go to dashboard or try again
- **No Technical Jargon**: Simple, understandable language

**Route**: `/error`

### 2. Permission Denied (`/error/permission-denied`)
- **RBAC Error**: Handles permission/access denied scenarios
- **Clear Explanation**: Explains why access is denied
- **Helpful Guidance**: Suggests contacting administrator
- **Navigation Options**: Go to dashboard or go back

**Route**: `/error/permission-denied`

### 3. Maintenance / Downtime (`/maintenance`)
- **Scheduled Maintenance**: Shows during planned downtime
- **Countdown Timer**: Estimated time remaining
- **What's Happening**: Explains maintenance activities
- **Calm Messaging**: Reassuring user-friendly language

**Route**: `/maintenance`

## Components

### EmptyState
Reusable empty state component:
- **Customizable Icon**: Optional icon display
- **Title & Description**: Clear messaging
- **Action Buttons**: Primary and secondary actions
- **Flexible**: Works for any empty state scenario

**Location**: `components/errors/EmptyState.tsx`

### EmptyStateLibrary
Pre-configured empty states for common scenarios:
- **EmptyTransactions**: No transactions yet
- **EmptyInvoices**: No invoices found
- **EmptyPartners**: No partners yet
- **EmptyUsers**: No users found
- **EmptyReports**: No report data available
- **EmptySearch**: No search results found

**Location**: `components/errors/EmptyStateLibrary.tsx`

### ErrorBoundary
React error boundary component:
- **Catches Errors**: Catches React component errors
- **Fallback UI**: Shows error UI instead of crashing
- **Error Logging**: Logs errors for debugging
- **Recovery Options**: Try again or refresh

**Location**: `components/errors/ErrorBoundary.tsx`

## Features

✅ **Clear, Calm Messaging** no technical jargon
✅ **Reusable EmptyState Component** flexible and customizable
✅ **Permission Denied UI** for RBAC scenarios
✅ **Maintenance Page** with countdown timer
✅ **Error Boundary** catches React errors
✅ **Pre-configured Empty States** for common scenarios
✅ **Action Buttons** helpful navigation options
✅ **User-Friendly Language** simple and understandable

## Empty State Library

### Usage

```tsx
import { EmptyState } from '@/components/errors/EmptyState';
import { EmptyTransactions, EmptyInvoices } from '@/components/errors/EmptyStateLibrary';

// Custom empty state
<EmptyState
  icon={<CustomIcon />}
  title="No items found"
  description="Get started by creating your first item."
  action={{
    label: 'Create Item',
    onClick: () => router.push('/create'),
  }}
/>

// Pre-configured empty state
<EmptyTransactions />
```

### Pre-configured States

- **EmptyTransactions**: For transaction lists
- **EmptyInvoices**: For invoice lists
- **EmptyPartners**: For partner lists
- **EmptyUsers**: For user lists
- **EmptyReports**: For report pages
- **EmptySearch**: For search results

## Error Pages

### Generic Error Page
- **Route**: `/error`
- **Use Case**: Unexpected errors, 500 errors
- **Message**: "Something went wrong"
- **Actions**: Go to dashboard, try again

### Permission Denied Page
- **Route**: `/error/permission-denied`
- **Use Case**: RBAC violations, 403 errors
- **Message**: "Access Denied"
- **Actions**: Go to dashboard, go back

### Maintenance Page
- **Route**: `/maintenance`
- **Use Case**: Scheduled maintenance, downtime
- **Message**: "We'll be back soon"
- **Features**: Countdown timer, maintenance info

## Error Boundary

Wrap components with ErrorBoundary to catch React errors:

```tsx
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Custom Fallback

```tsx
<ErrorBoundary
  fallback={
    <CustomErrorUI />
  }
>
  <YourComponent />
</ErrorBoundary>
```

## Design Principles

### Clear Messaging
- **No Technical Jargon**: Avoid error codes, stack traces
- **User-Friendly Language**: Simple, understandable terms
- **Helpful Guidance**: What to do next

### Calm Tone
- **Reassuring**: "Don't worry", "We're working on it"
- **Professional**: Maintains trust
- **Positive**: Focus on solutions, not problems

### Actionable
- **Clear Actions**: What can the user do?
- **Navigation Options**: Where can they go?
- **Recovery Paths**: How to fix or continue

## Integration

### Using Empty States in Tables

```tsx
import { EmptyTransactions } from '@/components/errors/EmptyStateLibrary';

<Table
  data={transactions}
  columns={columns}
  emptyMessage={<EmptyTransactions />}
/>
```

### Using Error Pages

```tsx
// In Next.js error.tsx
import ErrorPage from '@/app/error/page';
export default ErrorPage;

// Or redirect to error page
router.push('/error');
```

### Using Permission Denied

```tsx
// Check permissions
if (!hasPermission) {
  router.push('/error/permission-denied');
  return;
}
```

## Maintenance Page Features

- **Countdown Timer**: Shows estimated time remaining
- **Maintenance Info**: What's being done
- **Reassuring Message**: "We'll be back soon"
- **Professional Design**: Maintains brand trust

## Best Practices

1. **Always Provide Actions**: Give users a way forward
2. **Use Pre-configured States**: When available, use library components
3. **Customize When Needed**: EmptyState is flexible for custom scenarios
4. **Wrap Critical Components**: Use ErrorBoundary for important sections
5. **Clear Messaging**: Always use user-friendly language
6. **No Technical Details**: Hide error codes and stack traces from users

## File Structure

```
app/
  ├── error/
  │   ├── page.tsx
  │   └── permission-denied/page.tsx
  └── maintenance/
      └── page.tsx

components/errors/
  ├── EmptyState.tsx
  ├── EmptyStateLibrary.tsx
  ├── ErrorBoundary.tsx
  └── index.ts
```

## Example Usage

```tsx
// In a page component
import { EmptyState } from '@/components/errors/EmptyState';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

export default function MyPage() {
  return (
    <ErrorBoundary>
      {data.length === 0 ? (
        <EmptyState
          title="No data found"
          description="Get started by creating your first item."
          action={{
            label: 'Create Item',
            onClick: () => router.push('/create'),
          }}
        />
      ) : (
        <DataTable data={data} />
      )}
    </ErrorBoundary>
  );
}
```

