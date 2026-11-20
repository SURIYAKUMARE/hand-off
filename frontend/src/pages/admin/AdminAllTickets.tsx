import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useQuery } from '@tanstack/react-query';
import { TablePagination } from '../../components/common/TablePagination';
import {
  TicketSummary,
  PaginatedResult,
  DepartmentSummary,
  TechnicianWorkloadItem,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { PriorityChip } from '../../components/tickets/PriorityChip';
import { StatusChip } from '../../components/tickets/StatusChip';
import { Button } from '../../components/common/Button';
import {
  Search,
  Filter,
  Ticket,
  Loader2,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import { getCachedOfflineTickets, saveCachedOfflineTickets } from '../../offline/syncEngine';
import { useNetwork } from '../../context/NetworkContext';

export const AdminAllTickets: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWorkloadItem[]>([]);
  const [filterError, setFilterError] = useState(false);
  const [cacheVersion, setCacheVersion] = useState(0);

  const { isOnline, isSyncing, triggerSync } = useNetwork();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'ALL';
  const priorityFilter = searchParams.get('priority') || 'ALL';
  const deptFilter = searchParams.get('dept') || 'ALL';
  const techFilter = searchParams.get('tech') || 'ALL';

  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const params = new URLSearchParams({ page: String(page), limit: '25' });
  if (search.trim()) params.set('search', search.trim());
  if (statusFilter !== 'ALL') params.set('status', statusFilter);
  if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
  if (deptFilter !== 'ALL') params.set('departmentId', deptFilter);
  if (techFilter !== 'ALL') params.set('assigneeId', techFilter === 'UNASSIGNED' ? 'unassigned' : techFilter);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-tickets', params.toString()],
    queryFn: async ({ signal }) => {
      const res = await api.get<any>(`/tickets?${params}`, { signal });
      const ticketsList = res?.data || res?.tickets || [];
      if (Array.isArray(ticketsList) && ticketsList.length > 0) {
        // Cache server tickets for offline access
        const pending = getCachedOfflineTickets().filter((t) => t.isPendingSync);
        saveCachedOfflineTickets([...pending, ...ticketsList]);
      }
      return res as PaginatedResult<TicketSummary>;
    },
    retry: isOnline ? 1 : false,
  });

  // Listen for local offline tickets updates
  useEffect(() => {
    const onUpdate = () => setCacheVersion((v) => v + 1);
    window.addEventListener('helpdesk360_tickets_updated', onUpdate);
    window.addEventListener('helpdesk360_outbox_updated', onUpdate);
    return () => {
      window.removeEventListener('helpdesk360_tickets_updated', onUpdate);
      window.removeEventListener('helpdesk360_outbox_updated', onUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const [deptsRes, techsRes] = await Promise.all([
        api.get<{ success: boolean; departments: DepartmentSummary[] }>('/departments'),
        api.get<{ success: boolean; technicians: TechnicianWorkloadItem[] }>('/admin/technicians'),
      ]);

      if (deptsRes.success) setDepartments(deptsRes.departments);
      if (techsRes.success) setTechnicians(techsRes.technicians);
    } catch {
      setFilterError(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'ALL' || !val) {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: key === 'search' });
  };

  // Combine server tickets with any pending offline tickets
  const cachedAll = getCachedOfflineTickets();
  const pendingTickets = cachedAll.filter((t) => t.isPendingSync);

  let combinedList: Array<TicketSummary & { isPendingSync?: boolean }> = [];
  if (data?.data && Array.isArray(data.data)) {
    const existingIds = new Set(data.data.map((t) => t.id));
    const uniquePending = pendingTickets.filter((t) => !existingIds.has(t.id));
    combinedList = [...uniquePending, ...data.data];
  } else {
    // If offline or request error, gracefully fallback to cached storage
    combinedList = cachedAll;
  }

  // Filter combined list by search/criteria
  const filteredTickets = combinedList.filter((t) => {
    const matchesSearch =
      !search ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.reporter?.name || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesDept = deptFilter === 'ALL' || t.department?.id === deptFilter;
    const matchesTech =
      techFilter === 'ALL' ||
      (techFilter === 'UNASSIGNED' && !t.assignedTechnicianId) ||
      t.assignedTechnicianId === techFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept && matchesTech;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Master Ticket Directory"
          subtitle="Global administrative inspection of all enterprise incident and service requests."
          breadcrumbs={[
            { label: 'Admin', to: '/admin/dashboard' },
            { label: 'All Tickets' },
          ]}
        />
        {(!isOnline || isError) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              triggerSync();
              refetch();
            }}
            isLoading={isSyncing}
            iconLeft={<RefreshCw className="w-3.5 h-3.5 text-brand" />}
          >
            Sync with server
          </Button>
        )}
      </div>

      {(!isOnline || isError) && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CloudOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Offline Mode:</strong> Displaying {filteredTickets.length} cached tickets from device storage
              {pendingTickets.length > 0 && ` (${pendingTickets.length} pending synchronization to server)`}.
            </span>
          </div>
        </div>
      )}

      {filterError && (
        <p role="alert" className="text-xs text-text-muted italic">
          Department or technician filters operating on local cache.
        </p>
      )}

      {/* Filter Bar */}
      <div className="p-3 rounded-lg border border-border bg-surface flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets by ID, title, or reporter..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-surface-muted focus:bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => updateParam('status', e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => updateParam('priority', e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs cursor-pointer"
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">Urgent (P1)</option>
          <option value="HIGH">High (P2)</option>
          <option value="MEDIUM">Medium (P3)</option>
          <option value="LOW">Low (P4)</option>
        </select>

        {departments.length > 0 && (
          <select
            value={deptFilter}
            onChange={(e) => updateParam('dept', e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {technicians.length > 0 && (
          <select
            value={techFilter}
            onChange={(e) => updateParam('tech', e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs cursor-pointer"
          >
            <option value="ALL">All Technicians</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {technicians.map((t) => (
              <option key={t.technicianId} value={t.technicianId}>
                {t.name} ({t.assigned + t.inProgress} active)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Ticket List Table */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
        {isLoading && !data && cachedAll.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading all enterprise tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-text-primary">No tickets found</p>
            <p className="text-xs text-text-muted mt-1">Adjust search parameters or clear filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-[#F9FAFB] text-text-secondary font-medium">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title & Category</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">SLA Due</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {filteredTickets.map((t) => {
                  const isSlaBreached =
                    t.slaDeadline &&
                    new Date(t.slaDeadline).getTime() < Date.now() &&
                    !['RESOLVED', 'CLOSED'].includes(t.status);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => {
                        navigate(`/technician/tickets/${t.id}`);
                      }}
                      className="hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-brand">
                        <div className="flex items-center gap-1.5">
                          <span>{t.ticketNumber}</span>
                          {t.isPendingSync && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-2.5 h-2.5" /> Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary group-hover:text-brand transition-colors">
                          {t.title}
                        </div>
                        <div className="text-[11px] text-text-muted capitalize">
                          {t.category.toLowerCase()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {t.department?.name || <span className="text-text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{t.reporter?.name || 'Employee'}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        {t.assignedTechnician ? (
                          t.assignedTechnician.name
                        ) : (
                          <span className="text-[#F79009] font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityChip priority={t.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={t.status} />
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        {t.slaDeadline ? (
                          <span
                            className={`flex items-center gap-1 font-mono ${
                              isSlaBreached ? 'text-[#D92D20] font-bold' : 'text-text-muted'
                            }`}
                          >
                            {isSlaBreached && <AlertTriangle className="w-3 h-3 text-[#D92D20]" />}
                            {new Date(t.slaDeadline).toLocaleDateString()}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-brand inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data?.pagination && (
        <TablePagination
          total={data.pagination.total}
          page={page}
          limit={data.pagination.limit}
          onPageChange={(next) => updateParam('page', String(next))}
        />
      )}
    </div>
  );
};
