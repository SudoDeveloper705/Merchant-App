'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatCard } from './StatCard';

interface PartnerOwnerDashboardProps {
  user: {
    name?: string;
    email: string;
    role: string;
    partnerName?: string;
  };
}

export function PartnerOwnerDashboard({ user }: PartnerOwnerDashboardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data for partner owner dashboard - full access to all partner metrics
  const metrics = {
    total_revenue_cents: 850000,
    partner_share_cents: 340000,
    merchant_share_cents: 510000,
    transaction_count: 32,
    active_merchants: 6,
    agreement_count: 8,
    pending_payouts_cents: 120000,
    monthly_growth: 15.3,
    total_commissions_cents: 340000,
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Owner Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user.name || user.email} - {user.partnerName || 'Partner'} Overview
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Primary Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics.total_revenue_cents)}
          subtitle={`${period} period`}
          trend={{ value: metrics.monthly_growth, isPositive: true }}
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
          trend={{ value: 12.5, isPositive: true }}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Payouts"
          value={formatCurrency(metrics.pending_payouts_cents)}
          subtitle="Awaiting payment"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Commissions"
          value={formatCurrency(metrics.total_commissions_cents)}
          subtitle={`${period} period`}
          trend={{ value: 8.7, isPositive: true }}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Business Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Merchants"
          value={metrics.active_merchants}
          subtitle="Partner merchants"
          className="lg:col-span-1"
        />
        <StatCard
          title="Transactions"
          value={metrics.transaction_count}
          subtitle={`${period} period`}
          className="lg:col-span-1"
        />
        <StatCard
          title="Agreements"
          value={metrics.agreement_count}
          subtitle="Active agreements"
          className="lg:col-span-1"
        />
      </div>

      {/* Owner-Specific Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/partner/reports"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
          >
            <h3 className="font-medium text-gray-900">View Reports</h3>
            <p className="text-sm text-gray-500 mt-1">Analyze performance and earnings</p>
          </Link>
          <Link
            href="/partner/reports"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
          >
            <h3 className="font-medium text-gray-900">Manage Agreements</h3>
            <p className="text-sm text-gray-500 mt-1">Review and update partnership terms</p>
          </Link>
          <Link
            href="/partner/reports"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
          >
            <h3 className="font-medium text-gray-900">Team Management</h3>
            <p className="text-sm text-gray-500 mt-1">Manage partner staff members</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Payout received</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
            <span className="text-sm font-medium text-green-600">+$2,450.00</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New agreement signed</p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New transaction processed</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <span className="text-sm font-medium text-green-600">+$850.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

