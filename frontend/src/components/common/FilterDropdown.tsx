import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  className = '',
}) => {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-9 pl-3 pr-8 rounded-lg border border-border bg-surface text-xs text-text-primary hover:border-[#D0D5DD] focus:border-brand focus:ring-1 focus:ring-brand appearance-none cursor-pointer outline-none transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 text-text-muted pointer-events-none flex items-center">
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
