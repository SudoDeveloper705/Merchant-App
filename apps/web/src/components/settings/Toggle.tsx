'use client';

import { useState, useEffect } from 'react';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  saving?: boolean;
  className?: string;
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  saving = false,
  className = '',
}: ToggleProps) {
  const [localChecked, setLocalChecked] = useState(checked);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setLocalChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    if (disabled || saving) return;
    
    const newValue = !localChecked;
    setLocalChecked(newValue);
    onChange(newValue);
    
    // Show saved feedback
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className={`flex items-start justify-between py-4 ${className}`}>
      <div className="flex-1 mr-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-900 cursor-pointer" onClick={handleToggle}>
            {label}
          </label>
          {saving && (
            <span className="inline-flex items-center text-xs text-blue-600">
              <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          )}
          {showSaved && !saving && (
            <span className="inline-flex items-center text-xs text-green-600">
              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Saved
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={localChecked}
          onChange={handleToggle}
          disabled={disabled || saving}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
      </label>
    </div>
  );
}

