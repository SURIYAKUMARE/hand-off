import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface TablePaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  total,
  page,
  limit,
  onPageChange,
  className = '',
}) => {
  if (total === 0) return null;

  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 bg-surface border-t border-border text-xs text-text-secondary ${className}`}
    >
      <div>
        Showing <span className="font-semibold text-text-primary">{startItem}</span>–
        <span className="font-semibold text-text-primary">{endItem}</span> of{' '}
        <span className="font-semibold text-text-primary">{total}</span> tickets
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          iconLeft={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>
        <span className="px-2 text-xs font-medium text-text-primary">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          iconRight={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
