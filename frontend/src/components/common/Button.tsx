import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      iconLeft,
      iconRight,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const sizeStyles = {
      sm: 'h-8 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-xs gap-2',
      lg: 'h-10 px-4 text-sm gap-2 rounded-xl',
    };

    const variantStyles = {
      primary: 'bg-brand hover:bg-brand-hover text-white active:bg-brand-active border border-transparent shadow-xs',
      secondary:
        'bg-surface hover:bg-surface-hover text-text-primary border border-border hover:border-border-strong active:bg-surface-muted shadow-xs',
      destructive:
        'bg-rose-600 hover:bg-rose-700 text-white active:bg-rose-800 border border-transparent shadow-xs',
      ghost: 'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          iconLeft && <span className="flex-shrink-0">{iconLeft}</span>
        )}
        <span>{children}</span>
        {!isLoading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
