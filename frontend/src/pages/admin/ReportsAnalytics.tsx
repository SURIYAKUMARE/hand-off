import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { DepartmentSummary, TechnicianWorkloadItem } from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const ReportsAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWorkloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState('30d');
  const [departmentId, setDepartmentId] = useState('');
  const [technicianId, setTechnicianId] = useState('');

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (departmentId) queryParams.set('departmentId', departmentId);
      if (technicianId) queryParams.set('technicianId', technicianId);

      // Calculate fromDate
      const now = new Date();
      if (dateRange === '7d') {
        now.setDate(now.getDate() - 7);
        queryParams.set('fromDate', now.toISOString());
      } else if (dateRange === '30d') {
        now.setDate(now.getDate() - 30);
        queryParams.set('fromDate', now.toISOString());
      } else if (dateRange === '90d') {
        now.setDate(now.getDate() - 90);
        queryParams.set('fromDate', now.toISOString());
      }

      const [reportsRes, deptsRes, techsRes] = await Promise.all([
        api.get<{ success: boolean; data: any }>(`/admin/reports?${queryParams.toString()}`),
        api.get<{ success: boolean; departments: DepartmentSummary[] }>('/departments'),
        api.get<{ success: boolean; technicians: TechnicianWorkloadItem[] }>('/admin/technicians'),
      ]);

      if (reportsRes.success) setData(reportsRes.data);
      if (deptsRes.success) setDepartments(deptsRes.departments);
      if (techsRes.success) setTechnicians(techsRes.technicians);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange, departmentId, technicianId]);

  const handleExportCsv = () => {
    const queryParams = new URLSearchParams();
    if (departmentId) queryParams.set('departmentId', departmentId);
    if (technicianId) queryParams.set('technicianId', technicianId);

    const now = new Date();
    if (dateRange === '7d') {
      now.setDate(now.getDate() - 7);
      queryParams.set('fromDate', now.toISOString());
    } else if (dateRange === '30d') {
      now.setDate(now.getDate() - 30);
      queryParams.set('fromDate', now.toISOString());
    } else if (dateRange === '90d') {
      now.setDate(now.getDate() - 90);
      queryParams.set('fromDate', now.toISOString());
    }

    window.open(`/api/admin/reports/export-csv?${queryParams.toString()}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Reports & Service Analytics"
          subtitle="Audit resolution velocity, customer satisfaction, SLA compliance, and export performance data."
          breadcrumbs={[
            { label: 'Admin', to: '/admin/dashboard' },
            { label: 'Reports & Analytics' },
          ]}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportCsv}
          iconLeft={<Download className="w-3.5 h-3.5" />}
        >
          Export CSV Report
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-lg border border-border bg-surface flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time History</option>
          </select>
        </div>

        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={technicianId}
          onChange={(e) => setTechnicianId(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">All Technicians</option>
          {technicians.map((t) => (
            <option key={t.technicianId} value={t.technicianId}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading || !data ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="text-xs text-text-muted">Aggregating analytics...</p>
        </div>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-[11px] font-medium text-text-muted">Total Created</div>
              <div className="text-2xl font-bold text-text-primary mt-1">{data.totalCreated}</div>
              <div className="text-[11px] text-text-secondary mt-0.5">In chosen period</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-[11px] font-medium text-text-muted">Resolved Tickets</div>
              <div className="text-2xl font-bold text-[#027A48] mt-1">{data.resolvedCount}</div>
              <div className="text-[11px] text-text-secondary mt-0.5">Completed cycles</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-[11px] font-medium text-text-muted">SLA Compliance</div>
              <div className="text-2xl font-bold text-brand mt-1">{data.slaComplianceRate}%</div>
              <div className="text-[11px] text-text-secondary mt-0.5">Met deadline targets</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-[11px] font-medium text-text-muted">Avg Resolution Time</div>
              <div className="text-2xl font-bold text-[#F79009] mt-1">
                {data.avgResolutionHours} <span className="text-xs font-normal">hrs</span>
              </div>
              <div className="text-[11px] text-text-secondary mt-0.5">From open to close</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-[11px] font-medium text-text-muted">Avg First Response</div>
              <div className="text-2xl font-bold text-text-primary mt-1">
                {data.avgFirstResponseHours} <span className="text-xs font-normal">hrs</span>
              </div>
              <div className="text-[11px] text-text-secondary mt-0.5">Initial tech acknowledgment</div>
            </div>
          </div>

          {/* CSAT Satisfaction Section */}
          <div className="p-5 rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Customer Satisfaction (CSAT)
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Direct employee feedback submitted after ticket resolution
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFFAEB] border border-[#FEDF89] text-xs font-bold text-[#B54708]">
                <Star className="w-4 h-4 fill-[#F79009] text-[#F79009]" />
                <span>{data.csat.avgRating} / 5.0</span>
                <span className="font-normal text-text-muted ml-1">
                  ({data.csat.totalRatings} ratings)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3 pt-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = (data.csat.distribution as any)[star] || 0;
                const pct =
                  data.csat.totalRatings > 0
                    ? Math.round((count / data.csat.totalRatings) * 100)
                    : 0;

                return (
                  <div key={star} className="p-3 rounded bg-[#F7F8FA] border border-border text-center">
                    <div className="flex items-center justify-center gap-1 text-xs font-semibold text-text-primary">
                      <span>{star}</span>
                      <Star className="w-3.5 h-3.5 fill-[#F79009] text-[#F79009]" />
                    </div>
                    <div className="text-sm font-bold text-text-primary mt-1">{count}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category & Priority Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg border border-border bg-surface">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
                Issues by Technical Domain
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.categoryBreakdown}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#667085' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#667085' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E4E7EC',
                        fontSize: '12px',
                        borderRadius: '6px',
                      }}
                    />
                    <Bar dataKey="count" fill="#3B3FD9" radius={[4, 4, 0, 0]} name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 rounded-lg border border-border bg-surface">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
                Volume by Severity Level
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.priorityBreakdown}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                    <XAxis dataKey="priority" tick={{ fontSize: 11, fill: '#667085' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#667085' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E4E7EC',
                        fontSize: '12px',
                        borderRadius: '6px',
                      }}
                    />
                    <Bar dataKey="count" fill="#2E90FA" radius={[4, 4, 0, 0]} name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
