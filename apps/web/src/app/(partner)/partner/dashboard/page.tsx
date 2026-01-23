'use client';

import { useState, useEffect } from 'react';
import { PartnerLayout } from '@/components/layouts/PartnerLayout';
import { usePartnerAuth } from '@/contexts/PartnerAuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendChart } from '@/components/partner/TrendChart';
import { InvoicesTable } from '@/components/partner/InvoicesTable';
import { PayoutsTable } from '@/components/partner/PayoutsTable';
import { isReadOnly, isPartnerOwner } from '@/utils/partnerRoles';
import {
  getSelectedMerchantId,
  setSelectedMerchantId,
  getPartnerMerchants,
  getPartnerContext,
  getPartnerDashboardMetrics,
  getRevenueTrend,
  getRecentInvoices,
  getRecentPayouts,
  type PartnerDashboardMetrics as Metrics,
  type RevenueTrend,
  type Invoice,
  type Payout,
} from '@/lib/partnerApi';
import { Button } from '@/components/ui';
import { exportTransactions, exportPayouts } from '@/utils/export';

export default function PartnerDashboardPage() {
  const { user, loading: authLoading } = usePartnerAuth();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [canViewClientNames, setCanViewClientNames] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [trendData, setTrendData] = useState<RevenueTrend[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'transactions' | 'payouts' | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const initializeMerchant = async () => {
      // Get merchant ID from localStorage
      let storedMerchantId = getSelectedMerchantId();
      
      // If no merchant selected, auto-select the first available merchant
      if (!storedMerchantId) {
        try {
          const merchants = await getPartnerMerchants();
          if (merchants && merchants.length > 0) {
            storedMerchantId = merchants[0].merchantId;
            setSelectedMerchantId(storedMerchantId);
          }
        } catch (error) {
          console.error('Failed to load merchants:', error);
          // If we can't load merchants, use a default for dummy users
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token && (token.startsWith('dummy-partner-token-') || token.startsWith('dummy-token-'))) {
              storedMerchantId = 'merchant-001';
              setSelectedMerchantId(storedMerchantId);
            }
          }
        }
      }
      
      if (storedMerchantId) {
        setMerchantId(storedMerchantId);
        loadDashboardData(storedMerchantId);
      }
    };
    
    // Only initialize if user is loaded
    if (!authLoading && user) {
      initializeMerchant();
    }
  }, [authLoading, user]);

  const handleMerchantChange = async (newMerchantId: string) => {
    if (newMerchantId && newMerchantId !== merchantId) {
      setMerchantId(newMerchantId);
      setSelectedMerchantId(newMerchantId);
      await loadDashboardData(newMerchantId);
    }
  };
  
  // Listen for merchant changes from MerchantSwitcher (only when user is loaded)
  useEffect(() => {
    if (!user || authLoading) return;
    
    const checkMerchantSelection = () => {
      const storedMerchantId = getSelectedMerchantId();
      if (storedMerchantId && storedMerchantId !== merchantId) {
        setMerchantId(storedMerchantId);
        loadDashboardData(storedMerchantId);
      }
    };
    
    // Check periodically for merchant selection (in case MerchantSwitcher sets it)
    const interval = setInterval(checkMerchantSelection, 500);
    return () => clearInterval(interval);
  }, [merchantId, user, authLoading]);

  const [linkageValidated, setLinkageValidated] = useState(false);

  const loadDashboardData = async (mId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get context to check canViewClientNames
      const context = await getPartnerContext(mId);
      setCanViewClientNames(context.canViewClientNames);
      setLinkageValidated(true); // If we got context, linkage is valid

      // Load all data in parallel
      const [metricsData, trend, recentInvoices, recentPayouts] = await Promise.all([
        getPartnerDashboardMetrics(mId, 'month'),
        getRevenueTrend(mId),
        getRecentInvoices(mId, 5),
        getRecentPayouts(mId, 5),
      ]);

      setMetrics(metricsData);
      setTrendData(trend);
      setInvoices(recentInvoices);
      setPayouts(recentPayouts);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      
      // Only show error if it's not a network error (network errors are handled by mock data)
      const isNetworkError = err.code === 'ECONNREFUSED' || 
                            err.message?.includes('Network Error') || 
                            err.message?.includes('Failed to fetch');
      
      if (!isNetworkError) {
        setError(err.message || 'Failed to load dashboard data');
        setLinkageValidated(false); // If error, linkage validation failed
      } else {
        // Network errors are handled by mock data, so clear any previous errors
        setError(null);
        setLinkageValidated(true); // Mock data means we can assume linkage is valid for testing
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleExportTransactions = async () => {
    if (!merchantId) return;
    try {
      setExporting('transactions');
      await exportTransactions(period, merchantId);
    } catch (error: any) {
      // Don't show alert if it's an auth error (redirect will happen)
      if (!error.message?.includes('session has expired') && !error.message?.includes('log in again')) {
        alert(error.message || 'Failed to export transactions');
      }
    } finally {
      setExporting(null);
    }
  };

  const handleExportPayouts = async () => {
    if (!merchantId) return;
    try {
      setExporting('payouts');
      await exportPayouts(period, merchantId);
    } catch (error: any) {
      // Don't show alert if it's an auth error (redirect will happen)
      if (!error.message?.includes('session has expired') && !error.message?.includes('log in again')) {
        alert(error.message || 'Failed to export payouts');
      }
    } finally {
      setExporting(null);
    }
  };

  // Show loading state while auth is being checked
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

  // Check if user is authenticated
  if (!user) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please login to view your dashboard</p>
        </div>
      </PartnerLayout>
    );
  }

  // Show loading while merchant is being initialized
  if (!merchantId && loading) {
    return (
      <PartnerLayout onMerchantChange={handleMerchantChange}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </PartnerLayout>
    );
  }
  
  // Show merchant selection prompt if no merchant selected (but only after loading is done)
  if (!merchantId && !loading) {
    return (
      <PartnerLayout onMerchantChange={handleMerchantChange}>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Please select a merchant to view the dashboard</p>
          <p className="text-sm text-gray-500">The merchant switcher is in the header above</p>
        </div>
      </PartnerLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PartnerLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout onMerchantChange={handleMerchantChange}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isPartnerOwner(user.role) && merchantId && (
              <>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <Button
                  variant="outline"
                  onClick={handleExportTransactions}
                  disabled={exporting !== null}
                  isLoading={exporting === 'transactions'}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Transactions
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPayouts}
                  disabled={exporting !== null}
                  isLoading={exporting === 'payouts'}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Payouts
                </Button>
              </>
            )}
            {isReadOnly(user.role) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <p className="text-sm text-blue-800 font-medium">Read-only mode</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(metrics.total_revenue_cents)}
              subtitle="Subtotal (this month)"
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Partner Share"
              value={formatCurrency(metrics.partner_share_cents)}
              subtitle="Your earnings"
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <StatCard
              title="Merchant Share"
              value={formatCurrency(metrics.merchant_share_cents)}
              subtitle="Merchant portion"
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            <StatCard
              title="Sales Tax"
              value={formatCurrency(metrics.sales_tax_cents)}
              subtitle="Tax collected"
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <StatCard
              title="Outstanding Balance"
              value={formatCurrency(metrics.outstanding_balance_cents)}
              subtitle="Pending payouts"
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            {metrics.estimated_tax_cents !== undefined && (
              <StatCard
                title="Estimated Tax"
                value={formatCurrency(metrics.estimated_tax_cents)}
                subtitle="Tax estimate"
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
              />
            )}
          </div>
        ) : null}

        {/* Revenue Trend Chart */}
        <TrendChart data={trendData} loading={loading} />

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <InvoicesTable
              invoices={invoices}
              loading={loading}
              canViewClientNames={canViewClientNames}
            />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <PayoutsTable payouts={payouts} loading={loading} />
          </div>
        </div>

        {/* Dev-only Debug Panel */}
        {typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-bold text-yellow-900 mb-3">🔧 Debug Panel (Dev Only)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-yellow-700 font-semibold">Partner User Role:</span>
                <span className="ml-2 text-yellow-900">{user?.role || 'N/A'}</span>
              </div>
              <div>
                <span className="text-yellow-700 font-semibold">Partner ID:</span>
                <span className="ml-2 text-yellow-900 break-all">{user?.partnerId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-yellow-700 font-semibold">Selected Merchant ID:</span>
                <span className="ml-2 text-yellow-900 break-all">{merchantId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-yellow-700 font-semibold">Linkage Validated:</span>
                <span className={`ml-2 font-semibold ${linkageValidated ? 'text-green-700' : 'text-red-700'}`}>
                  {linkageValidated ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div>
                <span className="text-yellow-700 font-semibold">Can View Client Names:</span>
                <span className={`ml-2 font-semibold ${canViewClientNames ? 'text-green-700' : 'text-red-700'}`}>
                  {canViewClientNames ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
