'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface DateRangeSelectorProps {
  value?: { start: Date; end: Date };
  onChange?: (range: { start: Date; end: Date }) => void;
  className?: string;
}

const presets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', days: -1 }, // Special case
  { label: 'Last month', days: -2 }, // Special case
];

export function DateRangeSelector({ value, onChange, className = '' }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const getDateRange = (preset: typeof presets[0]) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    let start: Date;
    
    if (preset.days === -1) {
      // This month
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset.days === -2) {
      // Last month
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0); // Last day of previous month
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date(end);
      start.setDate(start.getDate() - preset.days);
      start.setHours(0, 0, 0, 0);
    }
    
    return { start, end };
  };

  const handlePresetSelect = (preset: typeof presets[0]) => {
    const range = getDateRange(preset);
    setSelectedPreset(preset.label);
    onChange?.(range);
    setIsOpen(false);
  };

  const formatDateRange = (start: Date, end: Date) => {
    const format = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    return `${format(start)} - ${format(end)}`;
  };

  const displayValue = value
    ? formatDateRange(value.start, value.end)
    : 'Select date range';

  return (
    <div className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{displayValue}</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(preset)}
                  className={`
                    w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                    ${selectedPreset === preset.label
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 p-2">
              <p className="px-3 py-2 text-xs text-gray-500">
                Custom range coming soon
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

