'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FormSection } from '@/components/company';
import { WarningBanner } from '@/components/company';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { mockCompanyService, ComplianceItem } from '@/services/mockCompany';
import { formatDate } from '@/lib/format';

export default function CompliancePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ComplianceItem[]>([]);

  useEffect(() => {
    loadCompliance();
  }, []);

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const data = await mockCompanyService.getComplianceItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to load compliance items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await mockCompanyService.acceptComplianceItem(id);
      setItems(items.map(item =>
        item.id === id
          ? { ...item, accepted: true, acceptedAt: new Date().toISOString() }
          : item
      ));
    } catch (error) {
      console.error('Failed to accept compliance item:', error);
    }
  };

  const getTypeIcon = (type: ComplianceItem['type']) => {
    const icons = {
      terms: '📋',
      privacy: '🔒',
      gdpr: '🇪🇺',
      tax: '💰',
      financial: '💳',
    };
    return icons[type] || '📄';
  };

  const getTypeLabel = (type: ComplianceItem['type']) => {
    const labels = {
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      gdpr: 'GDPR',
      tax: 'Tax Compliance',
      financial: 'Financial Regulations',
    };
    return labels[type] || type;
  };

  const unacceptedRequired = items.filter(item => item.required && !item.accepted);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance & Disclaimers</h1>
          <p className="mt-1 text-sm text-gray-500">Review and accept required legal documents</p>
        </div>

        {/* Warning Banner for Unaccepted Items */}
        {unacceptedRequired.length > 0 && (
          <WarningBanner
            type="legal"
            title="Action Required"
          >
            <p className="mb-2">
              You have {unacceptedRequired.length} required compliance document{unacceptedRequired.length > 1 ? 's' : ''} that need{unacceptedRequired.length === 1 ? 's' : ''} to be accepted.
            </p>
            <ul className="list-disc list-inside space-y-1">
              {unacceptedRequired.map(item => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          </WarningBanner>
        )}

        {/* Compliance Items */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            items.map((item) => (
              <FormSection
                key={item.id}
                title={
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <span>{item.title}</span>
                  </div>
                }
                subtitle={getTypeLabel(item.type)}
                readOnly={item.accepted}
                action={
                  item.accepted ? (
                    <Badge variant="success">Accepted</Badge>
                  ) : (
                    <Button
                      onClick={() => handleAccept(item.id)}
                      variant={item.required ? 'primary' : 'outline'}
                    >
                      {item.required ? 'Accept Required' : 'Accept'}
                    </Button>
                  )
                }
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Version</p>
                      <p className="mt-1 text-sm text-gray-900">{item.version}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Last Updated</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(item.lastUpdated, 'short')}
                      </p>
                    </div>
                    {item.accepted && item.acceptedAt && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">Accepted On</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(item.acceptedAt, 'short')}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-500">Status</p>
                      <p className="mt-1">
                        {item.required ? (
                          <Badge variant="error">Required</Badge>
                        ) : (
                          <Badge variant="info">Optional</Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  {!item.accepted && item.required && (
                    <WarningBanner type="warning" title="Required Document">
                      This document must be accepted to continue using the platform.
                    </WarningBanner>
                  )}
                </div>
              </FormSection>
            ))
          )}
        </div>

        {/* Legal Disclaimer */}
        <WarningBanner type="legal" title="Legal Disclaimer">
          <p className="mb-2">
            By using this platform, you agree to comply with all applicable laws and regulations.
            Please review all compliance documents carefully and consult with legal counsel if needed.
          </p>
          <p className="text-xs">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </WarningBanner>
      </div>
    </DashboardLayout>
  );
}

