'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerMerchant, getMerchantMe } from '@/lib/authApi';

interface DebugInfo {
  apiBaseUrl: string;
  endpoint: string;
  status: number | null;
  responseBody: string;
}

export default function SignUpPage() {
  const [merchantName, setMerchantName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  const [accessTokenLength, setAccessTokenLength] = useState<number | null>(null);
  const router = useRouter();

  const isDevelopment = process.env.NODE_ENV === 'development';

  // Get API base URL
  const apiBaseUrl =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
    'http://localhost:4000';

  // Update accessToken length when it changes
  useEffect(() => {
    if (isDevelopment && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const updateTokenLength = () => {
        try {
          const token = localStorage.getItem('accessToken');
          setAccessTokenLength(token ? token.length : null);
        } catch (e) {
          setAccessTokenLength(null);
        }
      };

      updateTokenLength();
      // Check periodically
      const interval = setInterval(updateTokenLength, 500);
      return () => clearInterval(interval);
    }
  }, [isDevelopment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    const validationErrors: string[] = [];

    if (!merchantName.trim()) {
      validationErrors.push('Merchant name is required');
    }

    if (!ownerName.trim()) {
      validationErrors.push('Owner name is required');
    }

    if (!email.trim()) {
      validationErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push('Please enter a valid email address');
    }

    if (!password) {
      validationErrors.push('Password is required');
    } else if (password.length < 8) {
      validationErrors.push('Password must be at least 8 characters');
    }

    if (password !== confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    // Show validation errors
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setLoading(true);

    try {
      // 1. Call registerMerchant() - stores accessToken automatically
      try {
        const registerResponse = await registerMerchant({
          merchant_name: merchantName.trim(),
          owner_name: ownerName.trim(),
          email: email.trim(),
          password: password,
        });
        if (isDevelopment) {
          setDebugInfo((prev) => [
            ...prev,
            {
              apiBaseUrl,
              endpoint: '/api/auth/merchant/register',
              status: 201,
              responseBody: JSON.stringify(registerResponse, null, 2),
            },
          ]);
        }
      } catch (registerErr: any) {
        if (isDevelopment) {
          setDebugInfo((prev) => [
            ...prev,
            {
              apiBaseUrl,
              endpoint: '/api/auth/merchant/register',
              status: registerErr.response?.status || null,
              responseBody: JSON.stringify(registerErr.response?.data || { error: registerErr.message }, null, 2),
            },
          ]);
        }
        throw registerErr;
      }

      // 2. accessToken is already stored by registerMerchant()
      
      // 3. Call getMerchantMe() to fetch user data
      try {
        const meResponse = await getMerchantMe();
        if (isDevelopment) {
          setDebugInfo((prev) => [
            ...prev,
            {
              apiBaseUrl,
              endpoint: '/api/merchant/me',
              status: 200,
              responseBody: JSON.stringify(meResponse, null, 2),
            },
          ]);
        }
      } catch (meErr: any) {
        if (isDevelopment) {
          setDebugInfo((prev) => [
            ...prev,
            {
              apiBaseUrl,
              endpoint: '/api/merchant/me',
              status: meErr.response?.status || null,
              responseBody: JSON.stringify(meErr.response?.data || { error: meErr.message }, null, 2),
            },
          ]);
        }
        throw meErr;
      }

      // 4. Redirect to onboarding or dashboard
      router.push('/onboarding');
    } catch (err: any) {
      // Show API error messages - do not hide them
      const errorMessage =
        err.message ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-xl">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up for Merchant App
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Merchant Name */}
          <div>
            <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700">
              Merchant Name <span className="text-red-500">*</span>
            </label>
            <input
              id="merchantName"
              type="text"
              required
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Enter your business name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Your business or company name</p>
          </div>

          {/* Owner Name */}
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              id="ownerName"
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Enter owner's full name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Full name of the business owner</p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              placeholder="Enter your password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              placeholder="Confirm your password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </form>

        {/* Debug Panel - Development Only */}
        {isDevelopment && (
          <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg text-xs">
            <h3 className="font-bold mb-2 text-gray-800">Debug Panel (Development Only)</h3>
            <div className="space-y-2 mb-4">
              <div>
                <span className="font-semibold">API Base URL:</span>{' '}
                <span className="text-blue-600">{apiBaseUrl}</span>
              </div>
              <div>
                <span className="font-semibold">Access Token Length:</span>{' '}
                <span className="text-blue-600">{accessTokenLength ?? 'null'}</span>
              </div>
            </div>
            {debugInfo.length > 0 && (
              <div className="space-y-4">
                <div className="font-semibold text-gray-800">API Calls:</div>
                {debugInfo.map((info, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-gray-200">
                    <div className="mb-1">
                      <span className="font-semibold">Endpoint:</span>{' '}
                      <span className="text-blue-600">{info.endpoint}</span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={info.status === 200 || info.status === 201 ? 'text-green-600' : 'text-red-600'}>
                        {info.status ?? 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Response Body:</span>
                      <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                        {info.responseBody}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
