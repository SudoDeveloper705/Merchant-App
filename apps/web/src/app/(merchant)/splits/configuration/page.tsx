'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SplitConfigurationForm } from '@/components/splits/SplitConfigurationForm';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button, Badge, Table, TableColumn } from '@/components/ui';
import { WarningBanner } from '@/components/company';
import { mockSettlementService, SplitRule } from '@/services/mockSettlement';
import { formatCurrency, formatDate } from '@/lib/format';

export default function SplitConfigurationPage() {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<SplitRule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await mockSettlementService.getSplitRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to load split rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async (rule: Partial<SplitRule> & { partnerId: string; partnerName: string; type: 'percentage' | 'minimum_guarantee' }) => {
    try {
      // Convert the form rule to full SplitRule with all required fields
      const fullRule: Partial<SplitRule> = {
        ...rule,
        effectiveDate: rule.effectiveDate || new Date().toISOString(),
        endDate: rule.endDate || null,
        status: (rule.status as 'active' | 'inactive') || 'active',
        createdAt: rule.createdAt || new Date().toISOString(),
        createdBy: rule.createdBy || 'current-user',
      };
      await mockSettlementService.saveSplitRule(fullRule);
      await loadRules();
      setShowForm(false);
      setSelectedPartner(null);
    } catch (error) {
      console.error('Failed to save split rule:', error);
    }
  };

  const handleAddRule = (partnerId: string, partnerName: string) => {
    setSelectedPartner({ id: partnerId, name: partnerName });
    setShowForm(true);
  };

  const totalPercentage = rules
    .filter(r => r.type === 'percentage' && r.status === 'active')
    .reduce((sum, r) => sum + (r.percentage || 0), 0);

  const columns: TableColumn<SplitRule>[] = [
    {
      header: 'Partner',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.partnerName}</div>
          <div className="text-xs text-gray-500">ID: {row.partnerId}</div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => (
        <Badge variant={row.type === 'percentage' ? 'info' : 'warning'}>
          {row.type === 'percentage' ? 'Percentage' : 'Minimum Guarantee'}
        </Badge>
      ),
    },
    {
      header: 'Configuration',
      accessor: (row) => (
        <div className="text-sm">
          {row.type === 'percentage' ? (
            <span className="font-medium text-gray-900">{row.percentage}%</span>
          ) : (
            <span className="font-medium text-gray-900">{formatCurrency(row.minimumAmount || 0)}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Effective Date',
      accessor: (row) => formatDate(row.effectiveDate, 'short'),
    },
    {
      header: 'End Date',
      accessor: (row) => row.endDate ? formatDate(row.endDate, 'short') : '—',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedPartner({ id: row.partnerId, name: row.partnerName });
            setShowForm(true);
          }}
        >
          Edit
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
            <h1 className="text-3xl font-bold text-gray-900">Split Configuration</h1>
            <p className="mt-1 text-sm text-gray-500">Configure revenue split rules for partners</p>
          </div>
          <Button onClick={() => handleAddRule('new-partner', 'New Partner')}>
            Add Split Rule
          </Button>
        </div>

        {/* Warning if total percentage exceeds 100% */}
        {totalPercentage > 100 && (
          <WarningBanner type="error" title="Configuration Error">
            Total percentage allocation ({totalPercentage.toFixed(2)}%) exceeds 100%. Please adjust split rules.
          </WarningBanner>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Active Rules</p>
                <p className="text-3xl font-bold text-gray-900">
                  {rules.filter(r => r.status === 'active').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Percentage Allocated</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalPercentage.toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Minimum Guarantees</p>
                <p className="text-3xl font-bold text-gray-900">
                  {rules.filter(r => r.type === 'minimum_guarantee' && r.status === 'active').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Split Configuration Form */}
        {showForm && selectedPartner && (
          <SplitConfigurationForm
            partnerId={selectedPartner.id}
            partnerName={selectedPartner.name}
            onSave={handleSaveRule}
            onCancel={() => {
              setShowForm(false);
              setSelectedPartner(null);
            }}
            existingRules={rules}
          />
        )}

        {/* Split Rules Table */}
        <FormSection title="Active Split Rules" readOnly={true}>
          <Table
            data={rules}
            columns={columns}
            loading={loading}
            emptyMessage="No split rules configured"
          />
        </FormSection>
      </div>
    </DashboardLayout>
  );
}

