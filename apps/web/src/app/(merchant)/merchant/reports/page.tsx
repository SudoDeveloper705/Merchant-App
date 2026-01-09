'use client';

import { useState } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button } from '@/components/dashboard/Button';
import { StatCard } from '@/components/dashboard/StatCard';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [reportType, setReportType] = useState<'financial' | 'partners' | 'transactions'>('financial');

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <MerchantLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="mt-1 text-sm text-gray-500">Generate and export business reports</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <Button onClick={() => console.log('Export report')}>Export Report</Button>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'financial', label: 'Financial' },
                { id: 'partners', label: 'Partners' },
                { id: 'transactions', label: 'Transactions' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id as typeof reportType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    reportType === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Financial Report */}
          {reportType === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(1250000)}
                  subtitle={`${selectedPeriod} period`}
                />
                <StatCard
                  title="Total Expenses"
                  value={formatCurrency(350000)}
                  subtitle={`${selectedPeriod} period`}
                />
                <StatCard
                  title="Net Profit"
                  value={formatCurrency(900000)}
                  subtitle={`${selectedPeriod} period`}
                />
                <StatCard
                  title="Partner Payouts"
                  value={formatCurrency(250000)}
                  subtitle={`${selectedPeriod} period`}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Product Sales</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(800000)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Service Revenue</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(450000)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 font-medium">Total Revenue</span>
                    <span className="font-bold text-gray-900">{formatCurrency(1250000)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Partners Report */}
          {reportType === 'partners' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Active Partners"
                  value="8"
                  subtitle="Total active partnerships"
                />
                <StatCard
                  title="Total Agreements"
                  value="12"
                  subtitle="Active agreements"
                />
                <StatCard
                  title="Partner Revenue"
                  value={formatCurrency(250000)}
                  subtitle={`${selectedPeriod} period`}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Partners by Revenue</h2>
                <div className="space-y-3">
                  {[
                    { name: 'Tech Solutions Inc', revenue: 125000 },
                    { name: 'Global Services Ltd', revenue: 95000 },
                    { name: 'Digital Marketing Pro', revenue: 30000 },
                  ].map((partner, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <span className="font-medium text-gray-900">{partner.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(partner.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transactions Report */}
          {reportType === 'transactions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Transactions"
                  value="45"
                  subtitle={`${selectedPeriod} period`}
                />
                <StatCard
                  title="Average Transaction"
                  value={formatCurrency(27778)}
                  subtitle="Per transaction"
                />
                <StatCard
                  title="Success Rate"
                  value="96%"
                  subtitle="Completed transactions"
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">43</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">1</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Failed</span>
                    <span className="font-semibold text-red-600">1</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </MerchantLayout>
  );
}

