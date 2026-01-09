'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LegalTextBlock } from '@/components/settings/LegalTextBlock';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { mockSettingsService, LegalDocument } from '@/services/mockSettings';

export default function LegalTermsPage() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await mockSettingsService.getLegalDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load legal documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (documentId: string) => {
    try {
      await mockSettingsService.acceptLegalDocument(documentId);
      await loadDocuments();
    } catch (error) {
      console.error('Failed to accept document:', error);
    }
  };

  const getTypeBadge = (type: LegalDocument['type']) => {
    const variants = {
      terms: 'info' as const,
      privacy: 'success' as const,
      disclaimer: 'warning' as const,
      policy: 'default' as const,
    };
    return variants[type] || 'default';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Legal Terms & Disclaimers</h1>
          <p className="mt-1 text-sm text-gray-500">Review and accept legal documents and disclaimers</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Accepted</p>
                <p className="text-3xl font-bold text-green-600">
                  {documents.filter(d => d.accepted).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {documents.filter(d => !d.accepted).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {documents.length > 0
                    ? new Date(documents[0].lastUpdated).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <FormSection title="Legal Documents">
          <div className="space-y-6">
            {documents.map((document) => (
              <div key={document.id} className="relative">
                <div className="absolute top-4 right-4">
                  <Badge variant={getTypeBadge(document.type)}>
                    {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                  </Badge>
                  {document.accepted && (
                    <Badge variant="success" className="ml-2">
                      Accepted
                    </Badge>
                  )}
                </div>
                <LegalTextBlock
                  title={document.title}
                  lastUpdated={document.lastUpdated}
                  content={document.content}
                  accepted={document.accepted}
                  onAccept={() => handleAccept(document.id)}
                />
              </div>
            ))}
          </div>
        </FormSection>

        {/* Important Notice */}
        <Card>
          <CardHeader title="Important Notice" />
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Please Note:</strong> It is important to review all legal documents carefully before accepting.
                These documents govern your use of the service and outline your rights and responsibilities.
                If you have any questions, please contact our legal team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

