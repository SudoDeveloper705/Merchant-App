# User & Role Management UI

## Overview

Complete user and role management interface with user list, invitation system, role/permission editing, and activity logging. Built with clear responsibility indicators and permission matrix UI.

## Screens

### 1. User List (`/users`)
- **User Table**: All users with pagination
- **Role Badges**: Visual role indicators
- **Status Badges**: Active, Pending, Inactive
- **Search & Filters**: By name, email, role, status
- **Summary Cards**: Total, active, pending, inactive counts
- **Quick Actions**: View permissions, view activity
- **Invite Button**: Opens invite modal

**Route**: `/users`

### 2. Invite User (Modal)
- **Invite Modal**: Overlay modal for user invitation
- **Form Fields**: Name, email, role selection
- **Validation**: Email and name validation
- **Role Selection**: Dropdown with available roles
- **Send Invitation**: Creates pending user

**Component**: `InviteUserModal` (used in User List)

### 3. Edit Roles & Permissions (`/users/[id]/permissions`)
- **User Information**: Name, email, status, last login
- **Role Selector**: Dropdown to change user role
- **Permission Matrix**: Visual permission grid by category
- **Permission Toggles**: Individual permission on/off switches
- **Responsibility Summary**: Clear indicators of capabilities
- **Category Grouping**: Permissions grouped by category
- **Granted Count**: Shows granted/total per category

**Route**: `/users/[id]/permissions`

### 4. User Activity Logs (`/users/[id]/activity`)
- **Activity Table**: All user activities with pagination
- **Action Badges**: Color-coded action types
- **Entity Tracking**: What was changed
- **IP Address**: Security tracking
- **Timestamps**: Absolute and relative time
- **Summary Cards**: Total activities, logins, changes
- **Read-Only View**: Historical data only

**Route**: `/users/[id]/activity`

## Components

### RoleBadge
Role indicator badge component:
- **Color Coding**: Different colors for different roles
- **Role Labels**: Human-readable role names
- **Consistent Styling**: Matches design system

**Location**: `components/users/RoleBadge.tsx`

### PermissionMatrix
Permission management grid:
- **Category Grouping**: Permissions organized by category
- **Toggle Switches**: Individual permission toggles
- **Granted Indicators**: Visual granted/not granted states
- **Category Counts**: Shows granted/total per category
- **Read-Only Mode**: Can be set to read-only

**Location**: `components/users/PermissionMatrix.tsx`

### InviteUserModal
User invitation modal:
- **Modal Overlay**: Centered modal dialog
- **Form Validation**: Client-side validation
- **Role Selection**: Dropdown with available roles
- **Error Handling**: Display validation errors
- **Loading States**: Loading indicator during submission

**Location**: `components/users/InviteUserModal.tsx`

## Services

### Mock User Service
Provides mock data for all user management screens:

```typescript
import { mockUserService } from '@/services/mockUsers';

// Get users
const response = await mockUserService.getUsers(page, limit);

// Get user
const user = await mockUserService.getUser(id);

// Invite user
await mockUserService.inviteUser({ name, email, role });

// Update user role
await mockUserService.updateUserRole(userId, role);

// Get permissions for role
const permissions = await mockUserService.getPermissionsForRole(role);

// Update permissions
await mockUserService.updatePermissions(userId, permissions);

// Get activity logs
const response = await mockUserService.getActivityLogs(userId, page, limit);
```

**Location**: `services/mockUsers.ts`

## Features

✅ **Role Badges** with color coding
✅ **Permission Matrix UI** with category grouping
✅ **Invite Modal** for user invitations
✅ **Activity Log Table** with pagination
✅ **Clear Responsibility Indicators** summary cards
✅ **Role Selector** dropdown component
✅ **Permission Toggles** individual permission switches
✅ **Search & Filters** by name, email, role, status
✅ **User Status Tracking** active, pending, inactive
✅ **IP Address Tracking** in activity logs
✅ **No Backend Calls** all mock data

## Data Structure

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string | null;
  createdAt: string;
  invitedBy: string | null;
  merchantId?: string;
  partnerId?: string;
}
```

### Permission
```typescript
{
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'transactions' | 'partners' | 'settings' | 'reports' | 'users';
  granted: boolean;
}
```

### Activity Log
```typescript
{
  id: string;
  userId: string;
  userName: string;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'invite' | 'role_change';
  entity: string;
  entityId: string | null;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}
```

## Roles

### Merchant Roles
- **Merchant Owner**: Full access to all features
- **Merchant Manager**: Management access, no user management
- **Merchant Accountant**: Financial data and reports only
- **Viewer**: Read-only access

### Partner Roles
- **Partner Owner**: Partner dashboard access
- **Partner Staff**: Limited partner access

## Permission Categories

- **Dashboard**: View dashboard access
- **Transactions**: View, create, edit transactions
- **Partners**: View, manage partners and agreements
- **Settings**: Company settings and configuration
- **Reports**: View and export reports
- **Users**: User management and invitations

## Responsibility Indicators

The Edit Permissions screen includes a responsibility summary showing:
- Can Access Dashboard
- Can Create/Edit
- Can Manage Users
- Can Export Data

These provide quick visibility into user capabilities.

## Integration with Real Backend

When ready to connect to real APIs:

1. Replace `mockUserService` calls with real API calls
2. Update data structures to match backend responses
3. Add real email invitation system
4. Implement real-time permission updates
5. Add real-time activity logging
6. Implement approval workflows for role changes

The UI structure remains the same - only the service layer changes.

## Styling

All screens use:
- Tailwind CSS
- Professional, business-focused design
- Clear visual hierarchy
- Consistent badge styling
- Responsive grid layouts
- Modal overlays for invitations

## Example Usage

```tsx
import { RoleBadge } from '@/components/users/RoleBadge';
import { PermissionMatrix } from '@/components/users/PermissionMatrix';
import { InviteUserModal } from '@/components/users/InviteUserModal';
import { mockUserService } from '@/services/mockUsers';

const users = await mockUserService.getUsers();
// Use users in table
```

