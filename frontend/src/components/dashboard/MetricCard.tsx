import React from 'react';

export interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  accentColor,
  className = '',
}) => {
  return (
    <div
      className={`stat-card relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <div className="flex-1 min-w-0 pr-3">
        <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
          {title}
        </div>
        <div className="text-2xl lg:text-[26px] font-extrabold text-text-primary tracking-tight leading-tight mt-1">
          {value}
        </div>
        {description && (
          <p className="text-[11px] text-text-muted mt-1 truncate">{description}</p>
        )}
      </div>

      {icon && (
        <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 shadow-xs">
          {icon}
        </div>
      )}
    </div>
  );
};
