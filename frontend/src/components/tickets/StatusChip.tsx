import React from 'react';
import { TicketStatus, STATUS_CONFIG } from '@helpdesk360/shared';

export interface StatusChipProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'sm', className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
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
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.indicatorColor }}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
};
