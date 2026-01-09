'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Table, TableColumn } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Pagination } from '@/components/ui';
import { Button } from '@/components/ui';
import { mockCompanyService, PartnerCompany } from '@/services/mockCompany';
import { formatCurrency, formatDate } from '@/lib/format';

export default function PartnerCompaniesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<PartnerCompany[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPartners();
  }, [page]);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const response = await mockCompanyService.getPartnerCompanies(page, 20);
      setPartners(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: PartnerCompany['status']) => {
    const variants = {
      active: 'success' as const,
      inactive: 'default' as const,
      pending: 'warning' as const,
    };
    return variants[status] || 'default';
  };

  const columns: TableColumn<PartnerCompany>[] = [
    {
      header: 'Company',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.legalName}</div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: (row) => (
        <div>
          <div className="text-sm text-gray-900">{row.email}</div>
          <div className="text-sm text-gray-500">{row.phone}</div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: (row) => (
        <div>
          <div className="text-sm text-gray-900">{row.address.city}, {row.address.state}</div>
          <div className="text-sm text-gray-500">{row.country}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={getStatusBadge(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Agreements',
      accessor: (row) => (
        <span className="font-medium text-gray-900">{row.agreementsCount}</span>
      ),
    },
    {
      header: 'Total Revenue',
      accessor: (row) => formatCurrency(row.totalRevenue),
    },
    {
      header: 'Joined',
      accessor: (row) => formatDate(row.joinedAt, 'short'),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/company/partners/${row.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Companies</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your partner relationships</p>
          </div>
          <Button onClick={() => console.log('Add partner')}>
            Add Partner
          </Button>
        </div>

        {/* Partners Table */}
        <Card>
          <CardHeader title="All Partners" />
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Table
                  data={partners}
                  columns={columns}
                  emptyMessage="No partners found"
                />
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

