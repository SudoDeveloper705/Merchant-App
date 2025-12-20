import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

/**
 * Authentication API Client
 * 
 * Provides authentication functions with automatic token management
 * and 401 error handling.
 * 
 * All functions are SSR-safe and only access browser APIs when available.
 */

// Get base URL from environment variable
// NEXT_PUBLIC_API_BASE is the primary variable, fallback to NEXT_PUBLIC_API_URL
const API_BASE_URL = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000';

/**
 * Create axios instance for authentication
 * Safe to create at module scope - axios instances are just configuration objects
 */
const authClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - automatically attach access token from localStorage
 * 
 * NOTE: Interceptors are registered at module load but only execute during requests.
 * All browser API access is guarded with typeof window checks.
 */
authClient.interceptors.request.use(
  (config) => {
    // CRITICAL: Skip token injection during SSR
    // Interceptors can run during SSR if module is imported, so we must check first
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return config; // Return config unchanged during SSR
    }

    // Only access localStorage in browser environment
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Silently fail if localStorage is unavailable
      console.warn('Failed to access localStorage:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle 401 responses
 * 
 * NOTE: Interceptors only execute during requests, not at module load.
 * All browser API access is guarded with typeof window checks.
 */
authClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Clear tokens from localStorage (only in browser)
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Redirect to login page if not already there
          if (window.location && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
        } catch (e) {
          // Silently fail if localStorage is unavailable
          console.warn('Failed to clear localStorage:', e);
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Types
 */
export interface RegisterMerchantData {
  merchant_name: string;
  owner_name: string;
  email: string;
  password: string;
}

export interface LoginMerchantData {
  email: string;
  password: string;
}

export interface RegisterPartnerData {
  partner_name: string;
  owner_name: string;
  email: string;
  password: string;
  country?: string;
}

export interface LoginPartnerData {
  email: string;
  password: string;
}

export interface MerchantAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    merchantId: string;
  };
  merchant: {
    id: string;
    name: string;
  };
}

export interface PartnerAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    partnerId: string;
  };
  partner: {
    id: string;
    name: string;
  };
}

export interface MerchantMeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    merchantId: string;
  };
  merchant: {
    id: string;
    name: string;
    state: string | null;
    zip: string | null;
  };
}

export interface PartnerMeResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    partnerId: string;
    partnerName: string;
  };
}

/**
 * Register a new merchant and create merchant_owner user
 * 
 * @param data - Registration data (merchant_name, owner_name, email, password)
 * @returns Promise with user data and tokens
 * 
 * @example
 * ```typescript
 * const result = await registerMerchant({
 *   merchant_name: "Acme Corporation",
 *   owner_name: "John Doe",
 *   email: "john@acme.com",
 *   password: "securepassword123"
 * });
 * 
 * // Tokens are automatically stored in localStorage
 * // result.accessToken and result.refreshToken
 * ```
 */
export async function registerMerchant(data: RegisterMerchantData): Promise<MerchantAuthResponse> {
  try {
    const response: AxiosResponse<MerchantAuthResponse> = await authClient.post(
      '/api/auth/merchant/register',
      data
    );

    // Store tokens in localStorage (only in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && response.data) {
      try {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      } catch (e) {
        console.warn('Failed to store tokens in localStorage:', e);
      }
    }

    return response.data;
  } catch (error: any) {
    // Re-throw with more descriptive error message
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Registration failed');
  }
}

/**
 * Login a merchant user
 * 
 * @param data - Login credentials (email, password)
 * @returns Promise with user data and tokens
 * 
 * @example
 * ```typescript
 * const result = await loginMerchant({
 *   email: "john@acme.com",
 *   password: "securepassword123"
 * });
 * 
 * // Tokens are automatically stored in localStorage
 * // result.user contains user data
 * ```
 */
export async function loginMerchant(data: LoginMerchantData): Promise<MerchantAuthResponse> {
  try {
    const response: AxiosResponse<MerchantAuthResponse> = await authClient.post(
      '/api/auth/merchant/login',
      data
    );

    // Store tokens in localStorage (only in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && response.data) {
      try {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      } catch (e) {
        console.warn('Failed to store tokens in localStorage:', e);
      }
    }

    return response.data;
  } catch (error: any) {
    // Re-throw with more descriptive error message
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Login failed');
  }
}

/**
 * Register a new partner and create partner_owner user
 * 
 * @param data - Registration data (partner_name, owner_name, email, password, country?)
 * @returns Promise with user data and tokens
 * 
 * @example
 * ```typescript
 * const result = await registerPartner({
 *   partner_name: "Acme Partner",
 *   owner_name: "Jane Doe",
 *   email: "jane@acme.com",
 *   password: "securepassword123",
 *   country: "US"
 * });
 * 
 * // Tokens are automatically stored in localStorage
 * // result.accessToken and result.refreshToken
 * ```
 */
export async function registerPartner(data: RegisterPartnerData): Promise<PartnerAuthResponse> {
  try {
    const response: AxiosResponse<PartnerAuthResponse> = await authClient.post(
      '/api/auth/partner/register',
      data
    );

    // Store tokens in localStorage (only in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && response.data) {
      try {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      } catch (e) {
        console.warn('Failed to store tokens in localStorage:', e);
      }
    }

    return response.data;
  } catch (error: any) {
    // Re-throw with more descriptive error message
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Registration failed');
  }
}

/**
 * Login a partner user
 * 
 * @param data - Login credentials (email, password)
 * @returns Promise with user data and tokens
 * 
 * @example
 * ```typescript
 * const result = await loginPartner({
 *   email: "jane@acme.com",
 *   password: "securepassword123"
 * });
 * 
 * // Tokens are automatically stored in localStorage
 * // result.user contains user data
 * ```
 */
export async function loginPartner(data: LoginPartnerData): Promise<PartnerAuthResponse> {
  try {
    const response: AxiosResponse<PartnerAuthResponse> = await authClient.post(
      '/api/auth/partner/login',
      data
    );

    // Store tokens in localStorage (only in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && response.data) {
      try {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      } catch (e) {
        console.warn('Failed to store tokens in localStorage:', e);
      }
    }

    return response.data;
  } catch (error: any) {
    // Re-throw with more descriptive error message
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Login failed');
  }
}

/**
 * Get current authenticated merchant user
 * 
 * Automatically attaches access token from localStorage.
 * Returns user information including merchant details.
 * 
 * @returns Promise with current merchant user data
 * 
 * @example
 * ```typescript
 * const result = await getMerchantMe();
 * console.log(result.user.name); // "John Doe"
 * console.log(result.merchant.name); // "Acme Corporation"
 * ```
 * 
 * @throws Error if user is not authenticated (401)
 */
export async function getMerchantMe(): Promise<MerchantMeResponse> {
  try {
    const response: AxiosResponse<MerchantMeResponse> = await authClient.get(
      '/api/merchant/me'
    );

    return response.data;
  } catch (error: any) {
    // Handle 401 - token expired or invalid
    if (error.response?.status === 401) {
      // Tokens are already cleared by interceptor
      throw new Error('Authentication required. Please login again.');
    }

    // Re-throw with more descriptive error message
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Failed to fetch user');
  }
}

/**
 * Get current authenticated partner user
 * 
 * Automatically attaches access token from localStorage.
 * Returns user information including partner details.
 * 
 * @returns Promise with current partner user data
 * 
 * @example
 * ```typescript
 * const result = await getPartnerMe();
 * console.log(result.data.name); // "Jane Doe"
 * console.log(result.data.partnerName); // "Acme Partner"
 * ```
 * 
 * @throws Error if user is not authenticated (401)
 */
export async function getPartnerMe(): Promise<PartnerMeResponse> {
  try {
    const response: AxiosResponse<PartnerMeResponse> = await authClient.get(
      '/api/partner/me'
    );

    return response.data;
  } catch (error: any) {
    // Handle 401 - token expired or invalid
    if (error.response?.status === 401) {
      // Tokens are already cleared by interceptor
      throw new Error('Authentication required. Please login again.');
    }

    // Re-throw with more descriptive error message
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Failed to fetch user');
  }
}

/**
 * Logout current user
 * 
 * Clears tokens from localStorage and optionally redirects to login.
 * 
 * @param redirectToLogin - Whether to redirect to login page (default: true)
 * 
 * @example
 * ```typescript
 * // Logout and redirect to login
 * logout();
 * 
 * // Logout without redirect
 * logout(false);
 * ```
 */
export function logout(redirectToLogin: boolean = true): void {
  // Clear tokens from localStorage (only in browser)
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Redirect to login if requested
      if (redirectToLogin && window.location && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  }
}

/**
 * Check if user is authenticated
 * 
 * @returns true if access token exists in localStorage
 */
export function isAuthenticated(): boolean {
  // Only check localStorage in browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }
  try {
    return !!localStorage.getItem('accessToken');
  } catch (e) {
    // Silently fail if localStorage is unavailable
    return false;
  }
}

/**
 * Get access token from localStorage
 * 
 * @returns Access token or null
 */
export function getAccessToken(): string | null {
  // Only access localStorage in browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem('accessToken');
  } catch (e) {
    return null;
  }
}

/**
 * Get refresh token from localStorage
 * 
 * @returns Refresh token or null
 */
export function getRefreshToken(): string | null {
  // Only access localStorage in browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem('refreshToken');
  } catch (e) {
    return null;
  }
}

// Export the axios instance for advanced usage if needed
export { authClient };
