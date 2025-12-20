# Merchant App - Next.js Frontend

## Overview

Next.js 14 frontend for Merchant App with role-based routing, authentication, and protected routes.

## Features

- ✅ Role-based routing (Merchant/Partner)
- ✅ Protected routes with RBAC
- ✅ Central authentication context
- ✅ Automatic token refresh
- ✅ Axios API client
- ✅ Merchant and Partner layouts
- ✅ Responsive design

## Project Structure

```
apps/web/src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── onboarding/        # Onboarding page
│   ├── merchant/          # Merchant pages
│   └── partner/           # Partner pages
├── components/            # React components
│   ├── ProtectedRoute.tsx # Route protection
│   └── layouts/           # Layout components
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                   # Utilities
    └── api.ts             # API client
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run Development Server

```bash
npm run dev
```

## Pages

### Public
- `/login` - Login page
- `/onboarding` - Onboarding flow

### Merchant (Protected)
- `/merchant/dashboard` - Dashboard with metrics
- `/merchant/transactions` - Transaction management
- `/merchant/partners` - Partner management
- `/merchant/agreements` - Agreement management
- `/merchant/payouts` - Payout management
- `/merchant/reports` - Reports and exports

### Partner (Protected)
- `/partner/dashboard` - Partner dashboard
- `/partner/reports` - Partner reports

## Authentication

### Auth Context

The `AuthContext` provides:
- `user` - Current user object
- `loading` - Loading state
- `login()` - Login function
- `logout()` - Logout function
- `refreshUser()` - Refresh user data

### Usage

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Protected Routes

### Basic Protection

```tsx
<ProtectedRoute allowedUserTypes={['merchant']}>
  <MerchantLayout>
    {/* Content */}
  </MerchantLayout>
</ProtectedRoute>
```

### Role-Based Protection

```tsx
<ProtectedRoute 
  allowedUserTypes={['merchant']}
  allowedRoles={['merchant_owner', 'merchant_manager']}
>
  <MerchantLayout>
    {/* Content */}
  </MerchantLayout>
</ProtectedRoute>
```

## API Client

### Usage

```tsx
import { api } from '@/lib/api';

// Dashboard
const metrics = await api.dashboard.getMerchant({ period: 'month' });

// Transactions
const transactions = await api.transactions.list({ page: 1, limit: 20 });

// Auth
await api.auth.loginMerchant({ email, password });
```

### Features

- Automatic token injection
- Token refresh on 401
- Centralized error handling
- TypeScript support

## Layouts

### Merchant Layout

Includes:
- Sidebar navigation
- Dashboard, Transactions, Partners, Agreements, Payouts, Reports
- User info and logout

### Partner Layout

Includes:
- Sidebar navigation
- Dashboard, Reports (limited access)
- User info and logout

## Routing Rules

1. **Unauthenticated users** → Redirected to `/login`
2. **Merchant users** → Can access `/merchant/*` routes
3. **Partner users** → Can access `/partner/*` routes
4. **Wrong user type** → Redirected to appropriate dashboard
5. **Home (`/`)** → Redirects based on auth state

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## Next Steps

1. Implement transaction list with pagination
2. Add partner management UI
3. Create agreement forms
4. Build payout creation forms
5. Add report filters and exports
6. Implement onboarding flow
7. Add error boundaries
8. Add loading skeletons

