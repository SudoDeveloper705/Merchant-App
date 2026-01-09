# App Router Structure

This document outlines the route group organization in the Next.js App Router.

## Route Groups

Route groups (folders with parentheses) organize routes without affecting URLs. All existing URLs remain unchanged.

### `(auth)` - Authentication Routes

**Location**: `app/(auth)/`

**Routes**:
- `/login` → `app/(auth)/login/page.tsx`
- `/signup` → `app/(auth)/signup/page.tsx`
- `/forgot-password` → `app/(auth)/forgot-password/page.tsx`
- `/email-verification` → `app/(auth)/email-verification/page.tsx`
- `/role-selection` → `app/(auth)/role-selection/page.tsx`

**Purpose**: All authentication and access-related pages.

---

### `(merchant)` - Merchant Routes

**Location**: `app/(merchant)/`

#### Root-Level Merchant Pages

These pages are accessible at the root level:

- `/dashboard` → `app/(merchant)/dashboard/page.tsx`
  - `/dashboard/activity` → `app/(merchant)/dashboard/activity/page.tsx`
  - `/dashboard/revenue` → `app/(merchant)/dashboard/revenue/page.tsx`
  - `/dashboard/notifications` → `app/(merchant)/dashboard/notifications/page.tsx`

- `/company` → `app/(merchant)/company/`
  - `/company/profile` → `app/(merchant)/company/profile/page.tsx`
  - `/company/accounts` → `app/(merchant)/company/accounts/page.tsx`
  - `/company/partners` → `app/(merchant)/company/partners/page.tsx`
  - `/company/partners/[id]` → `app/(merchant)/company/partners/[id]/page.tsx`
  - `/company/compliance` → `app/(merchant)/company/compliance/page.tsx`
  - `/company/permissions` → `app/(merchant)/company/permissions/page.tsx`

- `/invoices` → `app/(merchant)/invoices/`
  - `/invoices` → `app/(merchant)/invoices/page.tsx`
  - `/invoices/create` → `app/(merchant)/invoices/create/page.tsx`
  - `/invoices/[id]` → `app/(merchant)/invoices/[id]/page.tsx`

- `/payments` → `app/(merchant)/payments/`
  - `/payments/status/[invoiceId]` → `app/(merchant)/payments/status/[invoiceId]/page.tsx`
  - `/payments/split-preview` → `app/(merchant)/payments/split-preview/page.tsx`
  - `/payments/schedule` → `app/(merchant)/payments/schedule/page.tsx`
  - `/payments/failed` → `app/(merchant)/payments/failed/page.tsx`

- `/splits` → `app/(merchant)/splits/`
  - `/splits/configuration` → `app/(merchant)/splits/configuration/page.tsx`
  - `/splits/breakdown` → `app/(merchant)/splits/breakdown/page.tsx`
  - `/splits/payouts/historical` → `app/(merchant)/splits/payouts/historical/page.tsx`
  - `/splits/payouts/pending` → `app/(merchant)/splits/payouts/pending/page.tsx`
  - `/splits/adjustments` → `app/(merchant)/splits/adjustments/page.tsx`
  - `/splits/audit` → `app/(merchant)/splits/audit/page.tsx`

- `/users` → `app/(merchant)/users/`
  - `/users` → `app/(merchant)/users/page.tsx`
  - `/users/[id]/permissions` → `app/(merchant)/users/[id]/permissions/page.tsx`
  - `/users/[id]/activity` → `app/(merchant)/users/[id]/activity/page.tsx`

- `/reports` → `app/(merchant)/reports/`
  - `/reports` → `app/(merchant)/reports/page.tsx`
  - `/reports/financial` → `app/(merchant)/reports/financial/page.tsx`
  - `/reports/transactions` → `app/(merchant)/reports/transactions/page.tsx`

- `/settings` → `app/(merchant)/settings/`
  - `/settings` → `app/(merchant)/settings/page.tsx`
  - `/settings/application` → `app/(merchant)/settings/application/page.tsx`
  - `/settings/notifications` → `app/(merchant)/settings/notifications/page.tsx`
  - `/settings/legal` → `app/(merchant)/settings/legal/page.tsx`
  - `/settings/security` → `app/(merchant)/settings/security/page.tsx`

#### Merchant-Specific Routes (with `/merchant` prefix)

These pages are accessible at `/merchant/*`:

- `/merchant/dashboard` → `app/(merchant)/merchant/dashboard/page.tsx`
- `/merchant/transactions` → `app/(merchant)/merchant/transactions/page.tsx`
- `/merchant/partners` → `app/(merchant)/merchant/partners/page.tsx`
- `/merchant/agreements` → `app/(merchant)/merchant/agreements/page.tsx`
- `/merchant/payouts` → `app/(merchant)/merchant/payouts/page.tsx`
- `/merchant/reports` → `app/(merchant)/merchant/reports/page.tsx`

**Layout**: `app/(merchant)/merchant/layout.tsx`

**Purpose**: Legacy merchant dashboard pages and merchant-specific functionality.

---

### `(partner)` - Partner Routes

**Location**: `app/(partner)/`

**Routes**:
- `/partner/dashboard` → `app/(partner)/partner/dashboard/page.tsx`
- `/partner/invoices` → `app/(partner)/partner/invoices/page.tsx`
- `/partner/payouts` → `app/(partner)/partner/payouts/page.tsx`
- `/partner/reports` → `app/(partner)/partner/reports/page.tsx`
- `/partner/team` → `app/(partner)/partner/team/page.tsx`
- `/partner/staff/invite` → `app/(partner)/partner/staff/invite/page.tsx`
- `/partner/set-password` → `app/(partner)/partner/set-password/page.tsx`
- `/partner/signup` → `app/(partner)/partner/signup/page.tsx`

**Layout**: `app/(partner)/partner/layout.tsx`

**Purpose**: All partner-specific pages and functionality.

---

## Other Routes

### Root Routes
- `/` → `app/page.tsx` (Landing page)
- `/onboarding` → `app/onboarding/page.tsx`

### Error Routes
- `/error` → `app/error/page.tsx`
- `/error/permission-denied` → `app/error/permission-denied/page.tsx`
- `app/error.tsx` (Error boundary)
- `app/global-error.tsx` (Global error boundary)
- `app/not-found.tsx` (404 page)

### Maintenance
- `/maintenance` → `app/maintenance/page.tsx`

### API Routes
- `/api/health` → `app/api/health/route.ts`

---

## Route Group Benefits

1. **Organization**: Related pages are grouped together logically
2. **No URL Changes**: Route groups don't affect URLs - all existing URLs work exactly as before
3. **Layout Sharing**: Each route group can have its own layout
4. **Conflict Prevention**: Clear separation prevents routing conflicts

## Navigation

All navigation links use the actual URL paths (e.g., `/dashboard`, `/merchant/dashboard`, `/partner/dashboard`), not the file paths. This ensures URLs remain stable regardless of internal file organization.

## Adding New Routes

- **Merchant pages (root-level)**: Add to `app/(merchant)/`
- **Merchant pages (with prefix)**: Add to `app/(merchant)/merchant/`
- **Partner pages**: Add to `app/(partner)/partner/`
- **Auth pages**: Add to `app/(auth)/`
- **Other pages**: Add to `app/` root
