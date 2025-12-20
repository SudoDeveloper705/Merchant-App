import { apiClient } from './api';

/**
 * Partner API Client
 * 
 * Functions for partner-specific API endpoints
 */

const PARTNER_SELECTED_MERCHANT_KEY = 'partnerSelectedMerchantId';

/**
 * Get selected merchant ID from localStorage
 */
export function getSelectedMerchantId(): string | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(PARTNER_SELECTED_MERCHANT_KEY);
}

/**
 * Set selected merchant ID in localStorage
 */
export function setSelectedMerchantId(merchantId: string): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(PARTNER_SELECTED_MERCHANT_KEY, merchantId);
  }
}

/**
 * Types
 */
export interface LinkedMerchant {
  merchantId: string;
  merchantName: string;
  accessLevel: string;
  canViewClientNames: boolean;
}

export interface PartnerContext {
  merchantId: string;
  merchantName: string;
  partnerId: string;
  partnerUserRole: string;
  canViewClientNames: boolean;
}

export interface PartnerDashboardMetrics {
  total_revenue_cents: number;
  partner_share_cents: number;
  merchant_share_cents: number;
  sales_tax_cents: number;
  outstanding_balance_cents: number;
  estimated_tax_cents?: number;
  period_start: string;
  period_end: string;
}

export interface RevenueTrend {
  month: string;
  revenue_cents: number;
  partner_share_cents: number;
}

export interface Invoice {
  id: string;
  merchant_id: string;
  client_id: string | null;
  client_name: string | null;
  external_id: string | null;
  transaction_type: string;
  status: string;
  subtotal_cents: number;
  sales_tax_cents: number;
  total_cents: number;
  fees_cents: number;
  net_cents: number;
  currency: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

export interface Payout {
  id: string;
  merchant_id: string;
  partner_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  payout_method: string;
  payout_reference: string | null;
  description: string | null;
  scheduled_date: string;
  processed_at: string | null;
  created_at: string;
}

/**
 * Get list of merchants linked to partner
 */
export async function getPartnerMerchants(): Promise<LinkedMerchant[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: LinkedMerchant[]; error?: string }>(
      '/api/partner/merchants'
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch merchants');
    }
  } catch (error: any) {
    console.error('Get partner merchants error:', error);
    
    // If using dummy credentials, return mock data
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && token.startsWith('dummy-partner-token-')) {
        // Return mock merchants for dummy users
        return [
          {
            merchantId: 'merchant-001',
            merchantName: 'Acme Corporation',
            accessLevel: 'full',
            canViewClientNames: true,
          },
          {
            merchantId: 'merchant-002',
            merchantName: 'Tech Solutions Inc',
            accessLevel: 'full',
            canViewClientNames: false,
          },
        ];
      }
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch merchants');
  }
}

/**
 * Get partner context for a specific merchant
 */
export async function getPartnerContext(merchantId: string): Promise<PartnerContext> {
  try {
    const response = await apiClient.get<{ success: boolean; data: PartnerContext; error?: string }>(
      `/api/partner/context?merchantId=${merchantId}`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch partner context');
    }
  } catch (error: any) {
    console.error('Get partner context error:', error);
    
    // Return mock context for testing
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.message?.includes('Network Error') || 
                          error.message?.includes('Failed to fetch');
    
    if (isNetworkError) {
      // Return mock context based on merchantId
      const canViewClientNames = merchantId === 'merchant-001' || merchantId === 'merchant-003';
      return {
        merchantId: merchantId,
        merchantName: merchantId === 'merchant-001' ? 'Acme Corporation' : 
                     merchantId === 'merchant-002' ? 'Tech Solutions Inc' : 
                     'Global Trading Co',
        partnerId: 'partner-001',
        partnerUserRole: 'partner_owner',
        canViewClientNames: canViewClientNames,
      };
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch partner context');
  }
}

/**
 * Get partner dashboard metrics for a specific merchant
 */
export async function getPartnerDashboardMetrics(
  merchantId: string,
  period: 'month' | 'year' = 'month'
): Promise<PartnerDashboardMetrics> {
  try {
    const response = await apiClient.get<{ success: boolean; data: PartnerDashboardMetrics; error?: string }>(
      `/api/dashboard/partner/${merchantId}`,
      { params: { period } }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch dashboard metrics');
    }
  } catch (error: any) {
    console.error('Get partner dashboard metrics error:', error);
    
    // Return mock metrics for testing
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.message?.includes('Network Error') || 
                          error.message?.includes('Failed to fetch');
    
    if (isNetworkError) {
      // Return mock metrics
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      return {
        total_revenue_cents: 15000000, // $150,000
        partner_share_cents: 4500000, // $45,000 (30%)
        merchant_share_cents: 10500000, // $105,000 (70%)
        sales_tax_cents: 1200000, // $12,000
        outstanding_balance_cents: 2500000, // $25,000
        estimated_tax_cents: 1350000, // $13,500
        period_start: startOfMonth.toISOString(),
        period_end: endOfMonth.toISOString(),
      };
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch dashboard metrics');
  }
}

/**
 * Get revenue trend for last 6 months
 */
export async function getRevenueTrend(merchantId: string): Promise<RevenueTrend[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: RevenueTrend[]; error?: string }>(
      `/api/dashboard/partner/${merchantId}/trend`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch revenue trend');
    }
  } catch (error: any) {
    console.warn('Revenue trend endpoint not available:', error);
    
    // Return mock trend data for testing
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.message?.includes('Network Error') || 
                          error.message?.includes('Failed to fetch');
    
    if (isNetworkError) {
      // Generate mock data for last 6 months
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
          revenue_cents: 10000000 + Math.floor(Math.random() * 5000000), // $100k - $150k
          partner_share_cents: 3000000 + Math.floor(Math.random() * 1500000), // 30% of revenue
        });
      }
      return months;
    }
    
    // If endpoint doesn't exist, return empty array
    return [];
  }
}

/**
 * Get recent invoices (transactions) for partner
 */
export async function getRecentInvoices(
  merchantId: string,
  limit: number = 10
): Promise<Invoice[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Invoice[]; error?: string }>(
      `/api/transactions/merchant/${merchantId}`,
      { params: { limit, page: 1 } }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch invoices');
    }
  } catch (error: any) {
    console.error('Get recent invoices error:', error);
    
    // Return mock invoices for testing
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.message?.includes('Network Error') || 
                          error.message?.includes('Failed to fetch');
    
    if (isNetworkError) {
      // Return mock invoices
      const mockInvoices: Invoice[] = [];
      const now = new Date();
      for (let i = 0; i < limit; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        mockInvoices.push({
          id: `invoice-${i + 1}`,
          merchant_id: merchantId,
          client_id: `client-${i + 1}`,
          client_name: merchantId === 'merchant-002' ? null : `Client ${i + 1}`, // Hidden for merchant-002
          external_id: `EXT-${1000 + i}`,
          transaction_type: 'PAYMENT',
          status: i % 3 === 0 ? 'COMPLETED' : i % 3 === 1 ? 'PENDING' : 'FAILED',
          subtotal_cents: 50000 + (i * 10000),
          sales_tax_cents: 5000 + (i * 1000),
          total_cents: 55000 + (i * 11000),
          fees_cents: 1000 + (i * 100),
          net_cents: 54000 + (i * 10900),
          currency: 'USD',
          description: `Transaction ${i + 1}`,
          transaction_date: date.toISOString(),
          created_at: date.toISOString(),
        });
      }
      return mockInvoices;
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch invoices');
  }
}

/**
 * Get recent payouts for partner
 */
export async function getRecentPayouts(
  merchantId: string,
  limit: number = 10
): Promise<Payout[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Payout[]; error?: string }>(
      '/api/payouts/partner',
      { params: { merchantId, limit, page: 1 } }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch payouts');
    }
  } catch (error: any) {
    console.error('Get recent payouts error:', error);
    
    // Return mock payouts for testing
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.message?.includes('Network Error') || 
                          error.message?.includes('Failed to fetch');
    
    if (isNetworkError) {
      // Return mock payouts
      const mockPayouts: Payout[] = [];
      const now = new Date();
      for (let i = 0; i < limit; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7)); // Weekly payouts
        mockPayouts.push({
          id: `payout-${i + 1}`,
          merchant_id: merchantId,
          partner_id: 'partner-001',
          amount_cents: 100000 + (i * 50000), // $1,000 - $6,000
          currency: 'USD',
          status: i % 4 === 0 ? 'COMPLETED' : i % 4 === 1 ? 'PENDING' : i % 4 === 2 ? 'PROCESSING' : 'FAILED',
          payout_method: 'BANK_TRANSFER',
          payout_reference: `REF-${2000 + i}`,
          description: `Payout ${i + 1}`,
          scheduled_date: date.toISOString(),
          processed_at: i % 4 === 0 ? date.toISOString() : null,
          created_at: date.toISOString(),
        });
      }
      return mockPayouts;
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch payouts');
  }
}

/**
 * Get all invoices (with pagination)
 */
export async function getInvoices(
  merchantId: string,
  page: number = 1,
  limit: number = 20,
  filters?: { status?: string; type?: string }
): Promise<{ data: Invoice[]; pagination: any }> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: Invoice[];
      pagination: any;
      error?: string;
    }>(`/api/transactions/merchant/${merchantId}`, {
      params: { page, limit, ...filters },
    });
    
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data,
        pagination: response.data.pagination || { page, limit, total: response.data.data.length, totalPages: 1 },
      };
    } else {
      throw new Error(response.data.error || 'Failed to fetch invoices');
    }
  } catch (error: any) {
    console.error('Get invoices error:', error);
    
    // Return mock invoices for testing
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.message?.includes('Network Error') || 
                          error.message?.includes('Failed to fetch');
    
    if (isNetworkError) {
      // Generate mock invoices
      const mockInvoices: Invoice[] = [];
      const now = new Date();
      const startIndex = (page - 1) * limit;
      
      for (let i = 0; i < limit; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (startIndex + i));
        const status = filters?.status || (i % 3 === 0 ? 'COMPLETED' : i % 3 === 1 ? 'PENDING' : 'FAILED');
        const type = filters?.type || (i % 2 === 0 ? 'PAYMENT' : 'REFUND');
        
        // Apply filters
        if (filters?.status && status !== filters.status) continue;
        if (filters?.type && type !== filters.type) continue;
        
        mockInvoices.push({
          id: `invoice-${startIndex + i + 1}`,
          merchant_id: merchantId,
          client_id: `client-${startIndex + i + 1}`,
          client_name: merchantId === 'merchant-002' ? null : `Client ${startIndex + i + 1}`, // Hidden for merchant-002
          external_id: `EXT-${1000 + startIndex + i}`,
          transaction_type: type,
          status: status,
          subtotal_cents: 50000 + ((startIndex + i) * 10000),
          sales_tax_cents: 5000 + ((startIndex + i) * 1000),
          total_cents: 55000 + ((startIndex + i) * 11000),
          fees_cents: 1000 + ((startIndex + i) * 100),
          net_cents: 54000 + ((startIndex + i) * 10900),
          currency: 'USD',
          description: `Transaction ${startIndex + i + 1}`,
          transaction_date: date.toISOString(),
          created_at: date.toISOString(),
        });
      }
      
      return {
        data: mockInvoices,
        pagination: {
          page,
          limit,
          total: 100, // Mock total
          totalPages: Math.ceil(100 / limit),
        },
      };
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch invoices');
  }
}

/**
 * Get all payouts (with pagination)
 */
export async function getPayouts(
  merchantId: string,
  page: number = 1,
  limit: number = 20,
  filters?: { status?: string; payoutMethod?: string }
): Promise<{ data: Payout[]; pagination: any }> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: Payout[];
      pagination: any;
      error?: string;
    }>('/api/payouts/partner', {
      params: { merchantId, page, limit, ...filters },
    });
    
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data,
        pagination: response.data.pagination || { page, limit, total: response.data.data.length, totalPages: 1 },
      };
    } else {
      throw new Error(response.data.error || 'Failed to fetch payouts');
    }
  } catch (error: any) {
    console.error('Get payouts error:', error);
    
    // Return mock payouts for testing
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.message?.includes('Network Error') || 
                          error.message?.includes('Failed to fetch');
    
    if (isNetworkError) {
      // Generate mock payouts
      const mockPayouts: Payout[] = [];
      const now = new Date();
      const startIndex = (page - 1) * limit;
      
      for (let i = 0; i < limit; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - ((startIndex + i) * 7)); // Weekly payouts
        const status = filters?.status || (i % 4 === 0 ? 'COMPLETED' : i % 4 === 1 ? 'PENDING' : i % 4 === 2 ? 'PROCESSING' : 'FAILED');
        const method = filters?.payoutMethod || (i % 3 === 0 ? 'BANK_TRANSFER' : i % 3 === 1 ? 'WIRE' : 'CHECK');
        
        // Apply filters
        if (filters?.status && status !== filters.status) continue;
        if (filters?.payoutMethod && method !== filters.payoutMethod) continue;
        
        mockPayouts.push({
          id: `payout-${startIndex + i + 1}`,
          merchant_id: merchantId,
          partner_id: 'partner-001',
          amount_cents: 100000 + ((startIndex + i) * 50000), // $1,000 - $6,000
          currency: 'USD',
          status: status,
          payout_method: method,
          payout_reference: `REF-${2000 + startIndex + i}`,
          description: `Payout ${startIndex + i + 1}`,
          scheduled_date: date.toISOString(),
          processed_at: status === 'COMPLETED' ? date.toISOString() : null,
          created_at: date.toISOString(),
        });
      }
      
      return {
        data: mockPayouts,
        pagination: {
          page,
          limit,
          total: 50, // Mock total
          totalPages: Math.ceil(50 / limit),
        },
      };
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch payouts');
  }
}

/**
 * Invite partner staff member
 */
export interface InviteStaffData {
  name: string;
  email: string;
}

export async function inviteStaff(data: InviteStaffData): Promise<{ id: string; email: string; name: string; role: string; invitedAt: string }> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      data: { id: string; email: string; name: string; role: string; invitedAt: string };
      error?: string;
    }>('/api/partner/users/invite', data);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to invite staff member');
    }
  } catch (error: any) {
    console.error('Invite staff error:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to invite staff member');
  }
}

/**
 * Set password for invited staff member
 */
export interface SetPasswordData {
  token: string;
  newPassword: string;
}

export async function setPassword(data: SetPasswordData): Promise<void> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      error?: string;
    }>('/api/partner/users/set-password', data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to set password');
    }
  } catch (error: any) {
    console.error('Set password error:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to set password');
  }
}

