'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  registerPartner,
  loginPartner,
  getPartnerMe,
  logout as authLogout,
  isAuthenticated,
  type RegisterPartnerData,
  type LoginPartnerData,
} from '@/lib/authApi';
import { validateDummyCredentials, getDummyPartnerUserByEmail } from '@/lib/dummyAuth';

/**
 * Partner User interface matching the /partner/me endpoint response
 */
export interface PartnerUser {
  id: string;
  name: string;
  email: string;
  role: string;
  partnerId: string;
  partnerName: string;
}

/**
 * PartnerAuthContext type definition
 */
interface PartnerAuthContextType {
  user: PartnerUser | null;
  loading: boolean;
  login: (data: LoginPartnerData) => Promise<void>;
  signup: (data: RegisterPartnerData, redirectPath?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const PartnerAuthContext = createContext<PartnerAuthContextType | undefined>(undefined);

/**
 * PartnerAuthProvider Component
 * 
 * Responsibilities:
 * - Store authenticated partner user
 * - Store loading state
 * - Handle partner login
 * - Handle partner signup
 * - Handle logout
 * - Fetch /partner/me on app load
 * - Persist access token in localStorage
 */
export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PartnerUser | null>(null);
  const [loading, setLoading] = useState(true); // Start as true to wait for initial auth check

  /**
   * Check authentication status on app load
   * Fetches /partner/me to verify token and get user data
   */
  useEffect(() => {
    // Only run in browser - this is a client component but be extra safe
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Auth check - set loading to true initially
    const checkAuth = async () => {
      try {
        // Double-check we're in browser
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          setLoading(false);
          return;
        }

        // If no token, we're done
        if (!isAuthenticated()) {
          setLoading(false);
          return;
        }

        // Check if this is a dummy token (for testing without backend)
        const token = localStorage.getItem('accessToken');
        if (token && (token.startsWith('dummy-partner-token-') || token.startsWith('dummy-token-'))) {
          // Extract role from token
          let role: 'partner_owner' | 'partner_staff' | null = null;
          if (token.startsWith('dummy-partner-token-')) {
            role = token.replace('dummy-partner-token-', '') as 'partner_owner' | 'partner_staff';
          } else if (token.startsWith('dummy-token-')) {
            // This might be set by AuthContext, check dummyPartnerUser
            const storedUser = localStorage.getItem('dummyPartnerUser');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser) as PartnerUser;
                setUser(userData);
                setLoading(false);
                return;
              } catch (e) {
                // If parsing fails, continue to recreate
              }
            }
            // If no stored user, this is not a partner token
            setLoading(false);
            return;
          }
          
          if (!role) {
            setLoading(false);
            return;
          }
          
          // Try to get user from localStorage first
          const storedUser = localStorage.getItem('dummyPartnerUser');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser) as PartnerUser;
              setUser(userData);
              setLoading(false);
              return;
            } catch (e) {
              // If parsing fails, recreate from role
            }
          }

          // Recreate user from role (fallback)
          const dummyUsers = {
            partner_owner: getDummyPartnerUserByEmail('owner@partner.com'),
            partner_staff: getDummyPartnerUserByEmail('staff@partner.com'),
          };

          const dummyUser = dummyUsers[role];
          if (dummyUser) {
            const userData: PartnerUser = {
              id: `partner-user-${dummyUser.role}`,
              name: dummyUser.name,
              email: dummyUser.email,
              role: dummyUser.role,
              partnerId: dummyUser.partnerId!,
              partnerName: dummyUser.partnerName!,
            };
            // Store in localStorage for next time
            localStorage.setItem('dummyPartnerUser', JSON.stringify(userData));
            setUser(userData);
            setLoading(false);
            return;
          }
        }

        // Try to get user from API (real authentication)
        try {
          const response = await getPartnerMe();
          if (response && response.success && response.data) {
            // Map response to PartnerUser interface
            const userData: PartnerUser = {
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              role: response.data.role,
              partnerId: response.data.partnerId || '',
              partnerName: response.data.partnerName || '',
            };
            setUser(userData);
          }
        } catch (err) {
          // Auth failed - clear any invalid tokens (but not dummy tokens)
          const token = localStorage.getItem('accessToken');
          if (token && !token.startsWith('dummy-partner-token-')) {
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
        }
      } catch (error) {
        // Ignore all errors - don't break the app
        console.warn('Auth initialization error:', error);
      } finally {
        // Always set loading to false when done
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login partner user
   * 
   * @param data - Login data (email, password)
   * @throws Error if login fails
   */
  const login = async (data: LoginPartnerData): Promise<void> => {
    try {
      setLoading(true);

      // Check for dummy credentials first (for testing without backend)
      const dummyUser = validateDummyCredentials(data.email, data.password);
      if (dummyUser && dummyUser.userType === 'partner') {
        // Create mock user session
        const userData: PartnerUser = {
          id: `partner-user-${dummyUser.role}`,
          name: dummyUser.name,
          email: dummyUser.email,
          role: dummyUser.role,
          partnerId: dummyUser.partnerId!,
          partnerName: dummyUser.partnerName!,
        };

        // Store mock tokens and user data in localStorage
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('accessToken', `dummy-partner-token-${dummyUser.role}`);
          localStorage.setItem('refreshToken', `dummy-partner-refresh-${dummyUser.role}`);
          localStorage.setItem('dummyPartnerUser', JSON.stringify(userData));
        }

        setUser(userData);
        setLoading(false);

        // Redirect to dashboard (use window.location to avoid SSR issues)
        if (typeof window !== 'undefined') {
          window.location.href = '/partner/dashboard';
        }
        return;
      }

      // Call login API (tokens are automatically stored by authApi)
      const response = await loginPartner(data);

      if (response && response.user) {
        // Map response to PartnerUser interface
        const userData: PartnerUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          partnerId: response.user.partnerId || '',
          partnerName: response.partner?.name || '',
        };

        setUser(userData);

        // Fetch full user data including partner name
        await refreshUser();

        // Redirect to dashboard (use window.location to avoid SSR issues)
        if (typeof window !== 'undefined') {
          window.location.href = '/partner/dashboard';
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
   * Signup (register) new partner
   * 
   * @param data - Registration data (partner_name, owner_name, email, password, country?)
   * @param redirectPath - Optional redirect path (default: /partner/dashboard)
   * @throws Error if registration fails
   */
  const signup = async (data: RegisterPartnerData, redirectPath?: string): Promise<void> => {
    try {
      setLoading(true);

      // Call register API (tokens are automatically stored by authApi)
      const response = await registerPartner(data);

      if (response && response.user) {
        // Map response to PartnerUser interface
        const userData: PartnerUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          partnerId: response.user.partnerId || '',
          partnerName: response.partner?.name || '',
        };

        setUser(userData);

        // Fetch full user data including partner name
        await refreshUser();

        // Redirect to specified path or default dashboard (use window.location to avoid SSR issues)
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath || '/partner/dashboard';
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
        localStorage.removeItem('dummyPartnerUser');
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
   * Refresh user data from /partner/me endpoint
   * Useful for updating user info after profile changes
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await getPartnerMe();
      
      if (response && response.success && response.data) {
        // Map response to PartnerUser interface
        const userData: PartnerUser = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          partnerId: response.data.partnerId || '',
          partnerName: response.data.partnerName || '',
        };
        setUser(userData);
      }
    } catch (error) {
      console.warn('Failed to refresh user:', error);
      // Don't throw - allow component to handle gracefully
    }
  };

  const value: PartnerAuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>;
}

/**
 * Hook to use PartnerAuthContext
 * @throws Error if used outside PartnerAuthProvider
 */
export function usePartnerAuth(): PartnerAuthContextType {
  const context = useContext(PartnerAuthContext);
  if (context === undefined) {
    throw new Error('usePartnerAuth must be used within a PartnerAuthProvider');
  }
  return context;
}

