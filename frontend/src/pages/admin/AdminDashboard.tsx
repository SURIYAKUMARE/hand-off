import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AdminDashboardMetrics, PRIORITY_CONFIG, STATUS_CONFIG } from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  Users,
  UserCheck,
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Inbox,
  TrendingUp,
  Building2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<{ success: boolean; metrics: AdminDashboardMetrics }>('/admin/metrics');
        if (res.success) {
          setMetrics(res.metrics);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load admin metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <span className="text-xs text-text-muted mt-2">Loading administrative overview...</span>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs">
          {error || 'Unable to load administrative metrics.'}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total users',
      value: metrics.totalUsers,
      sub: `${metrics.activeEmployees} active employees`,
      icon: <Users className="w-4 h-4 text-brand" />,
      link: '/admin/users',
    },
    {
      label: 'Available technicians',
      value: metrics.availableTechnicians,
      sub: `${metrics.technicianWorkload.length} total staff`,
      icon: <UserCheck className="w-4 h-4 text-[#12B76A]" />,
      link: '/admin/technicians',
    },
    {
      label: 'Total tickets',
      value: metrics.totalTickets,
      sub: 'All-time volume',
      icon: <Ticket className="w-4 h-4 text-[#2E90FA]" />,
      link: '/admin/tickets',
    },
    {
      label: 'Open tickets',
      value: metrics.openTickets,
      sub: 'Needs attention',
      icon: <Inbox className="w-4 h-4 text-[#6172F3]" />,
      link: '/admin/tickets?status=OPEN',
    },
    {
      label: 'In-progress',
      value: metrics.inProgressTickets,
      sub: 'Active troubleshooting',
      icon: <Clock className="w-4 h-4 text-[#F79009]" />,
      link: '/admin/tickets?status=IN_PROGRESS',
    },
    {
      label: 'Urgent tickets',
      value: metrics.urgentTickets,
      sub: 'Priority level 1',
      icon: <AlertCircle className="w-4 h-4 text-[#D92D20]" />,
      link: '/admin/tickets?priority=URGENT',
    },
    {
      label: 'SLA breaches',
      value: metrics.slaBreaches,
      sub: 'Past due target',
      icon: <ShieldAlert className="w-4 h-4 text-[#D92D20]" />,
      link: '/admin/sla',
    },
    {
      label: 'Unassigned',
      value: metrics.unassignedTickets,
      sub: 'Pending routing',
      icon: <TrendingUp className="w-4 h-4 text-[#F79009]" />,
      link: '/admin/tickets?unassigned=true',
    },
    {
      label: 'Resolved tickets',
      value: metrics.resolvedTickets,
      sub: 'Successfully closed',
      icon: <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />,
      link: '/admin/tickets?status=RESOLVED',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        subtitle="Global operational overview, staff capacity, ticket distribution, and SLA adherence."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Dashboard' },
        ]}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            onClick={() => navigate(kpi.link)}
            className="p-3.5 rounded-lg border border-border bg-surface hover:border-brand/40 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-muted">{kpi.label}</span>
              <div className="p-1 rounded bg-[#F7F8FA] group-hover:bg-[#EEF4FF] transition-colors">
                {kpi.icon}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-text-primary tracking-tight">{kpi.value}</div>
              <div className="text-[11px] text-text-secondary mt-0.5">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Status Distribution & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Tickets by Status
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Current operational queue lifecycle</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.ticketsByStatus}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {metrics.ticketsByStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} tickets`, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    fontSize: '12px',
                    borderRadius: '6px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-5 rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Tickets by Priority
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Severity breakdown across active inventory</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.ticketsByPriority} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    fontSize: '12px',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {metrics.ticketsByPriority.map((entry: any, idx: number) => (
                    <Cell key={`bar-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Department-wise Issues & Technician Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise issues */}
        <div className="p-5 rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Department Issues
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Ticket volume distribution across business units</p>
            </div>
            <button
              onClick={() => navigate('/admin/departments')}
              className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.departmentIssues}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#475467' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    fontSize: '12px',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="ticketCount" fill="#3B3FD9" radius={[0, 4, 4, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technician Workload */}
        <div className="p-5 rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Technician Capacity & Workload
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Assigned vs in-progress vs resolved</p>
            </div>
            <button
              onClick={() => navigate('/admin/technicians')}
              className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1"
            >
              Staff directory <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.technicianWorkload}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    fontSize: '12px',
                    borderRadius: '6px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="assigned" name="Assigned" fill="#2E90FA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" fill="#F79009" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#12B76A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 3: Monthly Volume & Resolution Time Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Ticket Volume */}
        <div className="p-5 rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Monthly Ticket Volume
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Monthly demand vs resolved output</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.monthlyVolume} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#667085' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    fontSize: '12px',
                    borderRadius: '6px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#3B3FD9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#12B76A"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Time Trends */}
        <div className="p-5 rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Resolution Time Trends (Hours)
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Average hours taken from open to resolution</p>
            </div>
            <button
              onClick={() => navigate('/admin/reports')}
              className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1"
            >
              Detailed reports <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.resolutionTimeTrends}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis tick={{ fontSize: 11, fill: '#667085' }} unit="h" />
                <Tooltip
                  formatter={(val: any) => [`${val} hours`, 'Avg Resolution Time']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    fontSize: '12px',
                    borderRadius: '6px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgHours"
                  stroke="#F79009"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
