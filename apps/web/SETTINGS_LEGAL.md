# Settings & Legal UI

## Overview

Complete settings and legal management interface with toggle-heavy UI, save state feedback, legal text blocks, and security warning callouts. Includes application settings, notification preferences, legal documents, and security configuration.

## Screens

### 1. Settings Overview (`/settings`)
- **Settings Categories**: Cards for different settings sections
- **Quick Navigation**: Direct links to specific settings
- **Feature Highlights**: Key features for each category
- **Visual Icons**: Icons for each settings category

**Route**: `/settings`

### 2. Application Settings (`/settings/application`)
- **Appearance**: Theme, language, compact mode
- **Localization**: Timezone, date format, currency
- **Notifications**: Enable/disable notification types
- **Data & Refresh**: Auto refresh settings
- **User Experience**: Tutorials and tips
- **Toggle-Heavy UI**: Multiple toggle switches
- **Save State Feedback**: Visual feedback on save

**Route**: `/settings/application`

### 3. Notification Preferences (`/settings/notifications`)
- **Email Notifications**: Transactions, payouts, invoices, alerts, reports, marketing
- **SMS Notifications**: Transactions, payouts, alerts
- **Push Notifications**: Transactions, payouts, alerts
- **Email Digest**: Frequency and time configuration
- **Toggle-Heavy UI**: Multiple toggle switches per category
- **Save State Feedback**: Visual feedback on save

**Route**: `/settings/notifications`

### 4. Legal Terms & Disclaimers (`/settings/legal`)
- **Legal Documents**: Terms of Service, Privacy Policy, Disclaimers
- **Document Display**: Scrollable legal text blocks
- **Acceptance Tracking**: Track which documents are accepted
- **Version Information**: Document versions and last updated dates
- **Accept Buttons**: Accept terms functionality
- **Summary Cards**: Total, accepted, pending counts

**Route**: `/settings/legal`

### 5. Data & Security Settings (`/settings/security`)
- **Authentication**: Two-factor auth, session timeout, password policies
- **Alerts & Monitoring**: Login alerts, audit log retention
- **API Security**: API key rotation
- **Data Protection**: Encryption, backup settings
- **IP Access Control**: IP whitelist management
- **Security Warnings**: Warning callouts for important settings
- **Toggle-Heavy UI**: Multiple security toggles

**Route**: `/settings/security`

## Components

### Toggle
Toggle switch component with save state feedback:
- **Label & Description**: Clear labeling and descriptions
- **Save State**: Shows "Saving..." and "Saved" feedback
- **Loading Indicator**: Spinner during save
- **Disabled State**: Can be disabled
- **Visual Feedback**: Green checkmark on save

**Location**: `components/settings/Toggle.tsx`

### SecurityWarning
Security warning callout component:
- **Severity Levels**: Warning, error, info
- **Title & Message**: Clear warning messages
- **Uses WarningBanner**: Reuses existing banner component

**Location**: `components/settings/SecurityWarning.tsx`

### LegalTextBlock
Legal document display component:
- **Scrollable Content**: Max height with scroll for long documents
- **Last Updated**: Shows last updated date
- **Accept Button**: Accept terms functionality
- **Accepted State**: Shows accepted status
- **Formatted Text**: Proper text formatting

**Location**: `components/settings/LegalTextBlock.tsx`

## Services

### Mock Settings Service
Provides mock data for all settings screens:

```typescript
import { mockSettingsService } from '@/services/mockSettings';

// Get application settings
const settings = await mockSettingsService.getApplicationSettings();

// Update application settings
await mockSettingsService.updateApplicationSettings(partialSettings);

// Get notification preferences
const preferences = await mockSettingsService.getNotificationPreferences();

// Update notification preferences
await mockSettingsService.updateNotificationPreferences(partialPreferences);

// Get legal documents
const documents = await mockSettingsService.getLegalDocuments();

// Accept legal document
await mockSettingsService.acceptLegalDocument(documentId);

// Get security settings
const security = await mockSettingsService.getSecuritySettings();

// Update security settings
await mockSettingsService.updateSecuritySettings(partialSettings);
```

**Location**: `services/mockSettings.ts`

## Features

✅ **Toggle-Heavy UI** with multiple toggle switches
✅ **Save State Feedback** visual feedback on save (Saving... / Saved)
✅ **Legal Text Blocks** scrollable legal document display
✅ **Security Warning Callouts** prominent security warnings
✅ **Real-Time Updates** settings update immediately
✅ **Acceptance Tracking** track legal document acceptance
✅ **Version Information** document versions and dates
✅ **Category Organization** settings grouped by category
✅ **No Backend Calls** all mock data

## Data Structure

### Application Settings
```typescript
{
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  enableNotifications: boolean;
  enableEmailAlerts: boolean;
  enableSMSAlerts: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  showTutorials: boolean;
  compactMode: boolean;
}
```

### Notification Preferences
```typescript
{
  email: {
    transactions: boolean;
    payouts: boolean;
    invoices: boolean;
    alerts: boolean;
    reports: boolean;
    marketing: boolean;
  };
  sms: {
    transactions: boolean;
    payouts: boolean;
    alerts: boolean;
  };
  push: {
    transactions: boolean;
    payouts: boolean;
    alerts: boolean;
  };
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
}
```

### Legal Document
```typescript
{
  id: string;
  title: string;
  type: 'terms' | 'privacy' | 'disclaimer' | 'policy';
  content: string;
  lastUpdated: string;
  version: string;
  accepted: boolean;
  acceptedAt: string | null;
}
```

### Security Settings
```typescript
{
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  requireStrongPassword: boolean;
  loginAlerts: boolean;
  ipWhitelist: string[];
  apiKeyRotation: number;
  auditLogRetention: number;
  dataEncryption: boolean;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}
```

## Save State Feedback

The Toggle component provides visual feedback:
1. **Saving State**: Shows spinner and "Saving..." text
2. **Saved State**: Shows checkmark and "Saved" text (disappears after 2 seconds)
3. **Real-Time Updates**: Settings update immediately on toggle

## Security Warnings

Security warnings are displayed for:
- **Two-Factor Auth**: Recommended when disabled
- **Data Encryption**: Critical when disabled
- **API Key Rotation**: Reminder for regular rotation
- **IP Whitelist**: Warning about access restrictions

## Legal Documents

Legal documents include:
- **Terms of Service**: Service usage terms
- **Privacy Policy**: Data privacy information
- **Financial Disclaimer**: Financial risk disclaimers
- **Acceptance Tracking**: Track which documents are accepted
- **Version Control**: Document versions and updates

## Integration with Real Backend

When ready to connect to real APIs:

1. Replace `mockSettingsService` calls with real API calls
2. Update data structures to match backend responses
3. Add real-time sync for settings
4. Implement document version checking
5. Add email notifications for legal updates
6. Implement audit logging for security changes
7. Add two-factor authentication setup flow

The UI structure remains the same - only the service layer changes.

## Styling

All screens use:
- Tailwind CSS
- Professional, clean design
- Clear visual hierarchy
- Toggle switches for boolean settings
- Form sections for organization
- Warning banners for important notices
- Responsive layouts

## Example Usage

```tsx
import { Toggle } from '@/components/settings/Toggle';
import { SecurityWarning } from '@/components/settings/SecurityWarning';
import { LegalTextBlock } from '@/components/settings/LegalTextBlock';
import { mockSettingsService } from '@/services/mockSettings';

const settings = await mockSettingsService.getApplicationSettings();
// Use settings in components
```

