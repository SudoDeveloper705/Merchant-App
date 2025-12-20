'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginMerchant, getMerchantMe, loginPartner, getPartnerMe } from '@/lib/authApi';
import { useAuth } from '@/contexts/AuthContext';
import { validateDummyCredentials } from '@/lib/dummyAuth';

interface DebugInfo {
  apiBaseUrl: string;
  endpoint: string;
  status: number | null;
  responseBody: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'merchant' | 'partner'>('merchant');
  const [merchantId, setMerchantId] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  const [accessTokenLength, setAccessTokenLength] = useState<number | null>(null);
  const router = useRouter();
  const { login: authLogin } = useAuth();

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
    setLoading(true);

    try {
      // For merchant login
      if (userType === 'merchant') {
        // Use AuthContext login which handles both dummy and real credentials
        try {
          await authLogin({ email, password });
          // Login successful - redirect handled in AuthContext
          return;
        } catch (loginErr: any) {
          if (isDevelopment) {
            setDebugInfo((prev) => [
              ...prev,
              {
                apiBaseUrl,
                endpoint: '/api/auth/merchant/login',
                status: loginErr.response?.status || null,
                responseBody: JSON.stringify(loginErr.response?.data || { error: loginErr.message }, null, 2),
              },
            ]);
          }
          setError(loginErr.message || 'Login failed');
          setLoading(false);
          return;
        }
      } else {
        // Partner login
        // Check for dummy credentials first (for testing without backend)
        const dummyUser = validateDummyCredentials(email, password);
        
        if (dummyUser && dummyUser.userType === 'partner') {
          // Handle dummy partner login
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const userData = {
              id: `partner-user-${dummyUser.role}`,
              name: dummyUser.name,
              email: dummyUser.email,
              role: dummyUser.role,
              partnerId: dummyUser.partnerId!,
              partnerName: dummyUser.partnerName!,
            };
            localStorage.setItem('accessToken', `dummy-partner-token-${dummyUser.role}`);
            localStorage.setItem('refreshToken', `dummy-partner-refresh-${dummyUser.role}`);
            localStorage.setItem('dummyPartnerUser', JSON.stringify(userData));
          }
          // Redirect to dashboard (use window.location to avoid SSR issues)
          if (typeof window !== 'undefined') {
            window.location.href = '/partner/dashboard';
          }
          return;
        }

        // Real partner login
        // 1. Call loginPartner(email, password) - stores accessToken automatically
        try {
          const loginResponse = await loginPartner({ email, password });
          if (isDevelopment) {
            setDebugInfo((prev) => [
              ...prev,
              {
                apiBaseUrl,
                endpoint: '/api/auth/partner/login',
                status: 200,
                responseBody: JSON.stringify(loginResponse, null, 2),
              },
            ]);
          }
        } catch (loginErr: any) {
          if (isDevelopment) {
            setDebugInfo((prev) => [
              ...prev,
              {
                apiBaseUrl,
                endpoint: '/api/auth/partner/login',
                status: loginErr.response?.status || null,
                responseBody: JSON.stringify(loginErr.response?.data || { error: loginErr.message }, null, 2),
              },
            ]);
          }
          throw loginErr;
        }

        // 2. accessToken is already stored by loginPartner()

        // 3. Call getPartnerMe() to fetch user data
        try {
          const meResponse = await getPartnerMe();
          if (isDevelopment) {
            setDebugInfo((prev) => [
              ...prev,
              {
                apiBaseUrl,
                endpoint: '/api/partner/me',
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
                endpoint: '/api/partner/me',
                status: meErr.response?.status || null,
                responseBody: JSON.stringify(meErr.response?.data || { error: meErr.message }, null, 2),
              },
            ]);
          }
          throw meErr;
        }

        // 4. Redirect to /partner/dashboard
        router.push('/partner/dashboard');
      }
    } catch (err: any) {
      // Display backend error message on invalid credentials
      const errorMessage = 
        err.message || 
        err.response?.data?.error || 
        err.response?.data?.message ||
        'Login failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">Merchant App</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to your account</p>
        </div>

        {/* Dummy Credentials Info */}
        {userType === 'merchant' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Test Credentials (Merchant)</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Owner:</strong> owner@merchant.com / owner123</p>
              <p><strong>Manager:</strong> manager@merchant.com / manager123</p>
              <p><strong>Accountant:</strong> accountant@merchant.com / accountant123</p>
            </div>
          </div>
        )}

        {userType === 'partner' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-green-900 mb-2">Test Credentials (Partner)</h3>
            <div className="text-xs text-green-800 space-y-1">
              <p><strong>Owner:</strong> owner@partner.com / owner123</p>
              <p><strong>Staff:</strong> staff@partner.com / staff123</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUserType('merchant')}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  userType === 'merchant'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Merchant
              </button>
              <button
                type="button"
                onClick={() => setUserType('partner')}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  userType === 'partner'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Partner
              </button>
            </div>
          </div>

          {/* Merchant/Partner ID (optional) */}
          {userType === 'merchant' ? (
            <div>
              <label htmlFor="merchantId" className="block text-sm font-medium text-gray-700">
                Merchant ID (optional)
              </label>
              <input
                id="merchantId"
                type="text"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700">
                Partner ID (optional)
              </label>
              <input
                id="partnerId"
                type="text"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
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
                      <span className={info.status === 200 ? 'text-green-600' : 'text-red-600'}>
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

