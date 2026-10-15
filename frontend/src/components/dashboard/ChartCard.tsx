import React from 'react';
import { Card, CardHeader } from '../common/Card';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  action,
  className = '',
}) => {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div className="flex-1 min-h-[240px] flex items-center justify-center">
        {children}
      </div>
    </Card>
  );
};
