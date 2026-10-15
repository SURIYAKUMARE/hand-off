import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  TicketSummary,
  TicketStatus,
  PaginatedResult,
  CATEGORY_LABELS,
} from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { DataTable, Column } from '../../components/common/DataTable';
import { TablePagination } from '../../components/common/TablePagination';
import { StatusChip } from '../../components/tickets/StatusChip';
import { PriorityChip } from '../../components/tickets/PriorityChip';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { getCachedOfflineTickets, saveCachedOfflineTickets } from '../../offline/syncEngine';
import { useNetwork } from '../../context/NetworkContext';
import { PlusCircle, Ticket as TicketIcon, CloudOff } from 'lucide-react';

export const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline } = useNetwork();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const statusParam = activeTab === 'ALL' ? undefined : (activeTab as TicketStatus);

  // TanStack Query fetching real API data
  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedResult<TicketSummary>>({
    queryKey: ['my-tickets', activeTab, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (statusParam) {
        params.set('status', statusParam);
      }
      const result = await api.get<PaginatedResult<TicketSummary>>(`/tickets?${params.toString()}`);
      if (result?.data) {
        // Cache server tickets for offline access
        const offline = getCachedOfflineTickets().filter((t) => t.isPendingSync);
        saveCachedOfflineTickets([...offline, ...result.data]);
      }
      return result;
    },
    // Don't error aggressively when offline
    retry: isOnline ? 1 : false,
  });

  // Read local cache and combine with server data
  const cachedTickets = getCachedOfflineTickets();
  const pendingTickets = cachedTickets.filter((t) => t.isPendingSync);

  // Filter pending tickets based on tab
  const matchingPending = pendingTickets.filter((t) => {
    if (activeTab === 'ALL') return true;
    return t.status === activeTab;
  });

  // Calculate final display list:
  // If data?.data is available, prepend matching pending items.
  // If query is in error and offline, fallback to cached tickets.
  let displayTickets: Array<TicketSummary & { isPendingSync?: boolean }> = [];
  if (data?.data) {
    // Avoid duplicates if pending item was already reconciled
    const existingIds = new Set(data.data.map((d) => d.id));
    const uniquePending = matchingPending.filter((p) => !existingIds.has(p.id));
    displayTickets = [...uniquePending, ...data.data];
  } else if (isError) {
    displayTickets = cachedTickets.filter((t) => {
      if (activeTab === 'ALL') return true;
      return t.status === activeTab;
    });
  }

  // Calculate status counts from unconstrained query or tab display
  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'OPEN', label: 'Open' },
    { id: 'IN_PROGRESS', label: 'In progress' },
    { id: 'RESOLVED', label: 'Resolved' },
    { id: 'CLOSED', label: 'Closed' },
  ];

  const columns: Column<TicketSummary & { isPendingSync?: boolean }>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket ID',
      width: '140px',
      render: (t) => (
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-brand text-xs">{t.ticketNumber}</span>
          {t.isPendingSync && (
            <span
              className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#FEF0C7] text-[#7A2E0E] border border-[#FEDF89]"
              title="Ticket saved locally in outbox. Will sync automatically once back online."
            >
              Pending
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (t) => (
        <div className="max-w-md truncate font-medium text-text-primary" title={t.title}>
          {t.title}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (t) => (
        <span className="text-text-secondary">
          {CATEGORY_LABELS[t.category] || t.category}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t) => <PriorityChip priority={t.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusChip status={t.status} />,
    },
    {
      key: 'assignedTechnician',
      header: 'Assigned technician',
      render: (t) => (
        <span className="text-text-secondary text-xs">
          {t.assignedTechnician ? t.assignedTechnician.name : (
            <span className="text-text-muted italic">Unassigned</span>
          )}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last updated',
      render: (t) => (
        <span className="text-text-muted text-[11px]">
          {new Date(t.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My tickets"
        subtitle="Track your IT support requests."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/employee/new-ticket')}
            iconLeft={<PlusCircle className="w-4 h-4" />}
          >
            New ticket
          </Button>
        }
      />

      {/* Tabs */}
      <div className="mb-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => {
            setActiveTab(tabId);
            setPage(1);
          }}
        />
      </div>

      {/* Error state / Offline notice */}
      {isError && displayTickets.length === 0 && (
        <div className="mb-4">
          <ErrorBanner
            message={(error as any)?.message || 'Failed to load tickets from server.'}
            onRetry={() => refetch()}
          />
        </div>
      )}

      {isError && displayTickets.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-[#FEF0C7] border border-[#FEDF89] text-xs text-[#7A2E0E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudOff className="w-4 h-4 text-[#B54708]" />
            <span>Offline mode: Displaying {displayTickets.length} cached tickets on this device.</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-semibold underline hover:text-[#93370D] cursor-pointer"
          >
            Try reconnecting
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && displayTickets.length === 0 ? (
        <TableSkeleton rows={8} cols={7} />
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={displayTickets}
            keyExtractor={(t) => t.id}
            onRowClick={(t) => {
              if (t.isPendingSync) {
                // Inform user ticket is pending server persistence
                return;
              }
              navigate(`/employee/tickets/${t.id}`);
            }}
            emptyState={
              <EmptyState
                icon={<TicketIcon className="w-5 h-5 text-text-secondary" />}
                title={
                  activeTab === 'ALL'
                    ? "You haven't raised any tickets yet."
                    : `No ${activeTab.toLowerCase().replace('_', ' ')} tickets.`
                }
                description={
                  activeTab === 'ALL'
                    ? 'Report your issue to the IT support team to get it resolved quickly.'
                    : 'Check your other tabs or submit a new ticket.'
                }
                actionLabel="Create your first ticket"
                onAction={() => navigate('/employee/new-ticket')}
              />
            }
          />

          {data && data.pagination.total > 0 && (
            <TablePagination
              total={data.pagination.total + matchingPending.length}
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
