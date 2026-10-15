import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  highlightUrgent?: boolean;
  isUrgentRow?: (item: T) => boolean;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortColumn,
  sortOrder,
  onSort,
  emptyState,
  highlightUrgent = false,
  isUrgentRow,
  className = '',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="w-full">
        {emptyState || (
          <EmptyState title="No records found" description="There are no items matching this view." />
        )}
      </div>
    );
  }

  const handleSort = (col: Column<T>) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-border bg-surface ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary sticky top-0 z-10 select-none">
          <tr>
            {columns.map((col) => {
              const isSorted = sortColumn === col.key;
              return (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col)}
                  className={`px-4 py-3 font-semibold text-[11px] uppercase tracking-wider ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${
                    col.sortable
                      ? 'cursor-pointer hover:bg-[#EEF0F4] hover:text-text-primary transition-colors'
                      : ''
                  } ${col.className || ''}`}
                >
                  <div
                    className={`inline-flex items-center gap-1.5 ${
                      col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''
                    }`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-text-muted">
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-brand" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-brand" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item, index) => {
            const isUrgent = highlightUrgent && isUrgentRow ? isUrgentRow(item) : false;

            return (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${
                  isUrgent
                    ? 'bg-[#FEF3F2]/40 hover:bg-[#FEE4E2]/50 border-l-4 border-l-[#D92D20]'
                    : 'hover:bg-[#F9FAFB]'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-text-primary ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.render
                      ? col.render(item, index)
                      : (item as any)[col.key] !== undefined
                      ? String((item as any)[col.key])
                      : '—'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
