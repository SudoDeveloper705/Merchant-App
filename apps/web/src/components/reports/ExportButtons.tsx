'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface ExportButtonsProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
  className?: string;
}

export function ExportButtons({ onExportCSV, onExportPDF, className = '' }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleCSVExport = async () => {
    setExporting('csv');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate export
      onExportCSV();
    } finally {
      setExporting(null);
    }
  };

  const handlePDFExport = async () => {
    setExporting('pdf');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate export
      onExportPDF();
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Button
        variant="outline"
        onClick={handleCSVExport}
        isLoading={exporting === 'csv'}
        disabled={exporting !== null}
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </Button>
      <Button
        variant="outline"
        onClick={handlePDFExport}
        isLoading={exporting === 'pdf'}
        disabled={exporting !== null}
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Export PDF
      </Button>
    </div>
  );
}

