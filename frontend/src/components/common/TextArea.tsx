import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount = false,
      maxLength = 2000,
      value,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          {label && (
            <label htmlFor={inputId} className="text-xs font-medium text-text-primary">
              {label}
              {props.required && <span className="text-priority-urgent ml-0.5">*</span>}
            </label>
          )}
          {showCharCount && (
            <span
              className={`text-xs ${
                currentLength >= maxLength ? 'text-priority-urgent font-medium' : 'text-text-muted'
              }`}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          id={inputId}
          ref={ref}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full rounded-lg border bg-surface p-3 text-xs text-text-primary placeholder:text-text-muted transition-colors resize-y min-h-[100px]
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

TextArea.displayName = 'TextArea';
