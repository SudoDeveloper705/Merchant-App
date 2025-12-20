'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatCard } from './StatCard';

interface AccountantDashboardProps {
  user: {
    name?: string;
    email: string;
    role: string;
  };
}

export function AccountantDashboard({ user }: AccountantDashboardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data for accountant dashboard - financial focus
  const metrics = {
    total_revenue_cents: 1250000,
    total_expenses_cents: 350000,
    net_profit_cents: 900000,
    amount_owed_to_partners_cents: 250000,
    pending_payouts_cents: 150000,
    transaction_count: 45,
    expense_count: 12,
    tax_liability_cents: 180000,
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accountant Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user.name || user.email} - Financial overview
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

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics.total_revenue_cents)}
          subtitle={`${period} period`}
          trend={{ value: 12.5, isPositive: true }}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(metrics.total_expenses_cents)}
          subtitle={`${period} period`}
          trend={{ value: 5.2, isPositive: false }}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(metrics.net_profit_cents)}
          subtitle={`${period} period`}
          trend={{ value: 18.3, isPositive: true }}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="Tax Liability"
          value={formatCurrency(metrics.tax_liability_cents)}
          subtitle="Estimated"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Partner Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Owed to Partners"
          value={formatCurrency(metrics.amount_owed_to_partners_cents)}
          subtitle="Total outstanding"
          className="lg:col-span-1"
        />
        <StatCard
          title="Pending Payouts"
          value={formatCurrency(metrics.pending_payouts_cents)}
          subtitle="Awaiting processing"
          className="lg:col-span-1"
        />
      </div>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Transactions"
          value={metrics.transaction_count}
          subtitle={`${period} period`}
          className="lg:col-span-1"
        />
        <StatCard
          title="Expenses"
          value={metrics.expense_count}
          subtitle={`${period} period`}
          className="lg:col-span-1"
        />
      </div>

      {/* Accountant-Specific Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/merchant/payouts"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
          >
            <h3 className="font-medium text-gray-900">Process Payouts</h3>
            <p className="text-sm text-gray-500 mt-1">Review and process partner payouts</p>
          </Link>
          <Link
            href="/merchant/reports"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
          >
            <h3 className="font-medium text-gray-900">Generate Reports</h3>
            <p className="text-sm text-gray-500 mt-1">Create financial reports and exports</p>
          </Link>
          <Link
            href="/merchant/transactions"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
          >
            <h3 className="font-medium text-gray-900">Review Expenses</h3>
            <p className="text-sm text-gray-500 mt-1">Categorize and review expenses</p>
          </Link>
        </div>
      </div>

      {/* Financial Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Alerts</h2>
        <div className="space-y-3">
          <Link
            href="/merchant/transactions"
            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">High expense ratio detected</p>
              <p className="text-xs text-gray-500 mt-1">Expenses are 28% of revenue this month</p>
            </div>
            <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">Review</span>
          </Link>
          <Link
            href="/merchant/reports"
            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Tax filing due soon</p>
              <p className="text-xs text-gray-500 mt-1">Quarterly tax filing due in 15 days</p>
            </div>
            <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">View</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

