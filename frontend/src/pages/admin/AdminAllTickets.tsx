import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import {
  TicketSummary,
  DepartmentSummary,
  TechnicianWorkloadItem,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { PriorityChip } from '../../components/tickets/PriorityChip';
import { StatusChip } from '../../components/tickets/StatusChip';
import { Search, Filter, Ticket, Loader2, ArrowUpRight, Clock, AlertTriangle } from 'lucide-react';

export const AdminAllTickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWorkloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'ALL';
  const priorityFilter = searchParams.get('priority') || 'ALL';
  const deptFilter = searchParams.get('dept') || 'ALL';
  const techFilter = searchParams.get('tech') || 'ALL';

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ticketsRes, deptsRes, techsRes] = await Promise.all([
        api.get<{ success: boolean; tickets: TicketSummary[] }>('/tickets'),
        api.get<{ success: boolean; departments: DepartmentSummary[] }>('/departments'),
        api.get<{ success: boolean; technicians: TechnicianWorkloadItem[] }>('/admin/technicians'),
      ]);

      if (ticketsRes.success) setTickets(ticketsRes.tickets);
      if (deptsRes.success) setDepartments(deptsRes.departments);
      if (techsRes.success) setTechnicians(techsRes.technicians);
    } catch (err: any) {
      // handled
    } finally {
      setIsLoading(false);
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
    setSearchParams(next);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.reporter.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesDept = deptFilter === 'ALL' || t.department?.id === deptFilter;
    const matchesTech =
      techFilter === 'ALL' ||
      (techFilter === 'UNASSIGNED' ? !t.assignedTechnician : t.assignedTechnician?.id === techFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesDept && matchesTech;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Ticket Directory"
        subtitle="Global administrative inspection of all enterprise incident and service requests."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'All Tickets' },
        ]}
      />

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
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

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

        <select
          value={techFilter}
          onChange={(e) => updateParam('tech', e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs cursor-pointer"
        >
          <option value="ALL">All Assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {technicians.map((t) => (
            <option key={t.technicianId} value={t.technicianId}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tickets Table */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading all enterprise tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-text-primary">No tickets found</p>
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
                      onClick={() => navigate(`/technician/tickets/${t.id}`)}
                      className="hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-brand">{t.ticketNumber}</td>
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
                      <td className="px-4 py-3 text-text-secondary">{t.reporter.name}</td>
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
    </div>
  );
};
