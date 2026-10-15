import React from 'react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, id, className = '', disabled, ...props }, ref) => {
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
          {leftIcon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`w-full h-9 rounded-lg border bg-surface text-xs text-text-primary placeholder:text-text-muted transition-colors
              ${leftIcon ? 'pl-9' : 'pl-3'}
              ${rightIcon ? 'pr-9' : 'pr-3'}
              ${
                error
                  ? 'border-priority-urgent focus:border-priority-urgent focus:ring-1 focus:ring-priority-urgent'
                  : 'border-border focus:border-brand focus:ring-1 focus:ring-brand'
              }
              disabled:bg-[#F2F4F7] disabled:text-text-muted disabled:cursor-not-allowed
              outline-none
              ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-priority-urgent flex items-center gap-1 mt-0.5">
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

TextInput.displayName = 'TextInput';
