'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button, Input, Select } from '@/components/ui';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';

interface FilterOption {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: Array<{ value: string; label: string }>;
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onReset: () => void;
  className?: string;
}

export function AdvancedFilters({
  filters,
  values,
  onChange,
  onReset,
  className = '',
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: string, value: any) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <Card className={className}>
      <CardHeader
        title="Advanced Filters"
        action={
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
            >
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        }
      />
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => {
              if (filter.type === 'select') {
                return (
                  <Select
                    key={filter.field}
                    label={filter.label}
                    options={filter.options || []}
                    value={values[filter.field] || ''}
                    onChange={(e) => handleChange(filter.field, e.target.value)}
                  />
                );
              }
              
              if (filter.type === 'date') {
                const dateValue = values[filter.field] || {
                  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                  end: new Date(),
                };
                return (
                  <DateRangeSelector
                    key={filter.field}
                    value={dateValue}
                    onChange={(range) => handleChange(filter.field, range)}
                  />
                );
              }
              
              if (filter.type === 'number') {
                return (
                  <Input
                    key={filter.field}
                    label={filter.label}
                    type="number"
                    value={values[filter.field] || ''}
                    onChange={(e) => handleChange(filter.field, e.target.value)}
                  />
                );
              }
              
              return (
                <Input
                  key={filter.field}
                  label={filter.label}
                  type="text"
                  value={values[filter.field] || ''}
                  onChange={(e) => handleChange(filter.field, e.target.value)}
                />
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

