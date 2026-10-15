import React from 'react';
import { TicketEventItem } from '@helpdesk360/shared';
import { CheckCircle2, UserCheck, PlusCircle, MessageSquare, ArrowRightCircle } from 'lucide-react';

export interface TicketTimelineProps {
  events: TicketEventItem[];
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-xs text-text-muted py-4 text-center">
        No recorded activity yet.
      </div>
    );
  }

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getEventIcon = (type: string, newValue?: string | null) => {
    switch (type) {
      case 'CREATED':
        return <PlusCircle className="w-3.5 h-3.5 text-brand" />;
      case 'ASSIGNED':
        return <UserCheck className="w-3.5 h-3.5 text-[#2E90FA]" />;
      case 'STATUS_CHANGED':
        if (newValue === 'RESOLVED' || newValue === 'CLOSED') {
          return <CheckCircle2 className="w-3.5 h-3.5 text-[#027A48]" />;
        }
        return <ArrowRightCircle className="w-3.5 h-3.5 text-[#F79009]" />;
      case 'COMMENTED':
        return <MessageSquare className="w-3.5 h-3.5 text-text-muted" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  const getEventDescription = (ev: TicketEventItem) => {
    switch (ev.eventType) {
      case 'CREATED':
        return 'Ticket created';
      case 'ASSIGNED':
        return `Assigned to ${ev.newValue || 'Unassigned'}`;
      case 'STATUS_CHANGED':
        return `Moved to ${ev.newValue?.replace('_', ' ')}`;
      case 'COMMENTED':
        return 'Comment posted';
      default:
        return 'Ticket updated';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
      {events.map((ev) => (
        <div key={ev.id} className="relative flex items-start gap-3">
          <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shadow-xs">
            {getEventIcon(ev.eventType, ev.newValue)}
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-text-primary">
              {getEventDescription(ev)}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
              <span>{ev.actor?.name || 'System'}</span>
              <span>•</span>
              <span className="text-text-muted">{formatEventDate(ev.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
