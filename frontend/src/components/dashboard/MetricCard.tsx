import React from 'react';
import { Card } from '../common/Card';

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
    <Card className={`relative overflow-hidden ${className}`}>
      {accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-text-secondary">{title}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>

      {/* Major numerical metrics: 28px */}
      <div className="text-[28px] font-bold text-text-primary tracking-tight leading-none mb-1">
        {value}
      </div>

      {description && (
        <p className="text-[11px] text-text-muted">{description}</p>
      )}
    </Card>
  );
};
