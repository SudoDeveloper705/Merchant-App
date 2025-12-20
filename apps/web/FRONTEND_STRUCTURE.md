# Next.js Frontend Structure

## Folder Structure

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Home page (redirects based on auth)
│   ├── globals.css             # Global styles
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── onboarding/
│   │   └── page.tsx            # Onboarding page
│   ├── merchant/
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Merchant dashboard
│   │   ├── transactions/
│   │   │   └── page.tsx        # Transactions page
│   │   ├── partners/
│   │   │   └── page.tsx        # Partners page
│   │   ├── agreements/
│   │   │   └── page.tsx        # Agreements page
│   │   ├── payouts/
│   │   │   └── page.tsx        # Payouts page
│   │   └── reports/
│   │       └── page.tsx        # Reports page
│   └── partner/
│       ├── dashboard/
│       │   └── page.tsx        # Partner dashboard
│       └── reports/
│           └── page.tsx        # Partner reports
├── components/
│   ├── ProtectedRoute.tsx      # Route protection wrapper
│   └── layouts/
│       ├── MerchantLayout.tsx  # Merchant sidebar layout
│       └── PartnerLayout.tsx   # Partner sidebar layout
├── contexts/
│   └── AuthContext.tsx         # Authentication context
└── lib/
    └── api.ts                  # Axios API client
```

## Key Components

### 1. Auth Context (`contexts/AuthContext.tsx`)

Central authentication state management:
- User state
- Login/logout functions
- Token management
- Auto-refresh on mount
- Redirects based on user type

**Usage:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  // ...
}
```

### 2. Protected Route (`components/ProtectedRoute.tsx`)

Route protection wrapper with RBAC:
- Checks authentication
- Validates user type
- Validates roles
- Redirects unauthorized users
- Shows loading state

**Usage:**
```tsx
<ProtectedRoute allowedUserTypes={['merchant']}>
  <MerchantLayout>
    {/* Protected content */}
  </MerchantLayout>
</ProtectedRoute>
```

### 3. API Client (`lib/api.ts`)

Axios-based API client:
- Automatic token injection
- Token refresh on 401
- Centralized endpoints
- Error handling

**Usage:**
```tsx
import { api } from '@/lib/api';

const response = await api.dashboard.getMerchant({ period: 'month' });
```

### 4. Layouts

**MerchantLayout:**
- Sidebar navigation
- Merchant-specific menu items
- User info and logout

**PartnerLayout:**
- Sidebar navigation
- Partner-specific menu items (limited)
- User info and logout

## Pages

### Public Pages

- `/login` - Login page (merchant/partner)
- `/onboarding` - Onboarding flow

### Merchant Pages

- `/merchant/dashboard` - Dashboard with metrics
- `/merchant/transactions` - Transaction list
- `/merchant/partners` - Partner management
- `/merchant/agreements` - Agreement management
- `/merchant/payouts` - Payout management
- `/merchant/reports` - Reports and exports

### Partner Pages

- `/partner/dashboard` - Partner dashboard
- `/partner/reports` - Partner reports

## Routing Rules

1. **Home (`/`)**: Redirects to login or appropriate dashboard
2. **Login (`/login`)**: Public, redirects to dashboard if already logged in
3. **Merchant Routes**: Protected, requires merchant user type
4. **Partner Routes**: Protected, requires partner user type

## Authentication Flow

1. User visits `/login`
2. Selects account type (merchant/partner)
3. Enters credentials
4. API call to `/api/auth/login/{type}`
5. Tokens stored in localStorage
6. User data stored in context
7. Redirect to appropriate dashboard

## Protected Route Example

```tsx
'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';

export default function MyPage() {
  return (
    <ProtectedRoute allowedUserTypes={['merchant']}>
      <MerchantLayout>
        <div>
          <h1>Protected Content</h1>
        </div>
      </MerchantLayout>
    </ProtectedRoute>
  );
}
```

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Features

- ✅ Role-based routing
- ✅ Protected routes with RBAC
- ✅ Central auth context
- ✅ Automatic token refresh
- ✅ Axios API client
- ✅ Merchant and Partner layouts
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

