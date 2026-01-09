'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AdvancedFilters } from '@/components/reports/AdvancedFilters';
import { ExportButtons } from '@/components/reports/ExportButtons';
import { SummaryTotals } from '@/components/reports/SummaryTotals';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Table, TableColumn } from '@/components/ui';
import { Chart } from '@/components/dashboard/Chart';
import { mockReportsService, FinancialReport, ReportFilter } from '@/services/mockReports';
import { formatCurrency, formatDate } from '@/lib/format';

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(),
    },
  });

  useEffect(() => {
    loadReport();
  }, [filters]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await mockReportsService.getFinancialReport(filters);
      setReport(data);
    } catch (error) {
      console.error('Failed to load financial report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    await mockReportsService.exportToCSV('financial', filters);
    // In real app, this would trigger download
    alert('CSV export started. Check your downloads folder.');
  };

  const handleExportPDF = async () => {
    await mockReportsService.exportToPDF('financial', filters);
    // In real app, this would trigger download
    alert('PDF export started. Check your downloads folder.');
  };

  const filterOptions = [
    { field: 'dateRange', label: 'Date Range', type: 'date' as const },
    { field: 'status', label: 'Status', type: 'select' as const, options: [
      { value: '', label: 'All Statuses' },
      { value: 'completed', label: 'Completed' },
      { value: 'pending', label: 'Pending' },
    ]},
    { field: 'partnerId', label: 'Partner', type: 'select' as const, options: [
      { value: '', label: 'All Partners' },
      { value: 'partner-001', label: 'Tech Solutions Inc' },
      { value: 'partner-002', label: 'Global Services Ltd' },
    ]},
  ];

  const summaryTotals = report ? [
    { label: 'Total Revenue', value: report.totalRevenue, variant: 'positive' as const },
    { label: 'Total Fees', value: report.totalFees, variant: 'negative' as const },
    { label: 'Total Payouts', value: report.totalPayouts, variant: 'negative' as const },
    { label: 'Net Revenue', value: report.netRevenue, variant: 'positive' as const },
    { label: 'Transactions', value: report.transactionCount, variant: 'default' as const },
    { label: 'Avg Transaction', value: report.averageTransaction, variant: 'default' as const },
  ] : [];

  const revenueBySourceColumns: TableColumn<FinancialReport['bySource'][0]>[] = [
    {
      header: 'Source',
      accessor: (row) => row.source,
    },
    {
      header: 'Revenue',
      accessor: (row) => formatCurrency(row.revenue),
    },
    {
      header: 'Percentage',
      accessor: (row) => `${row.percentage}%`,
    },
  ];

  const revenueByPartnerColumns: TableColumn<FinancialReport['byPartner'][0]>[] = [
    {
      header: 'Partner',
      accessor: (row) => row.partnerName,
    },
    {
      header: 'Revenue',
      accessor: (row) => formatCurrency(row.revenue),
    },
    {
      header: 'Percentage',
      accessor: (row) => `${row.percentage}%`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="mt-1 text-sm text-gray-500">Comprehensive financial analysis and breakdowns</p>
          </div>
          <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
        </div>

        {/* Summary Totals - Sticky */}
        {report && <SummaryTotals totals={summaryTotals} />}

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filterOptions}
          values={filters}
          onChange={setFilters}
          onReset={() => setFilters({ dateRange: filters.dateRange })}
        />

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : report ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(report.totalRevenue)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Fees</p>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(report.totalFees)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Payouts</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {formatCurrency(report.totalPayouts)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Net Revenue</p>
                    <p className="text-3xl font-bold text-primary-600">
                      {formatCurrency(report.netRevenue)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Source */}
            <Card>
              <CardHeader
                title="Revenue by Source"
                action={<ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />}
              />
              <CardContent>
                <Table
                  data={report.bySource}
                  columns={revenueBySourceColumns}
                  emptyMessage="No data available"
                />
              </CardContent>
            </Card>

            {/* Revenue by Partner */}
            <Card>
              <CardHeader
                title="Revenue by Partner"
                action={<ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />}
              />
              <CardContent>
                <Table
                  data={report.byPartner}
                  columns={revenueByPartnerColumns}
                  emptyMessage="No data available"
                />
              </CardContent>
            </Card>

            {/* Daily Breakdown Chart */}
            <Chart
              title="Daily Revenue Breakdown"
              subtitle={`Period: ${formatDate(report.period.start, 'short')} - ${formatDate(report.period.end, 'short')}`}
              data={report.dailyBreakdown.map(day => ({
                label: formatDate(day.date, 'short'),
                value: day.revenue,
                color: '#3b82f6',
              }))}
            />

            {/* Transaction Summary */}
            <Card>
              <CardHeader title="Transaction Summary" />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{report.transactionCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Average Transaction</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(report.averageTransaction)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">No report data available</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

