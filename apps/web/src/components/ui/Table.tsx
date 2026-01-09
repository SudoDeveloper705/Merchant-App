'use client';

import { ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';

export interface TableColumn<T> {
  header: string | ReactNode | (() => ReactNode);
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  keyExtractor?: (row: T, index: number) => string | number;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  onRowClick,
  className = '',
  keyExtractor,
}: TableProps<T>) {
  const renderCell = (row: T, column: TableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    const value = row[column.accessor];
    return value !== null && value !== undefined ? String(value) : '—';
  };

  const getRowKey = (row: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(row, index);
    return (row as any).id ?? index;
  };

  // Ensure data and columns are arrays
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <LoadingSpinner text="Loading data..." />
      </div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <EmptyState
          icon={emptyIcon}
          title={emptyMessage}
          description="Try adjusting your filters or check back later."
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {safeColumns.map((column, index) => {
                const headerContent = typeof column.header === 'function' 
                  ? column.header() 
                  : column.header;
                return (
                <th
                  key={index}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.className || ''}
                  `}
                >
                  {headerContent}
                </th>
              );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeData.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
              >
                {safeColumns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`
                      px-6 py-4 whitespace-nowrap text-sm text-gray-900
                      ${column.className || ''}
                    `}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

