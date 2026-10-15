import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, options, error, helperText, placeholder, id, className = '', disabled, ...props },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text-primary">
            {label}
            {props.required && <span className="text-priority-urgent ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`w-full h-9 rounded-lg border bg-surface px-3 pr-8 text-xs text-text-primary appearance-none cursor-pointer transition-colors
              ${
                error
                  ? 'border-priority-urgent focus:border-priority-urgent focus:ring-1 focus:ring-priority-urgent'
                  : 'border-border focus:border-brand focus:ring-1 focus:ring-brand'
              }
              disabled:bg-[#F2F4F7] disabled:text-text-muted disabled:cursor-not-allowed
              outline-none
              ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 text-text-muted pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-priority-urgent mt-0.5">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-text-muted mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
