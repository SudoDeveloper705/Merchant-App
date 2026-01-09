# Authentication & Access UI Screens

## Overview

Complete authentication flow UI screens for the Merchant App, built with Next.js App Router and reusable components.

## Screens

### 1. Login (`/login`)
- Email and password input
- Form validation (client-side)
- "Forgot password" link
- Link to sign up
- Loading states
- Error handling

**Route**: `/login`

### 2. Sign Up (`/signup`)
- Full name, email, password, confirm password
- Optional company name
- Password strength requirements
- Form validation
- Terms & Privacy links
- Redirects to email verification

**Route**: `/signup`

### 3. Forgot Password (`/forgot-password`)
- Email input
- Success state with confirmation message
- Resend email option
- Link back to login

**Route**: `/forgot-password`

### 4. Email Verification (`/email-verification`)
- 6-digit code input (auto-focus, paste support)
- Resend code functionality
- Success/error states
- Redirects to role selection on success

**Route**: `/email-verification?email=user@example.com`

### 5. Role Selection (`/role-selection`)
- Four role options:
  - **US Owner**: Full merchant dashboard access
  - **Accountant**: Financial data and reports
  - **Offshore Partner**: Partner dashboard access
  - **Read-Only**: View-only access
- Visual role cards with features
- Routes to appropriate dashboard on selection

**Route**: `/role-selection`

## Components

### AuthLayout
Reusable layout component for all auth screens:
- Header with logo and navigation
- Centered form container
- Footer with links
- Consistent styling

**Location**: `components/auth/AuthLayout.tsx`

### Form Components
- **Input**: Text input with label, error, and helper text
- **Button**: With loading states
- **ErrorText**: Error message display

**Location**: `components/ui/`

## Services

### Mock Auth Service
Simulates authentication flows without backend calls:

```typescript
import { mockAuthService } from '@/services/mockAuth';

// Login
await mockAuthService.login({ email, password });

// Sign Up
await mockAuthService.signUp({ email, password, name, ... });

// Forgot Password
await mockAuthService.forgotPassword(email);

// Verify Email
await mockAuthService.verifyEmail({ email, code });

// Select Role
await mockAuthService.selectRole('us_owner');
```

**Location**: `services/mockAuth.ts`

### Validation Utilities
Client-side form validation:

```typescript
import { validators } from '@/lib/validation';

validators.email(email);
validators.password(password);
validators.required(value, 'Field Name');
validators.match(value1, value2, 'Fields');
```

**Location**: `lib/validation.ts`

## Routing

All auth screens are in the `(auth)` route group:
```
app/(auth)/
  ├── login/
  │   └── page.tsx
  ├── signup/
  │   └── page.tsx
  ├── forgot-password/
  │   └── page.tsx
  ├── email-verification/
  │   └── page.tsx
  └── role-selection/
      └── page.tsx
```

The `(auth)` folder is a Next.js route group - it doesn't affect the URL structure.

## User Flow

1. **Sign Up** → Email Verification → Role Selection → Dashboard
2. **Login** → Role Selection → Dashboard
3. **Forgot Password** → Email with reset link → Reset Password → Login

## Role Routing

After role selection, users are routed to:
- **US Owner** → `/merchant/dashboard`
- **Accountant** → `/merchant/dashboard`
- **Offshore Partner** → `/partner/dashboard`
- **Read-Only** → `/merchant/dashboard`

## Features

✅ Clean, professional SaaS UI
✅ Reusable AuthLayout component
✅ Client-side form validation
✅ Loading states on all forms
✅ Error handling and display
✅ Role-based routing
✅ Mock auth service (no backend calls)
✅ Responsive design
✅ Accessible forms (labels, ARIA)

## Integration with Real Backend

When ready to connect to real APIs:

1. Replace `mockAuthService` calls with real API calls
2. Update response handling to match backend structure
3. Add token storage (localStorage/cookies)
4. Update redirect logic based on actual user data
5. Add real email verification flow

The UI structure remains the same - only the service layer changes.

## Example Usage

```tsx
// Login page
import { mockAuthService } from '@/services/mockAuth';
import { validators } from '@/lib/validation';

const response = await mockAuthService.login({ email, password });
if (response.success) {
  router.push('/role-selection');
}
```

## Styling

All screens use:
- Tailwind CSS
- Consistent color scheme (primary-600 for primary actions)
- Professional spacing and typography
- Responsive design (mobile-first)

