import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { queueOfflineComment } from '../../offline/syncEngine';
import { TicketDetail as TicketDetailType, CommentItem, CATEGORY_LABELS } from '@helpdesk360/shared';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { StatusChip } from '../../components/tickets/StatusChip';
import { PriorityChip } from '../../components/tickets/PriorityChip';
import { TicketTimeline } from '../../components/tickets/TicketTimeline';
import { CommentThread } from '../../components/tickets/CommentThread';
import { Card, CardHeader } from '../../components/common/Card';
import { TicketDetailSkeleton } from '../../components/common/Skeleton';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { SLABadge } from '../../components/tickets/SLABadge';
import { Calendar, User, Laptop, Clock, ShieldAlert } from 'lucide-react';

export const EmployeeTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isOnline } = useNetwork();

  const [localComments, setLocalComments] = React.useState<CommentItem[]>([]);

  const { data, isLoading, isError, error, refetch } = useQuery<{ success: boolean; ticket: TicketDetailType }>({
    queryKey: ['ticket', id],
    queryFn: async () => {
      return await api.get<{ success: boolean; ticket: TicketDetailType }>(`/tickets/${id}`);
    },
    retry: isOnline ? 1 : false,
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await api.post(`/tickets/${id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setLocalComments([]);
      toast.success('Your comment has been posted.');
    },
    onError: (err: any, content: string) => {
      const isNetworkFailure =
        !navigator.onLine ||
        err?.name === 'TypeError' ||
        err?.message?.toLowerCase().includes('fetch') ||
        err?.message?.toLowerCase().includes('network');

      if (isNetworkFailure) {
        const queued = queueOfflineComment(id!, content, {
          id: user?.id || 'emp',
          name: user?.name || 'Employee',
          role: user?.role || 'EMPLOYEE',
        });
        setLocalComments((prev) => [...prev, queued]);
        toast.info('Connection interrupted. Comment stored locally and will sync once back online.', 'Saved Offline');
      } else {
        toast.error(err?.message || 'Failed to post comment.');
      }
    },
  });

  if (isLoading) {
    return <TicketDetailSkeleton />;
  }

  if (isError) {
    const isForbidden = (error as any)?.status === 403;
    if (isForbidden) {
      return (
        <div className="max-w-md mx-auto my-12 text-center bg-surface border border-border rounded-lg p-8">
          <div className="w-10 h-10 rounded-full bg-[#FEF3F2] flex items-center justify-center text-[#D92D20] mx-auto mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-text-primary mb-1">Not allowed</h2>
          <p className="text-xs text-text-secondary mb-4">
            You don't have permission to view this ticket.
          </p>
          <button
            onClick={() => navigate('/employee/tickets')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-lg"
          >
            Go back to my tickets
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto my-8">
        <ErrorBanner
          message={(error as any)?.message || 'Failed to load ticket details.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const ticket = data?.ticket;
  if (!ticket) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2">
          <Breadcrumbs
            items={[
              { label: 'My tickets', href: '/employee/tickets' },
              { label: ticket.ticketNumber },
            ]}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#EEF0FD] text-brand border border-[#D5D9F9]">
              {ticket.ticketNumber}
            </span>
            <h1 className="text-[20px] font-bold text-text-primary tracking-tight">
              {ticket.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <PriorityChip priority={ticket.priority} size="md" />
            <StatusChip status={ticket.status} size="md" />
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main content): Description + Comments + Activity timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description Card */}
          <Card>
            <CardHeader title="Issue description" />
            <div className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap break-words">
              {ticket.description}
            </div>
          </Card>

          {/* Activity Timeline (Real events only) */}
          <Card>
            <CardHeader
              title="Activity history"
              subtitle="Chronological log of verified ticket events"
            />
            <TicketTimeline events={ticket.events} />
          </Card>

          {/* Comments Thread */}
          <Card>
            <CardHeader
              title="Ticket discussion"
              subtitle="Messages between you and the assigned technician"
            />
            <CommentThread
              comments={[...(ticket.comments || []), ...localComments]}
              onAddComment={async (content) => {
                if (!isOnline || !navigator.onLine) {
                  const queued = queueOfflineComment(id!, content, {
                    id: user?.id || 'emp',
                    name: user?.name || 'Employee',
                    role: user?.role || 'EMPLOYEE',
                  });
                  setLocalComments((prev) => [...prev, queued]);
                  toast.info(
                    'Working offline. Comment saved and will post automatically once back online.',
                    'Comment Queued'
                  );
                  return;
                }
                await commentMutation.mutateAsync(content);
              }}
              isSubmitting={commentMutation.isPending}
            />
          </Card>
        </div>

        {/* Right Column: Ticket Metadata Sidebar (Read-only for employee) */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Ticket details" />
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Reporter
                </span>
                <span className="font-medium text-text-primary">
                  {ticket.reporter?.name}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Assigned technician
                </span>
                <span className="font-medium text-text-primary">
                  {ticket.assignedTechnician ? (
                    ticket.assignedTechnician.name
                  ) : (
                    <span className="text-text-muted italic">Unassigned</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" />
                  Category
                </span>
                <span className="font-medium text-text-primary">
                  {CATEGORY_LABELS[ticket.category] || ticket.category}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  SLA / Age
                </span>
                <SLABadge
                  createdAt={ticket.createdAt}
                  priority={ticket.priority}
                  status={ticket.status}
                />
              </div>

              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Created
                </span>
                <span className="text-text-secondary text-[11px]">
                  {formatDate(ticket.createdAt)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Last updated
                </span>
                <span className="text-text-secondary text-[11px]">
                  {formatDate(ticket.updatedAt)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
