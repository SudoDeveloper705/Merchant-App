'use client';

import { ReactNode } from 'react';
import { Input, Select, Textarea } from '@/components/ui';
import { ErrorText } from '@/components/ui';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  readOnly?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  helperText,
  readOnly = false,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {readOnly && (
          <span className="ml-2 text-xs font-normal text-gray-500">(Read-only)</span>
        )}
      </label>
      <div className={readOnly ? 'opacity-75' : ''}>
        {children}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

