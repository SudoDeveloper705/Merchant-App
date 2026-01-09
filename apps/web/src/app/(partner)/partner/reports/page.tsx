'use client';

import { useState } from 'react';
import { PartnerLayout } from '@/components/layouts/PartnerLayout';
import { usePartnerAuth } from '@/contexts/PartnerAuthContext';
import { isPartnerOwner, isReadOnly } from '@/utils/partnerRoles';
import { getSelectedMerchantId } from '@/lib/partnerApi';
import { api } from '@/lib/api';

export default function PartnerReportsPage() {
  const { user, loading } = usePartnerAuth();
  const [exporting, setExporting] = useState(false);
  const merchantId = getSelectedMerchantId();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </PartnerLayout>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please login to view reports</p>
        </div>
      </PartnerLayout>
    );
  }

  const handleExportTransactions = async () => {
    if (!merchantId) return;
    
    try {
      setExporting(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const response = await api.reports.exportTransactions({
        merchantId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        format: 'csv',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      
      // Check if it's a network error
      const isNetworkError = error.code === 'ECONNREFUSED' || 
                            error.message?.includes('Network Error') || 
                            error.message?.includes('Failed to fetch');
      
      if (isNetworkError) {
        alert('Cannot export: Backend server is not running. This feature requires the API server.');
      } else {
        alert('Failed to export transactions');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleExportPayouts = async () => {
    if (!merchantId) return;
    
    try {
      setExporting(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const response = await api.reports.exportPayouts({
        merchantId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        format: 'csv',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payouts-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      
      // Check if it's a network error
      const isNetworkError = error.code === 'ECONNREFUSED' || 
                            error.message?.includes('Network Error') || 
                            error.message?.includes('Failed to fetch');
      
      if (isNetworkError) {
        alert('Cannot export: Backend server is not running. This feature requires the API server.');
      } else {
        alert('Failed to export payouts');
      }
    } finally {
      setExporting(false);
    }
  };

  const isOwner = isPartnerOwner(user?.role);
  const readOnly = isReadOnly(user?.role);

  return (
    <PartnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="mt-1 text-sm text-gray-500">View and export financial reports</p>
          </div>
          {readOnly && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-800">Read-only mode</p>
            </div>
          )}
        </div>

        {!merchantId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Please select a merchant to view reports</p>
          </div>
        )}

        {merchantId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Transactions - Hidden for partner_staff */}
            {isOwner && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Transactions</h3>
                <p className="text-sm text-gray-600 mb-4">Download transaction data as CSV</p>
                <button
                  onClick={handleExportTransactions}
                  disabled={exporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {exporting ? 'Exporting...' : 'Export Transactions'}
                </button>
              </div>
            )}

            {/* Export Payouts - Hidden for partner_staff */}
            {isOwner && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Payouts</h3>
                <p className="text-sm text-gray-600 mb-4">Download payout data as CSV</p>
                <button
                  onClick={handleExportPayouts}
                  disabled={exporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {exporting ? 'Exporting...' : 'Export Payouts'}
                </button>
              </div>
            )}

            {/* Read-only message for staff */}
            {readOnly && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
                <p className="text-sm text-gray-600">
                  You have read-only access. Contact your partner owner to export reports.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settlement Reports</h3>
          <p className="text-gray-600">Settlement reports will be available here.</p>
        </div>
      </div>
    </PartnerLayout>
  );
}

