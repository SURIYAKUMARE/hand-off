import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import {
  queueOfflineComment,
  queueOfflineStatus,
  queueOfflineAssignment,
} from '../../offline/syncEngine';
import {
  TicketDetail as TicketDetailType,
  TicketStatus,
  CATEGORY_LABELS,
  STATUS_CONFIG,
  getNextPermittedStatus,
} from '@helpdesk360/shared';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { StatusChip } from '../../components/tickets/StatusChip';
import { PriorityChip } from '../../components/tickets/PriorityChip';
import { TicketTimeline } from '../../components/tickets/TicketTimeline';
import { CommentThread } from '../../components/tickets/CommentThread';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { TicketDetailSkeleton } from '../../components/common/Skeleton';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { SLABadge } from '../../components/tickets/SLABadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Calendar,
  User,
  Laptop,
  Clock,
  ShieldCheck,
  CheckCircle,
  Play,
  Check,
  Lock,
} from 'lucide-react';

export const TechnicianTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const { isOnline } = useNetwork();

  const [selectedTech, setSelectedTech] = useState<string>('');
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>([]);

  // Fetch ticket details
  const { data, isLoading, isError, error, refetch } = useQuery<{ success: boolean; ticket: TicketDetailType }>({
    queryKey: ['technician-ticket', id],
    queryFn: async () => {
      return await api.get<{ success: boolean; ticket: TicketDetailType }>(`/tickets/${id}`);
    },
    retry: isOnline ? 1 : false,
  });

  // Fetch available technicians
  const { data: techData } = useQuery<{ success: boolean; technicians: Array<{ id: string; name: string }> }>({
    queryKey: ['technicians'],
    queryFn: async () => await api.get('/technicians'),
  });

  const ticket = data?.ticket;
  const technicians = techData?.technicians || [];

  // Update local assignment state when ticket loads
  React.useEffect(() => {
    if (ticket) {
      setSelectedTech(ticket.assignedTechnicianId || '');
    }
  }, [ticket]);

  // Assignment Mutation
  const assignMutation = useMutation({
    mutationFn: async (techId: string | null) => {
      return await api.patch(`/tickets/${ticket?.id}/assign`, { assignedTechnicianId: techId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Technician assignment updated.');
    },
    onError: (err: any, techId: string | null) => {
      const isNetworkFailure =
        !navigator.onLine ||
        err?.name === 'TypeError' ||
        err?.message?.toLowerCase().includes('fetch') ||
        err?.message?.toLowerCase().includes('network');

      if (isNetworkFailure && ticket?.id) {
        queueOfflineAssignment(ticket.id, techId);
        toast.info('Assignment saved locally in outbox. Will sync automatically once online.', 'Offline Queued');
      } else {
        toast.error(err?.message || 'Failed to update technician.');
      }
    },
  });

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: async (targetStatus: TicketStatus) => {
      return await api.patch(`/tickets/${ticket?.id}/status`, { status: targetStatus });
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['technician-ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Ticket marked as ${res?.ticket?.status || 'updated'}.`);
    },
    onError: (err: any, targetStatus: TicketStatus) => {
      const isNetworkFailure =
        !navigator.onLine ||
        err?.name === 'TypeError' ||
        err?.message?.toLowerCase().includes('fetch') ||
        err?.message?.toLowerCase().includes('network');

      if (isNetworkFailure && ticket?.id) {
        queueOfflineStatus(ticket.id, targetStatus);
        toast.info(`Status update saved locally (${targetStatus}). Will sync once online.`, 'Offline Queued');
      } else {
        toast.error(err?.message || 'Failed to change ticket status.');
      }
    },
  });

  // Comment Mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await api.post(`/tickets/${ticket?.id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-ticket', id] });
      setLocalComments([]);
      toast.success('Comment posted successfully.');
    },
    onError: (err: any, content: string) => {
      const isNetworkFailure =
        !navigator.onLine ||
        err?.name === 'TypeError' ||
        err?.message?.toLowerCase().includes('fetch') ||
        err?.message?.toLowerCase().includes('network');

      if (isNetworkFailure && ticket?.id) {
        const queued = queueOfflineComment(ticket.id, content, {
          id: user?.id || 'tech',
          name: user?.name || 'Technician',
          role: user?.role || 'TECHNICIAN',
        });
        setLocalComments((prev) => [...prev, queued]);
        toast.info('Comment saved locally in outbox. Will sync once online.', 'Offline Queued');
      } else {
        toast.error(err?.message || 'Failed to post comment.');
      }
    },
  });

  if (isLoading) return <TicketDetailSkeleton />;

  if (isError) {
    return (
      <div className="max-w-lg mx-auto my-8">
        <ErrorBanner
          message={(error as any)?.message || 'Failed to load ticket details.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!ticket) return null;

  const nextStatus = getNextPermittedStatus(ticket.status);

  const getTransitionButtonConfig = () => {
    if (!nextStatus) return null;

    switch (nextStatus) {
      case 'IN_PROGRESS':
        return {
          label: 'Start progress',
          icon: <Play className="w-3.5 h-3.5" />,
          variant: 'primary' as const,
        };
      case 'RESOLVED':
        return {
          label: 'Mark resolved',
          icon: <Check className="w-3.5 h-3.5" />,
          variant: 'primary' as const,
        };
      case 'CLOSED':
        return {
          label: 'Close ticket',
          icon: <Lock className="w-3.5 h-3.5" />,
          variant: 'secondary' as const,
        };
    }
  };

  const transitionConfig = getTransitionButtonConfig();

  const handleStatusTransition = () => {
    if (!nextStatus) return;
    if (nextStatus === 'CLOSED') {
      setIsConfirmCloseOpen(true);
    } else {
      statusMutation.mutate(nextStatus);
    }
  };

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
              { label: 'Support queue', href: '/technician/queue' },
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
        {/* Left Column (Main content): Description + Activity timeline + Comments thread */}
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
              subtitle="Full chronological audit log of ticket actions"
            />
            <TicketTimeline events={ticket.events} />
          </Card>

          {/* Comment Thread with Technician composer */}
          <Card>
            <CardHeader
              title="Ticket discussion"
              subtitle="Add internal notes or communicate with the reporter"
            />
            <CommentThread
              comments={[...(ticket.comments || []), ...localComments]}
              onAddComment={async (content) => {
                if (!isOnline || !navigator.onLine) {
                  const queued = queueOfflineComment(ticket.id, content, {
                    id: user?.id || 'tech',
                    name: user?.name || 'Technician',
                    role: user?.role || 'TECHNICIAN',
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

        {/* Right Column: Technician Action Panel & Details */}
        <div className="space-y-6">
          {/* Technician Action Panel */}
          <Card className="border-brand/30 bg-[#FAFBFD]">
            <CardHeader
              title="Technician controls"
              subtitle="Assign technician and advance ticket status"
            />

            <div className="space-y-4">
              {/* Assignee Selection */}
              <div>
                <label className="text-xs font-medium text-text-primary block mb-1.5">
                  Assign technician
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    disabled={assignMutation.isPending}
                    className="flex-1 h-9 px-3 text-xs rounded-lg border border-border bg-surface text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() =>
                      assignMutation.mutate(selectedTech === '' ? null : selectedTech)
                    }
                    disabled={
                      assignMutation.isPending ||
                      selectedTech === (ticket.assignedTechnicianId || '')
                    }
                    isLoading={assignMutation.isPending}
                  >
                    Save
                  </Button>
                </div>
              </div>

              {/* Status Transition Control (Only Next Permitted Step) */}
              <div className="pt-3 border-t border-border">
                <label className="text-xs font-medium text-text-primary block mb-1.5">
                  Status transition
                </label>
                {transitionConfig ? (
                  <div className="space-y-2">
                    <Button
                      variant={transitionConfig.variant}
                      size="md"
                      onClick={handleStatusTransition}
                      isLoading={statusMutation.isPending}
                      iconLeft={transitionConfig.icon}
                      className="w-full font-semibold"
                    >
                      {transitionConfig.label}
                    </Button>
                    <p className="text-[11px] text-text-muted">
                      Advances status from{' '}
                      <span className="font-semibold text-text-secondary">
                        {STATUS_CONFIG[ticket.status].label}
                      </span>{' '}
                      to{' '}
                      <span className="font-semibold text-text-secondary">
                        {STATUS_CONFIG[nextStatus!].label}
                      </span>
                      .
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[#F2F4F7] text-text-muted text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#027A48]" />
                    <span>Ticket is closed. No further transitions permitted.</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Ticket Metadata Card */}
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

      {/* Confirmation Modal for Closing Ticket */}
      <ConfirmDialog
        isOpen={isConfirmCloseOpen}
        onClose={() => setIsConfirmCloseOpen(false)}
        onConfirm={() => {
          setIsConfirmCloseOpen(false);
          statusMutation.mutate('CLOSED');
        }}
        title="Close this ticket?"
        description="Closing this ticket archives it. No further status changes or work can be scheduled on a closed ticket."
        confirmLabel="Close ticket"
        variant="primary"
        isLoading={statusMutation.isPending}
      />
    </div>
  );
};
