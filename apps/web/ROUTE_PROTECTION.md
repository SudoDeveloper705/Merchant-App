# Route Protection Implementation

This document describes how route protection is implemented in the Merchant App.

## Overview

Route protection ensures that only authenticated users can access certain pages. Unauthenticated users are automatically redirected to the login page.

## Implementation

### ProtectedRoute Component

The `ProtectedRoute` component (`apps/web/src/components/ProtectedRoute.tsx`) wraps pages that require authentication.

**Features:**
- Shows loading state while authentication is being resolved
- Redirects to `/login` if user is not authenticated
- Only renders children if user is authenticated

**Usage:**
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Layout-Based Protection

For routes under `/merchant/*`, protection is applied at the layout level:

**File:** `apps/web/src/app/merchant/layout.tsx`

```tsx
export default function MerchantLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

This automatically protects all pages under `/merchant/*`:
- `/merchant/dashboard`
- `/merchant/transactions`
- `/merchant/partners`
- `/merchant/agreements`
- `/merchant/payouts`
- `/merchant/reports`

## Protected Routes

The following routes are protected:

1. **Dashboard** - `/merchant/dashboard`
2. **Transactions** - `/merchant/transactions`
3. **Partners** - `/merchant/partners`
4. **Agreements** - `/merchant/agreements`

## How It Works

### Authentication Flow

1. **User navigates to protected route**
   - Component renders
   - `ProtectedRoute` checks `useAuth()` hook

2. **Loading state**
   - If `loading === true`, shows loading spinner
   - Prevents flash of unauthenticated content

3. **Authentication check**
   - If `loading === false` and `user === null`:
     - Redirects to `/login`
     - Does not render children

4. **Authenticated user**
   - If `user` exists:
     - Renders children
     - User can access the page

### Code Flow

```tsx
ProtectedRoute:
1. Get user and loading from useAuth()
2. useEffect: If !loading && !user → redirect to /login
3. If loading → show loading spinner
4. If !user → return null (redirect happening)
5. If user → render children
```

## Loading State

While authentication is being resolved, a loading spinner is displayed:

```tsx
<div className="min-h-screen flex items-center justify-center bg-gray-50">
  <div className="text-center">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
</div>
```

This prevents:
- Flash of unauthenticated content
- User seeing protected content before redirect
- Confusing user experience

## Redirect Behavior

When an unauthenticated user tries to access a protected route:

1. **Immediate redirect**
   - `useEffect` triggers redirect to `/login`
   - Happens as soon as auth check completes

2. **No content flash**
   - Children are not rendered if user is null
   - Loading state prevents premature rendering

3. **Preserved navigation**
   - User can return to intended page after login
   - Login page can redirect back using `router.push()`

## Alternative: Middleware Approach

For Next.js App Router, you can also use `middleware.ts` for route protection:

```typescript
// apps/web/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/dashboard', '/transactions', '/partners', '/agreements'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/transactions/:path*', '/partners/:path*', '/agreements/:path*'],
};
```

**Note:** The component-based approach is preferred because:
- Works with client-side auth state
- Shows loading states
- Easier to customize per route
- Better integration with AuthContext

## Testing

### Test Protected Route

1. **Without authentication:**
   - Navigate to `/merchant/dashboard`
   - Should redirect to `/login`

2. **With authentication:**
   - Login first
   - Navigate to `/merchant/dashboard`
   - Should show dashboard content

3. **Loading state:**
   - Clear localStorage
   - Navigate to protected route
   - Should see loading spinner briefly before redirect

## Best Practices

1. **Use layout for route groups**
   - Protect all routes under `/merchant/*` with layout
   - Reduces code duplication

2. **Show loading states**
   - Prevents flash of content
   - Better user experience

3. **Handle edge cases**
   - Token expired
   - Network errors
   - Invalid tokens

4. **Consistent redirects**
   - Always redirect to `/login`
   - Preserve intended destination if needed

## Related Files

- `apps/web/src/components/ProtectedRoute.tsx` - Protected route component
- `apps/web/src/app/merchant/layout.tsx` - Merchant layout with protection
- `apps/web/src/contexts/AuthContext.tsx` - Authentication context
- `apps/web/src/lib/authApi.ts` - Authentication API client

