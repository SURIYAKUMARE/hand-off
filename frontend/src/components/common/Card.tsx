import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div
      className={`bg-surface border border-border rounded-lg ${
        noPadding ? '' : 'p-4 md:p-5'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between pb-3 border-b border-border mb-4 ${className}`}>
    <div>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
