import React from 'react';
import { TicketPriority, PRIORITY_CONFIG } from '@helpdesk360/shared';
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

export interface PriorityChipProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const PriorityChip: React.FC<PriorityChipProps> = ({
  priority,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  const getIcon = () => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="w-3 h-3 text-[#D92D20]" />;
      case 'HIGH':
        return <ArrowUp className="w-3 h-3 text-[#F79009]" />;
      case 'MEDIUM':
        return <ArrowRight className="w-3 h-3 text-[#2E90FA]" />;
      case 'LOW':
        return <ArrowDown className="w-3 h-3 text-[#667085]" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeStyles[size]} ${className}`}
      style={{
        backgroundColor: config.badgeBg,
        borderColor: config.badgeBorder,
        color: config.badgeText,
      }}
    >
      {showIcon && getIcon()}
      <span>{config.label}</span>
    </span>
  );
};
