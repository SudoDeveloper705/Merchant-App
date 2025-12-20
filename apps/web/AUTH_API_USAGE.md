# Authentication API Client Usage

This document describes how to use the authentication API client (`authApi.ts`) in the Merchant App frontend.

## Overview

The `authApi.ts` file provides a clean, type-safe API client for authentication operations with:
- Automatic token management (from localStorage)
- Automatic 401 error handling
- TypeScript types for all functions
- Base URL from `NEXT_PUBLIC_API_BASE` environment variable

## Setup

### Environment Variable

Add to your `.env.local` or `.env` file:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

Or use the fallback:
- `NEXT_PUBLIC_API_URL` (if `NEXT_PUBLIC_API_BASE` is not set)
- Default: `http://localhost:3001`

## Functions

### `registerMerchant(data)`

Register a new merchant and automatically create a merchant_owner user.

**Parameters:**
```typescript
{
  merchant_name: string;  // Business name
  owner_name: string;      // Owner's full name
  email: string;           // Email address
  password: string;        // Password (min 8 characters)
}
```

**Returns:**
```typescript
{
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      merchantId: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}
```

**Example:**
```typescript
import { registerMerchant } from '@/lib/authApi';

try {
  const result = await registerMerchant({
    merchant_name: "Acme Corporation",
    owner_name: "John Doe",
    email: "john@acme.com",
    password: "securepassword123"
  });

  // Tokens are automatically stored in localStorage
  console.log('User registered:', result.data.user);
  console.log('Access token:', result.data.data.accessToken);
  
  // Redirect to dashboard
  router.push('/merchant/dashboard');
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

### `loginMerchant(data)`

Login a merchant user.

**Parameters:**
```typescript
{
  email: string;     // User email
  password: string;  // User password
}
```

**Returns:**
```typescript
{
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      merchantId: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}
```

**Example:**
```typescript
import { loginMerchant } from '@/lib/authApi';

try {
  const result = await loginMerchant({
    email: "john@acme.com",
    password: "securepassword123"
  });

  // Tokens are automatically stored in localStorage
  console.log('User logged in:', result.data.user);
  
  // Redirect to dashboard
  router.push('/merchant/dashboard');
} catch (error) {
  console.error('Login failed:', error.message);
  // Show error message to user
}
```

### `getCurrentUser()`

Get the current authenticated user's information.

**Returns:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    name: string;           // Full name (first + last)
    email: string;
    role: string;
    merchantId: string;
    merchantName: string;   // Business name
  };
}
```

**Example:**
```typescript
import { getCurrentUser } from '@/lib/authApi';

try {
  const user = await getCurrentUser();
  
  console.log('User name:', user.data.name);
  console.log('Merchant:', user.data.merchantName);
  console.log('Role:', user.data.role);
  
  // Use in your component
  setUser(user.data);
} catch (error) {
  // User not authenticated or token expired
  console.error('Failed to get user:', error.message);
  // Redirect to login
  router.push('/login');
}
```

### `logout(redirectToLogin?)`

Logout current user and clear tokens.

**Parameters:**
- `redirectToLogin` (optional): Whether to redirect to login page (default: `true`)

**Example:**
```typescript
import { logout } from '@/lib/authApi';

// Logout and redirect to login
logout();

// Logout without redirect
logout(false);
```

## Helper Functions

### `isAuthenticated()`

Check if user is authenticated (has access token).

```typescript
import { isAuthenticated } from '@/lib/authApi';

if (isAuthenticated()) {
  // User is logged in
} else {
  // User is not logged in
}
```

### `getAccessToken()`

Get access token from localStorage.

```typescript
import { getAccessToken } from '@/lib/authApi';

const token = getAccessToken();
if (token) {
  // Use token
}
```

### `getRefreshToken()`

Get refresh token from localStorage.

```typescript
import { getRefreshToken } from '@/lib/authApi';

const refreshToken = getRefreshToken();
```

## Automatic Features

### Token Management

- **Automatic Storage**: Tokens are automatically stored in localStorage after login/register
- **Automatic Attachment**: Access token is automatically attached to all requests via Authorization header
- **Automatic Cleanup**: Tokens are automatically cleared on 401 errors

### 401 Error Handling

When a 401 Unauthorized response is received:
1. Tokens are automatically cleared from localStorage
2. User is automatically redirected to `/login` (if not already there)
3. Error is thrown for your code to handle

## Usage in React Components

### Login Page

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginMerchant } from '@/lib/authApi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginMerchant({ email, password });
      router.push('/merchant/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Sign Up Page

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerMerchant } from '@/lib/authApi';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    merchant_name: '',
    owner_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerMerchant(formData);
      router.push('/merchant/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Protected Route / Dashboard

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/authApi';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData.data);
    } catch (error) {
      // Not authenticated - redirect handled by interceptor
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Merchant: {user.merchantName}</p>
      <p>Role: {user.role}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## Error Handling

All functions throw errors that you can catch:

```typescript
try {
  await loginMerchant({ email, password });
} catch (error: any) {
  // Handle error
  if (error.message.includes('Invalid credentials')) {
    // Show specific error message
  } else {
    // Show generic error
  }
}
```

## Integration with AuthContext

You can integrate with your existing AuthContext:

```typescript
import { registerMerchant, loginMerchant, getCurrentUser, logout as authLogout } from '@/lib/authApi';

// In your AuthContext
const login = async (email: string, password: string) => {
  const result = await loginMerchant({ email, password });
  setUser(result.data.user);
};

const checkAuth = async () => {
  try {
    const userData = await getCurrentUser();
    setUser({
      id: userData.data.id,
      email: userData.data.email,
      // ... map other fields
    });
  } catch (error) {
    setUser(null);
  }
};
```

## TypeScript Types

All functions are fully typed. Import types if needed:

```typescript
import type { 
  RegisterMerchantData, 
  LoginMerchantData, 
  AuthResponse, 
  UserResponse 
} from '@/lib/authApi';
```

## Testing

```typescript
// Mock localStorage for testing
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = mockLocalStorage as any;

// Test registration
const result = await registerMerchant({
  merchant_name: "Test Corp",
  owner_name: "Test User",
  email: "test@example.com",
  password: "password123"
});

expect(result.success).toBe(true);
expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', expect.any(String));
```

