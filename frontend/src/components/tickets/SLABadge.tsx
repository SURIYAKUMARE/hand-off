import React from 'react';
import { TicketPriority, TicketStatus, calculateSLA } from '@helpdesk360/shared';
import { Clock, AlertTriangle, AlertOctagon } from 'lucide-react';

export interface SLABadgeProps {
  createdAt: string;
  priority: TicketPriority;
  status: TicketStatus;
  className?: string;
}

export const SLABadge: React.FC<SLABadgeProps> = ({
  createdAt,
  priority,
  status,
  className = '',
}) => {
  const sla = calculateSLA(createdAt, priority, status);

  if (sla.isBreached) {
    return (
      <span
        title={`SLA Breached! Exceeded ${sla.slaLimitHours}h threshold.`}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] px-2 py-0.5 rounded-md ${className}`}
      >
        <AlertOctagon className="w-3 h-3 text-[#D92D20]" />
        <span>{sla.ageFormatted} (Breached)</span>
      </span>
    );
  }

  if (sla.isApproaching) {
    return (
      <span
        title={`SLA Approaching! Less than warning threshold remaining.`}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-[#B54708] bg-[#FFFAEB] border border-[#FEDF89] px-2 py-0.5 rounded-md ${className}`}
      >
        <AlertTriangle className="w-3 h-3 text-[#F79009]" />
        <span>{sla.ageFormatted} (Warning)</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-text-secondary ${className}`}
      title={`Age: ${sla.ageFormatted}`}
    >
      <Clock className="w-3 h-3 text-text-muted" />
      <span>{sla.ageFormatted}</span>
    </span>
  );
};
