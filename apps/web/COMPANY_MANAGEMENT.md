# Merchant / Company Management UI

## Overview

Complete company management interface with profile editing, linked accounts, partner management, compliance, and permissions. Built with enterprise-style forms and clear read-only/editable sections.

## Screens

### 1. Company Profile (`/company/profile`)
- **Editable Form**: Company information, address, details
- **Edit Mode**: Toggle between view and edit modes
- **Form Sections**: Basic Info, Address, Company Details
- **Validation**: Client-side form validation
- **Save/Cancel**: Clear action buttons

**Route**: `/company/profile`

### 2. Linked Accounts (`/company/accounts`)
- **Read-Only Display**: Stripe, QuickBooks, Bank connections
- **Connection Status**: Visual status badges (Connected, Disconnected, Pending, Error)
- **Account Details**: Account IDs, metadata, connection dates
- **Last Sync**: Timestamp of last synchronization
- **Info Banner**: Instructions for account management

**Route**: `/company/accounts`

### 3. Partner Companies (`/company/partners`)
- **Partner List Table**: All partner companies with pagination
- **Partner Details**: Individual partner detail page
- **Status Badges**: Active, Inactive, Pending
- **Statistics**: Agreements count, total revenue, partnership duration
- **Actions**: View details, add new partner

**Routes**: 
- `/company/partners` (List)
- `/company/partners/[id]` (Detail)

### 4. Compliance & Disclaimers (`/company/compliance`)
- **Compliance Items**: Terms, Privacy, GDPR, Tax, Financial
- **Acceptance Status**: Accepted/Not Accepted badges
- **Required Items**: Visual indicators for required documents
- **Warning Banners**: Legal disclaimers and action required alerts
- **Version Tracking**: Document versions and update dates
- **Accept Actions**: Accept required/optional documents

**Route**: `/company/compliance`

### 5. Access & Permissions Summary (`/company/permissions`)
- **Permission Summary**: Total, granted, not granted counts
- **Grouped by Category**: Dashboard, Transactions, Partners, Settings, Reports
- **Permission Cards**: Name, description, granted status
- **Read-Only Display**: Clear indication of read-only access
- **Info Banner**: Instructions for permission management

**Route**: `/company/permissions`

## Components

### FormSection
Enterprise-style form section component:
- **Title & Subtitle**: Section headers
- **Read-Only Badge**: Visual indicator for read-only sections
- **Action Buttons**: Optional action buttons in header
- **Card Wrapper**: Consistent card styling

**Location**: `components/company/FormSection.tsx`

### FormField
Reusable form field wrapper:
- **Label**: Field label with required indicator
- **Read-Only Indicator**: "(Read-only)" text for disabled fields
- **Error Display**: Error message support
- **Helper Text**: Additional guidance text

**Location**: `components/company/FormField.tsx`

### ConnectionStatus
Connection status badge component:
- **Status Types**: Connected, Disconnected, Pending, Error
- **Visual Badges**: Color-coded status indicators
- **Last Sync**: Optional timestamp display
- **Icons**: Visual status icons

**Location**: `components/company/ConnectionStatus.tsx`

### WarningBanner
Legal/compliance warning banner:
- **Types**: Warning, Error, Info, Legal
- **Icons**: Contextual icons for each type
- **Styled**: Color-coded backgrounds and borders
- **Flexible Content**: Supports any React children

**Location**: `components/company/WarningBanner.tsx`

## Services

### Mock Company Service
Provides mock data for all company management screens:

```typescript
import { mockCompanyService } from '@/services/mockCompany';

// Get company profile
const profile = await mockCompanyService.getCompanyProfile();

// Update company profile
await mockCompanyService.updateCompanyProfile(data);

// Get linked accounts
const accounts = await mockCompanyService.getLinkedAccounts();

// Get partner companies
const partners = await mockCompanyService.getPartnerCompanies(page, limit);

// Get compliance items
const compliance = await mockCompanyService.getComplianceItems();

// Get permissions
const permissions = await mockCompanyService.getPermissions();
```

**Location**: `services/mockCompany.ts`

## Features

✅ **Enterprise-Style Forms** with clear sections
✅ **Read-Only vs Editable** clearly marked
✅ **Connection Status Badges** for linked accounts
✅ **Legal/Compliance Warning Banners** for important notices
✅ **Partner List Tables** with pagination
✅ **Partner Detail Pages** with full information
✅ **Compliance Acceptance** workflow
✅ **Permission Summary** grouped by category
✅ **Form Validation** client-side
✅ **Loading States** skeleton loaders
✅ **No Backend Calls** all mock data

## Data Structure

### Company Profile
```typescript
{
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  website: string;
  address: { ... };
  industry: string;
  foundedYear: number;
  employeeCount: string;
  description: string;
}
```

### Linked Account
```typescript
{
  id: string;
  type: 'stripe' | 'quickbooks' | 'bank';
  name: string;
  accountId: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync: string | null;
  connectedAt: string;
  metadata?: { ... };
}
```

### Partner Company
```typescript
{
  id: string;
  name: string;
  legalName: string;
  email: string;
  phone: string;
  country: string;
  status: 'active' | 'inactive' | 'pending';
  agreementsCount: number;
  totalRevenue: number;
  joinedAt: string;
  address: { ... };
}
```

### Compliance Item
```typescript
{
  id: string;
  type: 'terms' | 'privacy' | 'gdpr' | 'tax' | 'financial';
  title: string;
  description: string;
  accepted: boolean;
  acceptedAt: string | null;
  version: string;
  lastUpdated: string;
  required: boolean;
}
```

### Permission
```typescript
{
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'transactions' | 'partners' | 'settings' | 'reports';
  granted: boolean;
}
```

## Form Patterns

### Editable Form
```tsx
<FormSection title="Section" readOnly={false}>
  <FormField label="Field" required>
    <Input value={value} onChange={handleChange} />
  </FormField>
</FormSection>
```

### Read-Only Display
```tsx
<FormSection title="Section" readOnly={true}>
  <FormField label="Field" readOnly={true}>
    <div className="text-gray-900">{value}</div>
  </FormField>
</FormSection>
```

## Integration with Real Backend

When ready to connect to real APIs:

1. Replace `mockCompanyService` calls with real API calls
2. Update data structures to match backend responses
3. Add real form validation (server-side)
4. Implement real file uploads for documents
5. Add real-time status updates for connections
6. Implement real permission management

The UI structure remains the same - only the service layer changes.

## Styling

All screens use:
- Tailwind CSS
- Consistent form styling
- Clear visual hierarchy
- Professional spacing
- Responsive grid layouts
- Color-coded status indicators

## Example Usage

```tsx
import { FormSection, FormField } from '@/components/company';
import { ConnectionStatus } from '@/components/company';
import { WarningBanner } from '@/components/company';
import { mockCompanyService } from '@/services/mockCompany';

const profile = await mockCompanyService.getCompanyProfile();
// Use profile data in forms
```

