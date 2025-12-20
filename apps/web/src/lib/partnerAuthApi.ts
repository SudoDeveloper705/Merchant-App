import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

/**
 * Partner Authentication API Client
 * 
 * Provides partner authentication functions with automatic token management
 */

// Get base URL from environment variable
const API_BASE_URL = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000';

/**
 * Create axios instance for partner authentication
 */
const partnerAuthClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - automatically attach access token from localStorage
 */
partnerAuthClient.interceptors.request.use(
  (config) => {
    // CRITICAL: Skip token injection during SSR
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return config;
    }

    try {
      const token = localStorage.getItem('partnerAccessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
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
 */
partnerAuthClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('partnerAccessToken');
          localStorage.removeItem('partnerRefreshToken');
          
          if (window.location && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
        } catch (e) {
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
export interface RegisterPartnerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  partnerId: string;
  role?: string;
}

export interface LoginPartnerData {
  email: string;
  password: string;
  partnerId?: string;
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
}

/**
 * Register a new partner user
 */
export async function registerPartner(data: RegisterPartnerData): Promise<PartnerAuthResponse> {
  try {
    const response: AxiosResponse<PartnerAuthResponse> = await partnerAuthClient.post(
      '/api/auth/register/partner',
      data
    );

    // Store tokens in localStorage (only in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && response.data) {
      try {
        localStorage.setItem('partnerAccessToken', response.data.accessToken);
        localStorage.setItem('partnerRefreshToken', response.data.refreshToken);
      } catch (e) {
        console.warn('Failed to store tokens in localStorage:', e);
      }
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Registration failed');
  }
}

/**
 * Login a partner user
 */
export async function loginPartner(data: LoginPartnerData): Promise<PartnerAuthResponse> {
  try {
    const response: AxiosResponse<PartnerAuthResponse> = await partnerAuthClient.post(
      '/api/auth/login/partner',
      data
    );

    // Store tokens in localStorage (only in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && response.data) {
      try {
        localStorage.setItem('partnerAccessToken', response.data.accessToken);
        localStorage.setItem('partnerRefreshToken', response.data.refreshToken);
      } catch (e) {
        console.warn('Failed to store tokens in localStorage:', e);
      }
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Login failed');
  }
}

export { partnerAuthClient };

