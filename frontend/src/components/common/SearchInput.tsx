import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, className = '', placeholder = 'Search tickets...', ...props }, ref) => {
    return (
      <div className={`relative flex items-center ${className}`}>
        <div className="absolute left-3 text-text-muted pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 text-text-muted hover:text-text-primary p-0.5 rounded transition-colors focus:outline-none"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
