import React from 'react';
import { Loader2 } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      'aria-label': ariaLabel,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeStyles = {
      sm: 'w-7 h-7 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-9 h-9 text-base',
    };

    const variantStyles = {
      primary: 'bg-brand hover:bg-brand-hover text-white',
      secondary: 'bg-surface hover:bg-background text-text-secondary hover:text-text-primary border border-border',
      ghost: 'bg-transparent hover:bg-[#F2F4F7] text-text-secondary hover:text-text-primary',
    };

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
