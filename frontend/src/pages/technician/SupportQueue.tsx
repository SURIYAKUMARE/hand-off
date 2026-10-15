import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  TicketSummary,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  PaginatedResult,
  CATEGORY_LABELS,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  getNextPermittedStatus,
} from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { Button } from '../../components/common/Button';
import { DataTable, Column } from '../../components/common/DataTable';
import { TablePagination } from '../../components/common/TablePagination';
import { StatusChip } from '../../components/tickets/StatusChip';
import { PriorityChip } from '../../components/tickets/PriorityChip';
import { SLABadge } from '../../components/tickets/SLABadge';
import { TableSkeleton } from '../../components/common/Skeleton';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { RotateCcw, UserPlus, ArrowRightCircle, CloudOff } from 'lucide-react';

export const SupportQueue: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [status, setStatus] = useState<string>(searchParams.get('status') || 'ALL');
  const [priority, setPriority] = useState<string>(searchParams.get('priority') || 'ALL');
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'ALL');
  const [assigneeId, setAssigneeId] = useState<string>(searchParams.get('assigneeId') || 'ALL');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('order') as any) || 'desc');
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));
  const limit = 20;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync state to URL params
  useEffect(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set('search', debouncedSearch);
    if (status !== 'ALL') p.set('status', status);
    if (priority !== 'ALL') p.set('priority', priority);
    if (category !== 'ALL') p.set('category', category);
    if (assigneeId !== 'ALL') p.set('assigneeId', assigneeId);
    if (sortBy !== 'createdAt') p.set('sort', sortBy);
    if (sortOrder !== 'desc') p.set('order', sortOrder);
    if (page > 1) p.set('page', String(page));
    setSearchParams(p, { replace: true });
  }, [debouncedSearch, status, priority, category, assigneeId, sortBy, sortOrder, page, setSearchParams]);

  // Fetch Technicians for assignment filter and inline assignment
  const { data: techData } = useQuery<{ success: boolean; technicians: Array<{ id: string; name: string }> }>({
    queryKey: ['technicians'],
    queryFn: async () => await api.get('/technicians'),
  });

  const technicians = techData?.technicians || [];

  // TanStack Query for queue data
  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedResult<TicketSummary>>({
    queryKey: ['tickets-queue', debouncedSearch, status, priority, category, assigneeId, sortBy, sortOrder, page],
    queryFn: async () => {
      const p = new URLSearchParams();
      p.set('page', String(page));
      p.set('limit', String(limit));
      if (debouncedSearch) p.set('search', debouncedSearch);
      if (status !== 'ALL') p.set('status', status);
      if (priority !== 'ALL') p.set('priority', priority);
      if (category !== 'ALL') p.set('category', category);
      if (assigneeId !== 'ALL') p.set('assigneeId', assigneeId);
      p.set('sort', sortBy);
      p.set('order', sortOrder);

      return await api.get<PaginatedResult<TicketSummary>>(`/tickets?${p.toString()}`);
    },
  });

  // Inline assignment mutation
  const assignMutation = useMutation({
    mutationFn: async ({ ticketId, newAssigneeId }: { ticketId: string; newAssigneeId: string | null }) => {
      return await api.patch(`/tickets/${ticketId}/assign`, { assignedTechnicianId: newAssigneeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Technician assigned successfully.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update assignment.');
    },
  });

  // Inline status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ ticketId, newStatus }: { ticketId: string; newStatus: TicketStatus }) => {
      return await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Ticket status updated.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update status.');
    },
  });

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPriority('ALL');
    setCategory('ALL');
    setAssigneeId('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    status !== 'ALL' ||
    priority !== 'ALL' ||
    category !== 'ALL' ||
    assigneeId !== 'ALL';

  const columns: Column<TicketSummary>[] = [
    {
      key: 'priority',
      header: 'Priority',
      width: '100px',
      sortable: true,
      render: (t) => <PriorityChip priority={t.priority} />,
    },
    {
      key: 'ticketNumber',
      header: 'Ticket ID',
      width: '110px',
      sortable: true,
      render: (t) => (
        <span className="font-semibold text-brand text-xs">{t.ticketNumber}</span>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (t) => (
        <div className="max-w-xs md:max-w-md truncate font-medium text-text-primary" title={t.title}>
          {t.title}
        </div>
      ),
    },
    {
      key: 'reporter',
      header: 'Reporter',
      width: '140px',
      render: (t) => (
        <span className="text-text-secondary text-xs truncate block" title={t.reporter?.email}>
          {t.reporter?.name}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: '120px',
      render: (t) => (
        <span className="text-text-secondary text-xs">
          {CATEGORY_LABELS[t.category] || t.category}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '150px',
      render: (t) => {
        const nextStatus = getNextPermittedStatus(t.status);
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <StatusChip status={t.status} />
            {nextStatus && (
              <button
                type="button"
                onClick={() =>
                  statusMutation.mutate({
                    ticketId: t.id,
                    newStatus: nextStatus,
                  })
                }
                title={`Advance to ${STATUS_CONFIG[nextStatus].label}`}
                className="text-text-muted hover:text-brand p-0.5 rounded hover:bg-[#F2F4F7] transition-colors"
                aria-label={`Advance to ${STATUS_CONFIG[nextStatus].label}`}
              >
                <ArrowRightCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: 'assignedTechnician',
      header: 'Assignee',
      width: '170px',
      render: (t) => (
        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={t.assignedTechnicianId || ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : e.target.value;
              assignMutation.mutate({ ticketId: t.id, newAssigneeId: val });
            }}
            className="w-full h-7 px-2 text-xs border border-border rounded bg-surface hover:border-gray-400 focus:border-brand focus:ring-1 focus:ring-brand outline-none cursor-pointer"
            aria-label="Assign technician"
          >
            <option value="">Unassigned</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Age / SLA',
      width: '130px',
      sortable: true,
      render: (t) => (
        <SLABadge
          createdAt={t.createdAt}
          priority={t.priority}
          status={t.status}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Support queue"
        subtitle="Manage and triage incoming IT support requests."
      />

      {/* Toolbar: Search, Filters, Reset */}
      <div className="p-3 bg-surface border border-border rounded-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            className="w-full md:max-w-xs"
          />

          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Filter by Status"
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'OPEN', label: 'Open' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'CLOSED', label: 'Closed' },
              ]}
            />

            <FilterDropdown
              label="Filter by Priority"
              value={priority}
              onChange={(val) => {
                setPriority(val);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Priorities' },
                { value: 'URGENT', label: 'Urgent' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
            />

            <FilterDropdown
              label="Filter by Category"
              value={category}
              onChange={(val) => {
                setCategory(val);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'HARDWARE', label: 'Hardware' },
                { value: 'NETWORK', label: 'Network' },
                { value: 'SOFTWARE', label: 'Software' },
                { value: 'ACCOUNT_ACCESS', label: 'Account Access' },
              ]}
            />

            <FilterDropdown
              label="Filter by Assignee"
              value={assigneeId}
              onChange={(val) => {
                setAssigneeId(val);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Assignees' },
                { value: 'unassigned', label: 'Unassigned' },
                ...technicians.map((t) => ({ value: t.id, label: t.name })),
              ]}
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        !navigator.onLine ? (
          <div className="p-3 rounded-lg bg-[#FEF0C7] border border-[#FEDF89] text-xs text-[#7A2E0E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudOff className="w-4 h-4 text-[#B54708]" />
              <span>Offline mode: Unable to refresh queue from server. Reconnect to sync latest tickets.</span>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="font-semibold underline hover:text-[#93370D] cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <ErrorBanner
            message={(error as any)?.message || 'Failed to fetch tickets from queue.'}
            onRetry={() => refetch()}
          />
        )
      )}

      {/* Table Skeleton or Data */}
      {isLoading ? (
        <TableSkeleton rows={10} cols={8} />
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={data?.data || []}
            keyExtractor={(t) => t.id}
            onRowClick={(t) => navigate(`/technician/tickets/${t.id}`)}
            highlightUrgent
            isUrgentRow={(t) => t.priority === 'URGENT' && t.status !== 'CLOSED'}
            sortColumn={sortBy}
            sortOrder={sortOrder}
            onSort={(col) => {
              if (sortBy === col) {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy(col);
                setSortOrder('desc');
              }
            }}
            emptyState={
              <EmptyState
                title={hasActiveFilters ? 'No matching tickets' : 'No open issues'}
                description={
                  hasActiveFilters
                    ? 'Try adjusting or clearing your search and filters.'
                    : 'The support queue is clean. Great work!'
                }
                actionLabel={hasActiveFilters ? 'Reset filters' : undefined}
                onAction={hasActiveFilters ? handleResetFilters : undefined}
              />
            }
          />

          {data && data.pagination.total > 0 && (
            <TablePagination
              total={data.pagination.total}
              page={data.pagination.page}
              limit={data.pagination.limit}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>
      )}
    </div>
  );
};
