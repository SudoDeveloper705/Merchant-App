'use client';

import { useState, useEffect } from 'react';
import { PartnerLayout } from '@/components/layouts/PartnerLayout';
import { usePartnerAuth } from '@/contexts/PartnerAuthContext';
import { InvoicesTable } from '@/components/partner/InvoicesTable';
import { isReadOnly } from '@/utils/partnerRoles';
import {
  getSelectedMerchantId,
  getPartnerContext,
  getInvoices,
  type Invoice,
} from '@/lib/partnerApi';

export default function PartnerInvoicesPage() {
  const { user, loading: authLoading } = usePartnerAuth();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [canViewClientNames, setCanViewClientNames] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<{ status?: string; type?: string }>({});

  useEffect(() => {
    const storedMerchantId = getSelectedMerchantId();
    if (storedMerchantId) {
      setMerchantId(storedMerchantId);
      loadInvoices(storedMerchantId, page, filters);
    }
  }, [page, filters]);

  const loadInvoices = async (mId: string, currentPage: number, currentFilters: typeof filters) => {
    try {
      setLoading(true);
      setError(null);

      // Get context to check canViewClientNames
      const context = await getPartnerContext(mId);
      setCanViewClientNames(context.canViewClientNames);

      const result = await getInvoices(mId, currentPage, 20, currentFilters);
      setInvoices(result.data);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      
      // Only show error if it's not a network error (network errors are handled by mock data)
      const isNetworkError = err.code === 'ECONNREFUSED' || 
                            err.message?.includes('Network Error') || 
                            err.message?.includes('Failed to fetch');
      
      if (!isNetworkError) {
        setError(err.message || 'Failed to load invoices');
      } else {
        // Network errors are handled by mock data, so clear any previous errors
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </PartnerLayout>
    );
  }

  if (!user) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please login to view invoices</p>
        </div>
      </PartnerLayout>
    );
  }

  if (!merchantId) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please select a merchant to view invoices</p>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-1 text-sm text-gray-500">View all transaction invoices</p>
          </div>
          {isReadOnly(user.role) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-800 font-medium">Read-only mode</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type-filter"
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="PAYMENT">Payment</option>
                <option value="REFUND">Refund</option>
                <option value="CHARGEBACK">Chargeback</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Invoices Table - Full width */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <InvoicesTable
            invoices={invoices}
            loading={loading}
            canViewClientNames={canViewClientNames}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}

