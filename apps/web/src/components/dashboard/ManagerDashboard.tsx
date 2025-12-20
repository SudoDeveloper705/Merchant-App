'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatCard } from './StatCard';

interface ManagerDashboardProps {
  user: {
    name?: string;
    email: string;
    role: string;
  };
}

export function ManagerDashboard({ user }: ManagerDashboardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data for manager dashboard - operational metrics
  const metrics = {
    transaction_count: 45,
    partner_count: 8,
    agreement_count: 12,
    pending_tasks: 5,
    active_clients: 25,
    revenue_cents: 1250000,
    expenses_cents: 350000,
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user.name || user.email} - Operational overview
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

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Transactions"
          value={metrics.transaction_count}
          subtitle={`${period} period`}
          trend={{ value: 8.2, isPositive: true }}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Active Partners"
          value={metrics.partner_count}
          subtitle="Total partnerships"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Agreements"
          value={metrics.agreement_count}
          subtitle="Active agreements"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Tasks"
          value={metrics.pending_tasks}
          subtitle="Requires attention"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>

      {/* Financial Overview (Limited) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Revenue"
          value={formatCurrency(metrics.revenue_cents)}
          subtitle={`${period} period`}
          className="lg:col-span-1"
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(metrics.expenses_cents)}
          subtitle={`${period} period`}
          className="lg:col-span-1"
        />
      </div>

      {/* Manager-Specific Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/merchant/transactions"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
          >
            <h3 className="font-medium text-gray-900">View Transactions</h3>
            <p className="text-sm text-gray-500 mt-1">Review and manage transactions</p>
          </Link>
          <Link
            href="/merchant/partners"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
          >
            <h3 className="font-medium text-gray-900">Manage Partners</h3>
            <p className="text-sm text-gray-500 mt-1">View and update partner information</p>
          </Link>
          <Link
            href="/merchant/agreements"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
          >
            <h3 className="font-medium text-gray-900">Review Agreements</h3>
            <p className="text-sm text-gray-500 mt-1">Check agreement status and details</p>
          </Link>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h2>
        <div className="space-y-3">
          <Link
            href="/merchant/payouts"
            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Review pending payout</p>
              <p className="text-xs text-gray-500 mt-1">Tech Solutions Inc - $45,000</p>
            </div>
            <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">Review</span>
          </Link>
          <Link
            href="/merchant/agreements"
            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">New agreement requires approval</p>
              <p className="text-xs text-gray-500 mt-1">Global Services Ltd</p>
            </div>
            <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">View</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

