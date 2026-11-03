import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AuditLogItem } from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { ShieldCheck, Search, Filter, Loader2, User, Globe } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ success: boolean; logs: AuditLogItem[] }>('/admin/audit-logs');
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const actorUser = log.user || log.actor;
    const detailsText = log.details || log.metadataJson || '';

    const matchesSearch =
      (actorUser && actorUser.name.toLowerCase().includes(search.toLowerCase())) ||
      (actorUser && actorUser.email.toLowerCase().includes(search.toLowerCase())) ||
      detailsText.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('CREATED') || action.includes('LOGIN')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#ECFDF3] text-[#027A48]">
          {action}
        </span>
      );
    }
    if (action.includes('STATUS') || action.includes('UPDATE')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EFF8FF] text-[#175CD3]">
          {action}
        </span>
      );
    }
    if (action.includes('PASSWORD') || action.includes('SECURITY')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF3F2] text-[#B42318]">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F2F4F7] text-[#475467]">
        {action}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Administrative Audit Trail"
        subtitle="Immutable security logs tracking user authorization, status alterations, and administrative operations."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Activity Logs' },
        ]}
      />

      {/* Filter Bar */}
      <div className="p-3 rounded-lg border border-border bg-surface flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor, email, or change details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="ALL">All Event Types</option>
          <option value="USER_CREATED">User Created</option>
          <option value="USER_STATUS_CHANGED">User Status Changed</option>
          <option value="PASSWORD_RESET">Password Reset</option>
          <option value="TICKET_REASSIGNED">Ticket Reassigned</option>
          <option value="TICKET_UPDATED">Ticket Updated</option>
          <option value="SLA_POLICY_UPDATED">SLA Policy Updated</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading immutable audit events...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-text-primary">No audit events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-[#F9FAFB] text-text-secondary font-medium">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor / User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Event Details</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {log.user || log.actor ? (
                        <div>
                          <div className="font-semibold text-text-primary">
                            {(log.user || log.actor)?.name}
                          </div>
                          <div className="text-[11px] text-text-muted font-mono">
                            {(log.user || log.actor)?.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">System Engine</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-sans">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3 text-text-secondary font-mono">{log.entityType || log.targetType}</td>
                    <td className="px-4 py-3 font-sans text-text-secondary max-w-xs truncate">
                      {log.details || log.metadataJson || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
