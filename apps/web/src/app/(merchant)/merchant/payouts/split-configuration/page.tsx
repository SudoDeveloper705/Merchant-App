'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button, Input, Select, Card, CardHeader, CardContent, Badge, Table, TableColumn } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { SplitRule, SplitType, TierRule } from '@/types/payouts';

// Mock data generator
const generateMockSplitRules = (merchantId: string): SplitRule[] => {
  const partners = [
    { id: 'partner-001', name: 'Tech Solutions Inc' },
    { id: 'partner-002', name: 'Global Services Ltd' },
    { id: 'partner-003', name: 'Digital Marketing Pro' },
    { id: 'partner-004', name: 'Creative Agency' },
    { id: 'partner-005', name: 'Cloud Systems Group' },
  ];

  const rules: SplitRule[] = [];
  
  partners.forEach((partner, index) => {
    const effectiveDate = new Date();
    effectiveDate.setMonth(effectiveDate.getMonth() - index);
    
    if (index % 3 === 0) {
      // Percentage split
      rules.push({
        id: `rule-${partner.id}-${index}`,
        partnerId: partner.id,
        partnerName: partner.name,
        splitType: 'PERCENTAGE',
        percentage: 15 + (index * 5),
        priority: index + 1,
        effectiveDate: effectiveDate.toISOString(),
        isActive: index < 3,
        createdAt: effectiveDate.toISOString(),
        updatedAt: effectiveDate.toISOString(),
      });
    } else if (index % 3 === 1) {
      // Fixed amount split
      rules.push({
        id: `rule-${partner.id}-${index}`,
        partnerId: partner.id,
        partnerName: partner.name,
        splitType: 'FIXED',
        fixedAmountCents: (10000 + index * 5000) * 100, // $100 - $300
        priority: index + 1,
        effectiveDate: effectiveDate.toISOString(),
        isActive: index < 3,
        createdAt: effectiveDate.toISOString(),
        updatedAt: effectiveDate.toISOString(),
      });
    } else {
      // Tiered split
      rules.push({
        id: `rule-${partner.id}-${index}`,
        partnerId: partner.id,
        partnerName: partner.name,
        splitType: 'TIERED',
        tierRules: [
          { id: 'tier-1', minAmountCents: 0, maxAmountCents: 1000000, percentage: 10 },
          { id: 'tier-2', minAmountCents: 1000000, maxAmountCents: 5000000, percentage: 15 },
          { id: 'tier-3', minAmountCents: 5000000, percentage: 20 },
        ],
        priority: index + 1,
        effectiveDate: effectiveDate.toISOString(),
        isActive: index < 3,
        createdAt: effectiveDate.toISOString(),
        updatedAt: effectiveDate.toISOString(),
      });
    }
  });

  return rules;
};

export default function SplitConfigurationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [splitRules, setSplitRules] = useState<SplitRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<SplitRule | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    partnerId: '',
    partnerName: '',
    splitType: 'PERCENTAGE' as SplitType,
    percentage: 0,
    fixedAmountCents: 0,
    priority: 1,
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    isActive: true,
  });

  useEffect(() => {
    if (user?.merchantId) {
      loadSplitRules();
    }
  }, [user?.merchantId]);

  const loadSplitRules = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const rules = generateMockSplitRules(user?.merchantId || 'merchant-001');
      setSplitRules(rules);
    } catch (error) {
      console.error('Failed to load split rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSplitTypeBadge = (type: SplitType) => {
    const styles = {
      PERCENTAGE: 'bg-blue-100 text-blue-800',
      FIXED: 'bg-green-100 text-green-800',
      TIERED: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={styles[type]}>
        {type}
      </Badge>
    );
  };

  const handleCreate = () => {
    setEditingRule(null);
    setFormData({
      partnerId: '',
      partnerName: '',
      splitType: 'PERCENTAGE',
      percentage: 0,
      fixedAmountCents: 0,
      priority: splitRules.length + 1,
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      isActive: true,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (rule: SplitRule) => {
    setEditingRule(rule);
    setFormData({
      partnerId: rule.partnerId,
      partnerName: rule.partnerName,
      splitType: rule.splitType,
      percentage: rule.percentage || 0,
      fixedAmountCents: rule.fixedAmountCents || 0,
      priority: rule.priority,
      effectiveDate: rule.effectiveDate.split('T')[0],
      expiryDate: rule.expiryDate?.split('T')[0] || '',
      isActive: rule.isActive,
    });
    setShowCreateModal(true);
  };

  const handleSave = () => {
    // In a real app, this would call an API
    console.log('Saving split rule:', formData);
    setShowCreateModal(false);
    loadSplitRules();
  };

  const handleToggleActive = (rule: SplitRule) => {
    // In a real app, this would call an API
    const updated = splitRules.map(r =>
      r.id === rule.id ? { ...r, isActive: !r.isActive } : r
    );
    setSplitRules(updated);
  };

  const columns: TableColumn<SplitRule>[] = [
    {
      header: 'Partner',
      accessor: (row) => row.partnerName,
    },
    {
      header: 'Type',
      accessor: (row) => getSplitTypeBadge(row.splitType),
    },
    {
      header: 'Configuration',
      accessor: (row) => {
        if (row.splitType === 'PERCENTAGE') {
          return <span>{row.percentage}%</span>;
        } else if (row.splitType === 'FIXED') {
          return <span>{formatCurrency(row.fixedAmountCents || 0)}</span>;
        } else {
          return <span>{row.tierRules?.length || 0} tiers</span>;
        }
      },
    },
    {
      header: 'Priority',
      accessor: (row) => <span className="font-medium">{row.priority}</span>,
    },
    {
      header: 'Effective Date',
      accessor: (row) => formatDate(row.effectiveDate),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge className={row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleActive(row)}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Split Configuration</h1>
            <p className="mt-1 text-sm text-gray-500">Configure revenue split rules for partners</p>
          </div>
          <Button onClick={handleCreate}>Create Split Rule</Button>
        </div>

        {/* Split Rules Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Active Split Rules</h2>
          </CardHeader>
          <CardContent>
            <Table
              data={splitRules}
              columns={columns}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingRule ? 'Edit Split Rule' : 'Create Split Rule'}
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner
                  </label>
                  <Input
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    placeholder="Enter partner name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Split Type
                  </label>
                  <Select
                    value={formData.splitType}
                    onChange={(e) => setFormData({ ...formData, splitType: e.target.value as SplitType })}
                    options={[
                      { value: 'PERCENTAGE', label: 'Percentage' },
                      { value: 'FIXED', label: 'Fixed Amount' },
                      { value: 'TIERED', label: 'Tiered' },
                    ]}
                  />
                </div>

                {formData.splitType === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Percentage (%)
                    </label>
                    <Input
                      type="number"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                )}

                {formData.splitType === 'FIXED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fixed Amount ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.fixedAmountCents / 100}
                      onChange={(e) => setFormData({ ...formData, fixedAmountCents: (parseFloat(e.target.value) || 0) * 100 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                  <p className="mt-1 text-xs text-gray-500">Lower numbers are applied first</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Date
                  </label>
                  <Input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingRule ? 'Update' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}

