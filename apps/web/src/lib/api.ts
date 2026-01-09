import axios, { AxiosInstance, AxiosError } from 'axios';

// Get base URL from environment variable
// Safe to access at module scope - Next.js replaces these at build time
const API_BASE_URL = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000';

/**
 * Create axios instance with default config
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - add auth token
 * 
 * NOTE: Interceptors are registered at module load but only execute during requests.
 * All browser API access is guarded with typeof window checks.
 */
apiClient.interceptors.request.use(
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
 * Response interceptor - handle token refresh and errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors - token expired (only if we have a response, not network errors)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only attempt refresh in browser environment
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError: any) {
          // Refresh failed - only redirect if it's not a network error
          const isNetworkError = refreshError?.code === 'ECONNREFUSED' || 
                                refreshError?.message?.includes('Network Error') || 
                                refreshError?.message?.includes('Failed to fetch');
          
          if (!isNetworkError) {
            // Only clear tokens and redirect for actual auth errors, not network errors
            try {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              if (window.location) {
                window.location.href = '/login';
              }
            } catch (e) {
              console.warn('Failed to clear localStorage:', e);
            }
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API endpoints
 */
export const api = {
  // Auth
  auth: {
    loginMerchant: (data: { email: string; password: string; merchantId?: string }) =>
      apiClient.post('/api/auth/login/merchant', data),
    loginPartner: (data: { email: string; password: string; partnerId?: string }) =>
      apiClient.post('/api/auth/login/partner', data),
    registerMerchant: (data: any) =>
      apiClient.post('/api/auth/register/merchant', data),
    registerPartner: (data: any) =>
      apiClient.post('/api/auth/register/partner', data),
    getMe: () => apiClient.get('/api/auth/me'),
    refresh: (refreshToken: string) =>
      apiClient.post('/api/auth/refresh', { refreshToken }),
  },

  // Dashboard
  dashboard: {
    getMerchant: (params?: { period?: string; startDate?: string; endDate?: string }) =>
      apiClient.get('/api/dashboard/merchant', { params }),
    getPartner: (merchantId?: string, params?: { period?: string; startDate?: string; endDate?: string }) =>
      merchantId
        ? apiClient.get(`/api/dashboard/partner/${merchantId}`, { params })
        : apiClient.get('/api/dashboard/partner', { params }),
  },

  // Transactions
  transactions: {
    list: (params?: any) => apiClient.get('/api/transactions/merchant', { params }),
    get: (id: string) => apiClient.get(`/api/transactions/${id}`),
    create: (data: any) => apiClient.post('/api/transactions', data),
  },

  // Invoices
  invoices: {
    list: (params?: any) => apiClient.get('/api/invoices/merchant', { params }),
    get: (id: string) => apiClient.get(`/api/invoices/${id}`),
    create: (data: any) => apiClient.post('/api/invoices', data),
    update: (id: string, data: any) => apiClient.put(`/api/invoices/${id}`, data),
    send: (id: string) => apiClient.post(`/api/invoices/${id}/send`),
    markAsPaid: (id: string) => apiClient.post(`/api/invoices/${id}/mark-paid`),
    downloadPDF: (id: string) => apiClient.get(`/api/invoices/${id}/pdf`, { responseType: 'blob' }),
  },

  // Merchants
  merchants: {
    getMe: () => apiClient.get('/api/merchants/me'),
    get: (id: string) => apiClient.get(`/api/merchants/${id}`),
    update: (data: any) => apiClient.put('/api/merchants/me', data),
  },

  // Payouts
  payouts: {
    list: (params?: any) => apiClient.get('/api/payouts/merchant', { params }),
    listPartner: (params?: any) => apiClient.get('/api/payouts/partner', { params }),
    create: (data: any) => apiClient.post('/api/payouts', data),
    update: (id: string, data: any) => apiClient.put(`/api/payouts/${id}`, data),
    getOutstandingBalance: (params?: any) =>
      apiClient.get('/api/payouts/outstanding-balance', { params }),
    getOutstandingBalancePartner: (params?: any) =>
      apiClient.get('/api/payouts/outstanding-balance/partner', { params }),
  },

  // Reports
  reports: {
    getSettlement: (params: any) => apiClient.get('/api/reports/settlement', { params }),
    exportTransactions: (params: any) =>
      apiClient.get('/api/reports/transactions/export', { params, responseType: 'blob' }),
    exportPayouts: (params: any) =>
      apiClient.get('/api/reports/payouts/export', { params, responseType: 'blob' }),
  },
};

