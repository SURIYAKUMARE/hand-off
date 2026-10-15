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
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizeStyles = {
      sm: 'h-8 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-xs font-semibold gap-2',
      lg: 'h-10 px-4 text-sm font-semibold gap-2',
    };

    const variantStyles = {
      primary: 'bg-brand hover:bg-brand-hover text-white active:bg-brand-active border border-transparent shadow-sm',
      secondary:
        'bg-surface hover:bg-background text-text-primary border border-border hover:border-[#D0D5DD] active:bg-[#F2F4F7]',
      destructive:
        'bg-[#D92D20] hover:bg-[#B42318] text-white active:bg-[#912018] border border-transparent shadow-sm',
      ghost: 'bg-transparent hover:bg-[#F2F4F7] text-text-secondary hover:text-text-primary',
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
