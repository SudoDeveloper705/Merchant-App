'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AdvancedFilters } from '@/components/reports/AdvancedFilters';
import { ExportButtons } from '@/components/reports/ExportButtons';
import { SummaryTotals } from '@/components/reports/SummaryTotals';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Table, TableColumn, Pagination } from '@/components/ui';
import { Badge } from '@/components/ui';
import { mockReportsService, TransactionReport, ReportFilter } from '@/services/mockReports';
import { formatCurrency, formatDate } from '@/lib/format';

export default function TransactionReportsPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<TransactionReport | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(),
    },
  });

  useEffect(() => {
    loadReport();
  }, [filters, page]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await mockReportsService.getTransactionReport(filters, page, 50);
      setReport(data);
    } catch (error) {
      console.error('Failed to load transaction report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    await mockReportsService.exportToCSV('transaction', filters);
    alert('CSV export started. Check your downloads folder.');
  };

  const handleExportPDF = async () => {
    await mockReportsService.exportToPDF('transaction', filters);
    alert('PDF export started. Check your downloads folder.');
  };

  const filterOptions = [
    { field: 'dateRange', label: 'Date Range', type: 'date' as const },
    { field: 'status', label: 'Status', type: 'select' as const, options: [
      { value: '', label: 'All Statuses' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'FAILED', label: 'Failed' },
      { value: 'DISPUTED', label: 'Disputed' },
    ]},
    { field: 'type', label: 'Type', type: 'select' as const, options: [
      { value: '', label: 'All Types' },
      { value: 'PAYMENT', label: 'Payment' },
      { value: 'REFUND', label: 'Refund' },
      { value: 'CHARGEBACK', label: 'Chargeback' },
    ]},
    { field: 'partnerId', label: 'Partner', type: 'select' as const, options: [
      { value: '', label: 'All Partners' },
      { value: 'partner-001', label: 'Tech Solutions Inc' },
      { value: 'partner-002', label: 'Global Services Ltd' },
    ]},
    { field: 'minAmount', label: 'Min Amount', type: 'number' as const },
    { field: 'maxAmount', label: 'Max Amount', type: 'number' as const },
    { field: 'search', label: 'Search', type: 'text' as const },
  ];

  const summaryTotals = report ? [
    { label: 'Total Amount', value: report.summary.totalAmount, variant: 'positive' as const },
    { label: 'Total Fees', value: report.summary.totalFees, variant: 'negative' as const },
    { label: 'Net Amount', value: report.summary.totalNet, variant: 'positive' as const },
    { label: 'Transactions', value: report.summary.totalTransactions, variant: 'default' as const },
  ] : [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'error',
      DISPUTED: 'error',
    };
    return variants[status] || 'default';
  };

  const columns: TableColumn<TransactionReport['transactions'][0]>[] = [
    {
      header: 'Date',
      accessor: (row) => formatDate(row.date, 'short'),
    },
    {
      header: 'Client',
      accessor: (row) => row.clientName,
    },
    {
      header: 'Type',
      accessor: (row) => (
        <span className="capitalize text-sm text-gray-700">{row.type.toLowerCase()}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={getStatusBadge(row.status)}>
          {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
        </Badge>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className="font-semibold text-gray-900">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Fees',
      accessor: (row) => (
        <span className="text-red-600">{formatCurrency(row.fees)}</span>
      ),
    },
    {
      header: 'Net Amount',
      accessor: (row) => (
        <span className="font-semibold text-gray-900">{formatCurrency(row.netAmount)}</span>
      ),
    },
    {
      header: 'Partner Share',
      accessor: (row) => (
        <span className="text-green-600">{formatCurrency(row.partnerShare)}</span>
      ),
    },
    {
      header: 'Merchant Share',
      accessor: (row) => (
        <span className="text-blue-600">{formatCurrency(row.merchantShare)}</span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction Reports</h1>
            <p className="mt-1 text-sm text-gray-500">Detailed transaction analysis and breakdowns</p>
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
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : report ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Transactions</p>
                    <p className="text-3xl font-bold text-gray-900">{report.summary.totalTransactions}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Amount</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(report.summary.totalAmount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Fees</p>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(report.summary.totalFees)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Net Amount</p>
                    <p className="text-3xl font-bold text-primary-600">
                      {formatCurrency(report.summary.totalNet)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="By Status" />
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(report.summary.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{status.toLowerCase()}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader title="By Type" />
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(report.summary.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{type.toLowerCase()}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <Card>
              <CardHeader
                title="Transaction Details"
                action={<ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />}
              />
              <CardContent>
                <Table
                  data={report.transactions}
                  columns={columns}
                  loading={loading}
                  emptyMessage="No transactions found"
                />
                {report.pagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={page}
                      totalPages={report.pagination.totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
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

