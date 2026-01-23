/**
 * Export utility functions for CSV downloads
 */

import { api } from '@/lib/api';

/**
 * Calculate date range based on period
 */
export function getDateRangeForPeriod(period: 'week' | 'month' | 'year'): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === 'week') {
    // Start of current week (Sunday)
    const dayOfWeek = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    // Start of current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    
    // End of current month
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'year') {
    // Start of current year
    startDate = new Date(now.getFullYear(), 0, 1);
    startDate.setHours(0, 0, 0, 0);
    
    // End of current year
    endDate = new Date(now.getFullYear(), 11, 31);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Default to current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateForExport(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Download blob as file
 */
export function downloadBlobAsFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Export transactions as CSV
 */
export async function exportTransactions(
  period: 'week' | 'month' | 'year',
  merchantId?: string,
  partnerId?: string
): Promise<void> {
  try {
    const { startDate, endDate } = getDateRangeForPeriod(period);
    
    const params: any = {
      startDate: formatDateForExport(startDate),
      endDate: formatDateForExport(endDate),
    };

    if (merchantId) {
      params.merchantId = merchantId;
    }

    if (partnerId) {
      params.partnerId = partnerId;
    }

    const response = await api.reports.exportTransactions(params);
    
    const filename = `transactions-${formatDateForExport(startDate)}-${formatDateForExport(endDate)}.csv`;
    downloadBlobAsFile(new Blob([response.data]), filename);
  } catch (error: any) {
    console.error('Export transactions error:', error);
    
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.message?.includes('Network Error') || 
                          error.message?.includes('Failed to fetch');
    
    // Check if this is a real auth error from the export endpoint (not from token refresh)
    const isActualAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isFromExportEndpoint = error.config?.url?.includes('/export') || 
                                 error.response?.config?.url?.includes('/export');
    const isRefreshError = error.config?.url?.includes('/auth/refresh') ||
                          error.isRefreshError; // Marked by API interceptor
    
    if (isNetworkError) {
      throw new Error('Cannot export: Backend server is not running. This feature requires the API server.');
    } else if (isRefreshError) {
      // If it's a refresh token error, don't treat as session expired
      // The access token might still be valid, so just show the error
      throw new Error(error.response?.data?.error || error.message || 'Failed to refresh authentication. Please try again.');
    } else if (isActualAuthError && isFromExportEndpoint) {
      // It's an auth error from the export endpoint
      // Check if we have tokens - if yes, it might be a temporary issue
      let hasTokens = false;
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          hasTokens = !!(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'));
        } catch (e) {
          // Ignore
        }
      }
      
      if (!hasTokens) {
        // No tokens at all - truly expired
        throw new Error('Your session has expired. Please refresh the page and log in again.');
      } else {
        // Have tokens but still got auth error - might be expired or invalid
        throw new Error('Authentication failed. Please try refreshing the page and exporting again.');
      }
    } else {
      // For all other errors, just throw the original error
      throw new Error(error.response?.data?.error || error.message || 'Failed to export transactions');
    }
  }
}

/**
 * Export payouts as CSV
 */
export async function exportPayouts(
  period: 'week' | 'month' | 'year',
  merchantId?: string,
  partnerId?: string
): Promise<void> {
  try {
    const { startDate, endDate } = getDateRangeForPeriod(period);
    
    const params: any = {
      startDate: formatDateForExport(startDate),
      endDate: formatDateForExport(endDate),
    };

    if (merchantId) {
      params.merchantId = merchantId;
    }

    if (partnerId) {
      params.partnerId = partnerId;
    }

    const response = await api.reports.exportPayouts(params);
    
    const filename = `payouts-${formatDateForExport(startDate)}-${formatDateForExport(endDate)}.csv`;
    downloadBlobAsFile(new Blob([response.data]), filename);
  } catch (error: any) {
    console.error('Export payouts error:', error);
    
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.message?.includes('Network Error') || 
                          error.message?.includes('Failed to fetch');
    
    // Check if this is a real auth error from the export endpoint (not from token refresh)
    const isActualAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isFromExportEndpoint = error.config?.url?.includes('/export') || 
                                 error.response?.config?.url?.includes('/export');
    const isRefreshError = error.config?.url?.includes('/auth/refresh') ||
                          error.isRefreshError; // Marked by API interceptor
    
    if (isNetworkError) {
      throw new Error('Cannot export: Backend server is not running. This feature requires the API server.');
    } else if (isRefreshError) {
      // If it's a refresh token error, don't treat as session expired
      // The access token might still be valid, so just show the error
      throw new Error(error.response?.data?.error || error.message || 'Failed to refresh authentication. Please try again.');
    } else if (isActualAuthError && isFromExportEndpoint) {
      // It's an auth error from the export endpoint
      // Check if we have tokens - if yes, it might be a temporary issue
      let hasTokens = false;
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          hasTokens = !!(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'));
        } catch (e) {
          // Ignore
        }
      }
      
      if (!hasTokens) {
        // No tokens at all - truly expired
        throw new Error('Your session has expired. Please refresh the page and log in again.');
      } else {
        // Have tokens but still got auth error - might be expired or invalid
        throw new Error('Authentication failed. Please try refreshing the page and exporting again.');
      }
    } else {
      // For all other errors, just throw the original error
      throw new Error(error.response?.data?.error || error.message || 'Failed to export payouts');
    }
  }
}
