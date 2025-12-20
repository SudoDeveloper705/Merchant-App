# AuthContext Usage Guide

This document describes how to use the AuthContext in the Merchant App frontend.

## Overview

The `AuthContext` provides authentication state management for the entire application. It handles:
- User authentication state
- Login and signup
- Logout
- Automatic token management
- Redirects for unauthenticated users
- Fetching user data on app load

## Setup

The `AuthProvider` is already set up in `apps/web/src/app/layout.tsx`:

```tsx
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

## Using the useAuth Hook

### Basic Usage

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Merchant: {user.merchantName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## AuthContext API

### Properties

#### `user: User | null`
Current authenticated user or `null` if not authenticated.

```typescript
interface User {
  id: string;
  name: string;           // Full name (first + last)
  email: string;
  role: string;          // merchant_owner, merchant_manager, merchant_accountant
  merchantId: string;
  merchantName: string;  // Business name
}
```

#### `loading: boolean`
Indicates if authentication check is in progress. `true` during initial load or when checking auth status.

### Methods

#### `login(data: LoginMerchantData): Promise<void>`
Login a merchant user.

**Parameters:**
```typescript
{
  email: string;
  password: string;
}
```

**Example:**
```tsx
const { login } = useAuth();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await login({
      email: 'john@acme.com',
      password: 'password123'
    });
    // User is automatically redirected to /merchant/dashboard
  } catch (error: any) {
    console.error('Login failed:', error.message);
  }
};
```

#### `signup(data: RegisterMerchantData): Promise<void>`
Register a new merchant and create merchant_owner user.

**Parameters:**
```typescript
{
  merchant_name: string;  // Business name
  owner_name: string;     // Owner's full name
  email: string;
  password: string;
}
```

**Example:**
```tsx
const { signup } = useAuth();

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await signup({
      merchant_name: 'Acme Corporation',
      owner_name: 'John Doe',
      email: 'john@acme.com',
      password: 'password123'
    });
    // User is automatically redirected to /merchant/dashboard
  } catch (error: any) {
    console.error('Signup failed:', error.message);
  }
};
```

#### `logout(): void`
Logout current user. Clears tokens and redirects to login.

**Example:**
```tsx
const { logout } = useAuth();

<button onClick={logout}>Logout</button>
```

#### `refreshUser(): Promise<void>`
Refresh user data from `/merchant/me` endpoint. Useful after profile updates.

**Example:**
```tsx
const { refreshUser } = useAuth();

// After updating profile
await updateProfile(data);
await refreshUser(); // Update user state
```

## Complete Examples

### Login Page

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      // Redirect happens automatically in AuthContext
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Signup Page

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    merchant_name: '',
    owner_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(formData);
      // Redirect happens automatically in AuthContext
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        value={formData.merchant_name}
        onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
        placeholder="Business Name"
        required
      />
      <input
        type="text"
        value={formData.owner_name}
        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
        placeholder="Owner Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### Protected Dashboard

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // AuthContext automatically redirects to login if not authenticated
  // But we can add additional checks
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.email}</p>
        <p>Merchant: {user.merchantName}</p>
        <p>Role: {user.role}</p>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Route Component

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
```

## Automatic Features

### Token Persistence
- Access tokens are automatically stored in `localStorage` after login/signup
- Tokens are automatically attached to API requests
- Tokens are automatically cleared on logout or 401 errors

### Automatic Redirects
- Unauthenticated users are automatically redirected to `/login` when accessing protected routes
- Public routes (`/`, `/login`, `/signup`) don't require authentication

### User Data Fetching
- User data is automatically fetched from `/merchant/me` on app load
- User data is refreshed after login/signup

## Error Handling

All methods throw errors that you can catch:

```tsx
try {
  await login({ email, password });
} catch (error: any) {
  // Handle error
  console.error('Login error:', error.message);
  // Show error to user
  setError(error.message);
}
```

## Loading States

Always check the `loading` state before rendering:

```tsx
const { user, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

// Now safe to check user
if (!user) {
  return <LoginForm />;
}

return <Dashboard user={user} />;
```

## TypeScript Types

The AuthContext is fully typed. Import types if needed:

```typescript
import type { User } from '@/contexts/AuthContext';
```

## Best Practices

1. **Always check loading state** before checking user
2. **Handle errors** in try/catch blocks
3. **Use protected routes** for authenticated pages
4. **Call refreshUser()** after profile updates
5. **Don't manually manage tokens** - AuthContext handles it

## Integration with Next.js

The AuthContext works seamlessly with Next.js App Router:
- Uses `useRouter` from `next/navigation`
- Uses `usePathname` to detect public routes
- Works with client components (`'use client'`)

