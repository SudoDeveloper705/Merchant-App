'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import { Input, Select, Button } from '@/components/ui';
import { WarningBanner } from '@/components/company';
import { formatCurrency } from '@/lib/format';

interface SplitRule {
  id: string;
  partnerId: string;
  partnerName: string;
  type: 'percentage' | 'minimum_guarantee';
  percentage?: number;
  minimumAmount?: number;
}

interface SplitConfigurationFormProps {
  partnerId: string;
  partnerName: string;
  onSave: (rule: Partial<SplitRule> & { partnerId: string; partnerName: string; type: 'percentage' | 'minimum_guarantee' }) => void | Promise<void>;
  onCancel: () => void;
  existingRules?: SplitRule[];
}

export function SplitConfigurationForm({
  partnerId,
  partnerName,
  onSave,
  onCancel,
  existingRules = [],
}: SplitConfigurationFormProps) {
  const [splitType, setSplitType] = useState<'percentage' | 'minimum_guarantee'>('percentage');
  const [percentage, setPercentage] = useState<number>(0);
  const [minimumAmount, setMinimumAmount] = useState<number>(0);

  const totalPercentage = existingRules
    .filter(r => r.type === 'percentage')
    .reduce((sum, r) => sum + (r.percentage || 0), 0) + percentage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rule: SplitRule = {
      id: `rule-${Date.now()}`,
      partnerId,
      partnerName,
      type: splitType,
      ...(splitType === 'percentage' ? { percentage } : { minimumAmount }),
    };
    
    await onSave(rule);
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Split for {partnerName}</h3>
          </div>

          <Select
            label="Split Type"
            options={[
              { value: 'percentage', label: 'Percentage-Based Split' },
              { value: 'minimum_guarantee', label: 'Minimum Guarantee' },
            ]}
            value={splitType}
            onChange={(e) => setSplitType(e.target.value as 'percentage' | 'minimum_guarantee')}
            required
          />

          {splitType === 'percentage' && (
            <>
              <Input
                label="Percentage (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                required
                helperText={`Total allocated: ${totalPercentage.toFixed(2)}%`}
              />
              {totalPercentage > 100 && (
                <WarningBanner type="error" title="Total Percentage Exceeds 100%">
                  The total percentage allocated to all partners cannot exceed 100%. Current total: {totalPercentage.toFixed(2)}%
                </WarningBanner>
              )}
            </>
          )}

          {splitType === 'minimum_guarantee' && (
            <Input
              label="Minimum Guarantee Amount"
              type="number"
              min="0"
              step="0.01"
              value={minimumAmount}
              onChange={(e) => setMinimumAmount(parseFloat(e.target.value) || 0)}
              required
              helperText={`Partner will receive at least ${formatCurrency(minimumAmount)} per period`}
            />
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={splitType === 'percentage' && (percentage <= 0 || totalPercentage > 100)}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

