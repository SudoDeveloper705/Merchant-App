'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';

export default function ReportsPage() {
  const router = useRouter();

  const reportTypes = [
    {
      title: 'Financial Reports',
      description: 'Comprehensive financial analysis including revenue, fees, payouts, and net revenue breakdowns',
      route: '/reports/financial',
      icon: '💰',
      features: [
        'Revenue by source',
        'Revenue by partner',
        'Daily breakdown charts',
        'Fee analysis',
        'Payout summaries',
      ],
    },
    {
      title: 'Transaction Reports',
      description: 'Detailed transaction analysis with filters, status breakdowns, and partner share details',
      route: '/reports/transactions',
      icon: '📊',
      features: [
        'Transaction details',
        'Status breakdowns',
        'Type analysis',
        'Partner share tracking',
        'Advanced filtering',
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Exports</h1>
          <p className="mt-1 text-sm text-gray-500">Generate and export comprehensive financial reports</p>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <Card key={report.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(report.route)}>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="text-4xl flex-shrink-0">{report.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{report.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                    <ul className="space-y-1 mb-4">
                      {report.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-500 flex items-center">
                          <svg className="h-3 w-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => router.push(report.route)}>
                      View Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Info */}
        <Card>
          <CardHeader title="Export Options" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">CSV Export</h4>
                <p className="text-sm text-gray-600">
                  Export report data as CSV files for analysis in Excel or other spreadsheet applications.
                  Includes all filtered data and summary totals.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">PDF Export</h4>
                <p className="text-sm text-gray-600">
                  Generate formatted PDF reports suitable for printing or sharing. Includes charts,
                  tables, and summary information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

