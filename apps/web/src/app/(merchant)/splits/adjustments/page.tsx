'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FormSection, WarningBanner } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { Badge } from '@/components/ui';
import { mockSettlementService, Payout, Adjustment } from '@/services/mockSettlement';
import { formatCurrency, formatDate } from '@/lib/format';

export default function AdjustmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'increase' as 'increase' | 'decrease' | 'override',
    amount: 0,
    reason: '',
  });

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const data = await mockSettlementService.getPendingPayouts();
      setPayouts(data);
    } catch (error) {
      console.error('Failed to load payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPayout) return;
    
    try {
      await mockSettlementService.createAdjustment({
        payoutId: selectedPayout.id,
        type: adjustmentData.type,
        amount: adjustmentData.amount,
        reason: adjustmentData.reason,
        createdBy: 'current-user',
      });
      
      await loadPayouts();
      setShowForm(false);
      setSelectedPayout(null);
      setAdjustmentData({ type: 'increase', amount: 0, reason: '' });
    } catch (error) {
      console.error('Failed to create adjustment:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payout Adjustments & Overrides</h1>
          <p className="mt-1 text-sm text-gray-500">Make manual adjustments to pending payouts</p>
        </div>

        {/* Warning Banner */}
        <WarningBanner type="error" title="Financial Impact Warning">
          <p className="mb-2">
            Adjustments to payouts have direct financial impact and will be recorded in the audit trail.
            All adjustments require proper authorization and documentation.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Increases add to the payout amount</li>
            <li>Decreases reduce the payout amount</li>
            <li>Overrides replace the calculated amount entirely</li>
          </ul>
        </WarningBanner>

        {/* Pending Payouts List */}
        <FormSection title="Pending Payouts Available for Adjustment">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <Card key={payout.id}>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{payout.partnerName}</h3>
                          <Badge variant="warning">Pending</Badge>
                          {payout.adjustments.length > 0 && (
                            <Badge variant="info">{payout.adjustments.length} adjustment(s)</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current Amount</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(payout.amount, payout.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Scheduled Date</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(payout.scheduledDate, 'short')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Reference</p>
                            <p className="font-mono text-xs text-gray-600">{payout.reference}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Invoices</p>
                            <p className="font-medium text-gray-900">
                              {payout.relatedInvoices.length} invoice(s)
                            </p>
                          </div>
                        </div>
                        {payout.adjustments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-600 mb-2">Existing Adjustments:</p>
                            <div className="space-y-2">
                              {payout.adjustments.map((adj) => (
                                <div key={adj.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-medium">
                                        {adj.type === 'increase' ? '+' : adj.type === 'decrease' ? '-' : '='}
                                        {formatCurrency(adj.amount)}
                                      </span>
                                      <span className="text-gray-600 ml-2">- {adj.reason}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(adj.createdAt, 'short')}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedPayout(payout);
                            setShowForm(true);
                          }}
                        >
                          Add Adjustment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </FormSection>

        {/* Adjustment Form */}
        {showForm && selectedPayout && (
          <Card>
            <CardHeader title={`Create Adjustment for ${selectedPayout.partnerName}`} />
            <CardContent>
              <form onSubmit={handleCreateAdjustment} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>Current Payout Amount:</strong> {formatCurrency(selectedPayout.amount, selectedPayout.currency)}
                  </p>
                </div>

                <Select
                  label="Adjustment Type"
                  options={[
                    { value: 'increase', label: 'Increase Amount' },
                    { value: 'decrease', label: 'Decrease Amount' },
                    { value: 'override', label: 'Override Amount' },
                  ]}
                  value={adjustmentData.type}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value as any })}
                  required
                />

                <Input
                  label="Adjustment Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={adjustmentData.amount}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: parseFloat(e.target.value) || 0 })}
                  required
                  helperText={
                    adjustmentData.type === 'override'
                      ? `New total amount will be ${formatCurrency(adjustmentData.amount)}`
                      : adjustmentData.type === 'increase'
                      ? `New total will be ${formatCurrency(selectedPayout.amount + adjustmentData.amount)}`
                      : `New total will be ${formatCurrency(selectedPayout.amount - adjustmentData.amount)}`
                  }
                />

                <Textarea
                  label="Reason for Adjustment"
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  required
                  rows={4}
                  helperText="Provide detailed reason for this adjustment. This will be recorded in the audit trail."
                />

                {adjustmentData.type === 'override' && (
                  <WarningBanner type="warning" title="Override Warning">
                    Overriding the payout amount will replace the calculated amount entirely. This action cannot be easily undone.
                  </WarningBanner>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedPayout(null);
                      setAdjustmentData({ type: 'increase', amount: 0, reason: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Adjustment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

