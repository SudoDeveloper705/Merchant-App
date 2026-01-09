'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FormSection, FormField } from '@/components/company';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { mockCompanyService, PartnerCompany } from '@/services/mockCompany';
import { formatCurrency, formatDate } from '@/lib/format';

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<PartnerCompany | null>(null);

  useEffect(() => {
    if (params.id) {
      loadPartner();
    }
  }, [params.id]);

  const loadPartner = async () => {
    setLoading(true);
    try {
      const data = await mockCompanyService.getPartnerCompany(params.id as string);
      setPartner(data);
    } catch (error) {
      console.error('Failed to load partner:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!partner) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Partner not found</p>
            <Button onClick={() => router.push('/company/partners')} className="mt-4">
              Back to Partners
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: PartnerCompany['status']) => {
    const variants = {
      active: 'success' as const,
      inactive: 'default' as const,
      pending: 'warning' as const,
    };
    return variants[status] || 'default';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/company/partners')}
              className="mb-2"
            >
              ← Back to Partners
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{partner.name}</h1>
            <p className="mt-1 text-sm text-gray-500">Partner company details</p>
          </div>
          <Badge variant={getStatusBadge(partner.status)}>
            {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
          </Badge>
        </div>

        {/* Company Information */}
        <FormSection title="Company Information" readOnly={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Company Name" readOnly={true}>
              <div className="text-gray-900">{partner.name}</div>
            </FormField>
            <FormField label="Legal Name" readOnly={true}>
              <div className="text-gray-900">{partner.legalName}</div>
            </FormField>
            <FormField label="Email" readOnly={true}>
              <div className="text-gray-900">{partner.email}</div>
            </FormField>
            <FormField label="Phone" readOnly={true}>
              <div className="text-gray-900">{partner.phone}</div>
            </FormField>
            <FormField label="Country" readOnly={true}>
              <div className="text-gray-900">{partner.country}</div>
            </FormField>
            <FormField label="Joined" readOnly={true}>
              <div className="text-gray-900">{formatDate(partner.joinedAt, 'short')}</div>
            </FormField>
          </div>
        </FormSection>

        {/* Address */}
        <FormSection title="Business Address" readOnly={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Street Address" readOnly={true}>
              <div className="text-gray-900">{partner.address.street}</div>
            </FormField>
            <FormField label="City" readOnly={true}>
              <div className="text-gray-900">{partner.address.city}</div>
            </FormField>
            <FormField label="State / Province" readOnly={true}>
              <div className="text-gray-900">{partner.address.state || '—'}</div>
            </FormField>
            <FormField label="ZIP / Postal Code" readOnly={true}>
              <div className="text-gray-900">{partner.address.zipCode}</div>
            </FormField>
            <FormField label="Country" readOnly={true}>
              <div className="text-gray-900">{partner.address.country}</div>
            </FormField>
          </div>
        </FormSection>

        {/* Statistics */}
        <FormSection title="Partnership Statistics" readOnly={true}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Agreements</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{partner.agreementsCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(partner.totalRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Partnership Duration</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {Math.floor((Date.now() - new Date(partner.joinedAt).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </FormSection>
      </div>
    </DashboardLayout>
  );
}

