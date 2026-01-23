'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  registerMerchant,
  loginMerchant,
  getMerchantMe,
  logout as authLogout,
  isAuthenticated,
  type RegisterMerchantData,
  type LoginMerchantData,
} from '@/lib/authApi';
import { validateDummyCredentials, getDummyUserByEmail } from '@/lib/dummyAuth';

/**
 * User interface matching the /merchant/me endpoint response
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  merchantId: string;
  merchantName: string;
}

/**
 * AuthContext type definition
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginMerchantData) => Promise<void>;
  signup: (data: RegisterMerchantData, redirectPath?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Responsibilities:
 * - Store authenticated user
 * - Store loading state
 * - Handle login
 * - Handle signup
 * - Handle logout
 * - Fetch /merchant/me on app load
 * - Persist access token in localStorage
 * - Redirect to login if unauthenticated
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true to wait for initial auth check

  /**
   * Check authentication status on app load
   * Fetches /merchant/me to verify token and get user data
   */
  useEffect(() => {
    // Only run in browser - this is a client component but be extra safe
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Immediate fallback - ensure loading resolves within 3 seconds no matter what
    const absoluteTimeout = setTimeout(() => {
      console.warn('Absolute timeout - forcing loading to false');
      setLoading(false);
    }, 3000);

    // Check for token synchronously first - if no token, resolve immediately
    let token: string | null = null;
    try {
      token = localStorage.getItem('accessToken');
      // Handle empty strings or whitespace-only tokens as "no token"
      if (token && token.trim()) {
        token = token.trim();
      } else {
        token = null;
      }
    } catch (e) {
      // localStorage might be unavailable (private browsing, etc.)
      console.warn('localStorage unavailable:', e);
      token = null;
    }

    // If no token, we're done immediately - no need for async operations
    if (!token) {
      clearTimeout(absoluteTimeout);
      setLoading(false);
      return;
    }

    // Add a safety timeout - if auth check takes too long, stop loading anyway
    let safetyTimeout: NodeJS.Timeout | null = setTimeout(() => {
      console.warn('Auth check timeout - stopping loading state');
      setLoading(false);
      safetyTimeout = null;
    }, 2000); // 2 second safety timeout (reduced for faster loading)

    // Auth check - we have a token, so process it
    const checkAuth = async () => {
      let timeoutCleared = false;
      const clearSafetyTimeout = () => {
        if (!timeoutCleared && safetyTimeout) {
          clearTimeout(safetyTimeout);
          safetyTimeout = null;
          timeoutCleared = true;
        }
      };

      try {
          // Double-check we're in browser (redundant but safe)
          if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            clearSafetyTimeout();
            setLoading(false);
            return;
          }

          // Check if this is a dummy token (for testing without backend)
          if (token.startsWith('dummy-token-')) {
            // Extract role from token
            const role = token.replace('dummy-token-', '') as 'merchant_owner' | 'merchant_manager' | 'merchant_accountant';
            
            // Try to get user from localStorage first
            const storedUser = localStorage.getItem('dummyUser');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser) as User;
                setUser(userData);
                clearSafetyTimeout();
                setLoading(false);
                return;
              } catch (e) {
                // If parsing fails, recreate from role
              }
            }

            // Recreate user from role (fallback)
            const dummyUsers = {
              merchant_owner: getDummyUserByEmail('owner@merchant.com'),
              merchant_manager: getDummyUserByEmail('manager@merchant.com'),
              merchant_accountant: getDummyUserByEmail('accountant@merchant.com'),
            };

            const dummyUser = dummyUsers[role];
            if (dummyUser) {
              const userData: User = {
                id: `user-${dummyUser.role}`,
                name: dummyUser.name,
                email: dummyUser.email,
                role: dummyUser.role,
                merchantId: dummyUser.merchantId || '',
                merchantName: dummyUser.merchantName || '',
              };
              // Store in localStorage for next time
              localStorage.setItem('dummyUser', JSON.stringify(userData));
              setUser(userData);
              clearSafetyTimeout();
              setLoading(false);
              return;
            }
            
            // If dummy token role doesn't match, treat as no auth
            clearSafetyTimeout();
            setLoading(false);
            return;
          }

          // Check for partner dummy tokens - redirect to partner dashboard
          if (token.startsWith('dummy-partner-token-')) {
            // This is a partner token - don't handle here, let PartnerAuthContext handle it
            // But still set loading to false so the app can render
            clearSafetyTimeout();
            setLoading(false);
            return;
          }

          // Try to get user from API (real authentication)
          // Only call API if we have a real token (not dummy tokens)
          if (token && !token.startsWith('dummy-token-') && !token.startsWith('dummy-partner-token-')) {
            // Only make API call if we have a real token
            // Use Promise.race to enforce a maximum wait time
            try {
              const apiPromise = getMerchantMe();
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('API timeout')), 2000)
              );
              
              const response = await Promise.race([apiPromise, timeoutPromise]) as Awaited<ReturnType<typeof getMerchantMe>>;
              
              if (response && response.user && response.merchant) {
                // Map response to User interface
                const userData: User = {
                  id: response.user.id,
                  name: response.user.name,
                  email: response.user.email,
                  role: response.user.role,
                  merchantId: response.user.merchantId,
                  merchantName: response.merchant.name,
                };
                setUser(userData);
              }
            } catch (err: any) {
              // Auth failed or timeout - handle gracefully
              // Only log if it's not a network/timeout error (which is expected if API is down)
              const isNetworkError = err?.code === 'ECONNREFUSED' || 
                                    err?.code === 'ECONNABORTED' ||
                                    err?.code === 'ETIMEDOUT' ||
                                    err?.message?.includes('timeout') || 
                                    err?.message?.includes('Network Error') ||
                                    err?.message?.includes('Failed to fetch') ||
                                    err?.message?.includes('ERR_NETWORK') ||
                                    err?.message === 'API timeout';
              
              if (!isNetworkError && err?.response?.status !== 401) {
                // Real auth error (not network/timeout and not 401) - clear invalid tokens
                console.warn('Auth check failed:', err);
                if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
                  try {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                  } catch (e) {
                    // Ignore
                  }
                }
              }
              // For network errors, timeouts, or 401s, don't set user but keep token
              // This allows the app to continue if API is temporarily unavailable
              // User will be redirected to login by the page component
            }
          }
      } catch (error) {
        // Ignore all errors - don't break the app
        console.warn('Auth initialization error:', error);
      } finally {
        // Always clear safety timeout and set loading to false when done
        if (safetyTimeout) {
          clearTimeout(safetyTimeout);
          safetyTimeout = null;
        }
        clearTimeout(absoluteTimeout);
        setLoading(false);
      }
    };

    // Run check immediately
    checkAuth();
    
    // Cleanup function - clear timeout if component unmounts
    return () => {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
      }
      clearTimeout(absoluteTimeout);
    };
  }, []);

  /**
   * Login merchant user
   * 
   * @param data - Login credentials (email, password)
   * @throws Error if login fails
   */
  const login = async (data: LoginMerchantData): Promise<void> => {
    try {
      setLoading(true);

      // Check for dummy credentials first (for testing without backend)
      const dummyUser = validateDummyCredentials(data.email, data.password);
      if (dummyUser) {
        // Handle partner users differently
        if (dummyUser.userType === 'partner') {
          // Partner users should use PartnerAuthContext, but for now redirect to partner dashboard
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const partnerUserData = {
              id: `partner-user-${dummyUser.role}`,
              name: dummyUser.name,
              email: dummyUser.email,
              role: dummyUser.role,
              partnerId: dummyUser.partnerId!,
              partnerName: dummyUser.partnerName!,
            };
            localStorage.setItem('accessToken', `dummy-partner-token-${dummyUser.role}`);
            localStorage.setItem('refreshToken', `dummy-partner-refresh-${dummyUser.role}`);
            localStorage.setItem('dummyPartnerUser', JSON.stringify(partnerUserData));
          }
          setLoading(false);
          if (typeof window !== 'undefined') {
            window.location.href = '/partner/dashboard';
          }
          return;
        }

        // Create mock merchant user session
        const userData: User = {
          id: `user-${dummyUser.role}`,
          name: dummyUser.name,
          email: dummyUser.email,
          role: dummyUser.role,
          merchantId: dummyUser.merchantId || '',
          merchantName: dummyUser.merchantName || '',
        };

        // Store mock tokens and user data in localStorage
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('accessToken', `dummy-token-${dummyUser.role}`);
          localStorage.setItem('refreshToken', `dummy-refresh-${dummyUser.role}`);
          localStorage.setItem('dummyUser', JSON.stringify(userData));
        }

        setUser(userData);
        setLoading(false);

        // Redirect to merchant dashboard
        if (typeof window !== 'undefined') {
          window.location.href = '/merchant/dashboard';
        }
        return;
      }

      // Call login API (tokens are automatically stored by authApi)
      const response = await loginMerchant(data);

      if (response && response.user) {
        // Map response to User interface
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          merchantId: response.user.merchantId,
          merchantName: response.merchant?.name || '', // Use merchant name from response
        };

        setUser(userData);

        // Fetch full user data including merchant name
        await refreshUser();

        // Redirect to dashboard (use window.location to avoid SSR issues)
        if (typeof window !== 'undefined') {
          window.location.href = '/merchant/dashboard';
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  /**
   * Signup (register) new merchant
   * 
   * @param data - Registration data (merchant_name, owner_name, email, password)
   * @param redirectPath - Optional redirect path (default: /merchant/dashboard)
   * @throws Error if registration fails
   */
  const signup = async (data: RegisterMerchantData, redirectPath?: string): Promise<void> => {
    try {
      setLoading(true);

      // Call register API (tokens are automatically stored by authApi)
      const response = await registerMerchant(data);

      if (response && response.user) {
        // Map response to User interface
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          merchantId: response.user.merchantId,
          merchantName: response.merchant?.name || '', // Use merchant name from response
        };

        setUser(userData);

        // Fetch full user data including merchant name
        await refreshUser();

        // Redirect to specified path or default dashboard (use window.location to avoid SSR issues)
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath || '/merchant/dashboard';
        }
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Registration failed');
    }
  };

  /**
   * Logout current user
   * Clears tokens and user state, redirects to login
   */
  const logout = () => {
    // Clear tokens and dummy user data
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('dummyUser');
      } catch (e) {
        // Ignore
      }
    }
    
    // Clear user state
    setUser(null);
    
    // Redirect to login (use window.location to avoid SSR issues)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  /**
   * Refresh user data from /merchant/me endpoint
   * Useful for updating user info after profile changes
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await getMerchantMe();
      
      if (response && response.user && response.merchant) {
        // Map response to User interface
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          merchantId: response.user.merchantId,
          merchantName: response.merchant.name,
        };
        setUser(userData);
      } else {
        // Invalid response - logout
        logout();
      }
    } catch (error: any) {
      // Token expired or invalid - logout
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * 
 * Provides access to authentication context
 * 
 * @example
 * ```typescript
 * const { user, loading, login, logout } = useAuth();
 * 
 * if (loading) return <Loading />;
 * if (!user) return <LoginForm />;
 * 
 * return <Dashboard user={user} />;
 * ```
 * 
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
