import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  DashboardSummary,
  StatusDistributionItem,
  PriorityDistributionItem,
  TechnicianWorkloadItem,
  ActivityFeedItem,
} from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { Card, CardHeader } from '../../components/common/Card';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Inbox,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  Clock,
  User,
  PlusCircle,
  ArrowRightCircle,
  MessageSquare,
  CloudOff,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  // 1. Summary KPIs
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useQuery<{ success: boolean; summary: DashboardSummary }>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => await api.get('/dashboard/summary'),
  });

  // 2. Status Distribution
  const { data: statusData, isLoading: isStatusLoading } = useQuery<{
    success: boolean;
    distribution: StatusDistributionItem[];
  }>({
    queryKey: ['dashboard', 'status-distribution'],
    queryFn: async () => await api.get('/dashboard/status-distribution'),
  });

  // 3. Priority Distribution
  const { data: priorityData, isLoading: isPriorityLoading } = useQuery<{
    success: boolean;
    distribution: PriorityDistributionItem[];
  }>({
    queryKey: ['dashboard', 'priority-distribution'],
    queryFn: async () => await api.get('/dashboard/priority-distribution'),
  });

  // 4. Workload Per Technician
  const { data: workloadData, isLoading: isWorkloadLoading } = useQuery<{
    success: boolean;
    workload: TechnicianWorkloadItem[];
  }>({
    queryKey: ['dashboard', 'workload'],
    queryFn: async () => await api.get('/dashboard/workload'),
  });

  // 5. Recent Activity Feed
  const { data: activityData, isLoading: isActivityLoading } = useQuery<{
    success: boolean;
    activity: ActivityFeedItem[];
  }>({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => await api.get('/dashboard/activity'),
  });

  const isLoading =
    isSummaryLoading ||
    isStatusLoading ||
    isPriorityLoading ||
    isWorkloadLoading ||
    isActivityLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isSummaryError) {
    if (!navigator.onLine) {
      return (
        <div className="max-w-lg mx-auto my-12 text-center bg-surface border border-border rounded-lg p-8">
          <div className="w-10 h-10 rounded-full bg-[#FEF0C7] flex items-center justify-center text-[#B54708] mx-auto mb-3">
            <CloudOff className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-text-primary mb-1">Working Offline</h2>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            Live metrics and operational analytics require an active server connection. You can continue managing tickets, reviewing cached queue items, and replying to requests offline.
          </p>
          <button
            type="button"
            onClick={() => refetchSummary()}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-brand rounded-lg hover:bg-brand-hover cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto my-8">
        <ErrorBanner
          message="Failed to load dashboard operational analytics."
          onRetry={() => refetchSummary()}
        />
      </div>
    );
  }

  const summary = summaryData?.summary || {
    openIssues: 0,
    urgentRequests: 0,
    inProgress: 0,
    completed: 0,
  };

  const statusList = statusData?.distribution || [];
  const priorityList = priorityData?.distribution || [];
  const workloadList = workloadData?.workload || [];
  const activityList = activityData?.activity || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CREATED':
        return <PlusCircle className="w-3.5 h-3.5 text-brand" />;
      case 'ASSIGNED':
        return <User className="w-3.5 h-3.5 text-[#2E90FA]" />;
      case 'STATUS_CHANGED':
        return <ArrowRightCircle className="w-3.5 h-3.5 text-[#F79009]" />;
      case 'COMMENTED':
        return <MessageSquare className="w-3.5 h-3.5 text-text-muted" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  const formatActivityTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of IT support operations and queue health."
      />

      {/* Top Metrics: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Open issues"
          value={summary.openIssues}
          description="Tickets awaiting initial triage"
          accentColor="#2E90FA"
          icon={<Inbox className="w-4 h-4" />}
        />
        <MetricCard
          title="Urgent requests"
          value={summary.urgentRequests}
          description="Critical priority active tickets"
          accentColor="#D92D20"
          icon={<AlertCircle className="w-4 h-4 text-[#D92D20]" />}
        />
        <MetricCard
          title="In progress"
          value={summary.inProgress}
          description="Currently being worked on"
          accentColor="#F79009"
          icon={<PlayCircle className="w-4 h-4" />}
        />
        <MetricCard
          title="Completed"
          value={summary.completed}
          description="Resolved and closed requests"
          accentColor="#12B76A"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
      </div>

      {/* Analytics Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tickets by Status (Bar Chart) */}
        <ChartCard
          title="Tickets by status"
          subtitle="Distribution of current ticket workflow states"
        >
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusList} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  stroke="#667085"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E4E7EC' }}
                />
                <YAxis
                  stroke="#667085"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  cursor={{ fill: '#F2F4F7' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as StatusDistributionItem;
                      return (
                        <div className="bg-surface p-2.5 rounded-lg border border-border shadow-toast text-xs">
                          <span className="font-semibold text-text-primary">{item.label}:</span>{' '}
                          <span className="font-bold text-brand">{item.count}</span> tickets
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusList.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2: Tickets by Priority (Donut Chart) */}
        <ChartCard
          title="Tickets by priority"
          subtitle="Breakdown of volume across SLA priority tiers"
        >
          <div className="w-full h-64 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityList}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {priorityList.map((entry, index) => (
                      <Cell key={`priority-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as PriorityDistributionItem;
                        return (
                          <div className="bg-surface p-2.5 rounded-lg border border-border shadow-toast text-xs">
                            <span className="font-semibold text-text-primary">{item.label}:</span>{' '}
                            <span className="font-bold text-brand">{item.count}</span> tickets
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Accessible Legend */}
            <div className="flex flex-col gap-2 text-xs">
              {priorityList.map((p) => (
                <div key={p.priority} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-text-secondary min-w-[60px]">{p.label}:</span>
                  <span className="font-bold text-text-primary">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Workload Table and Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Workload per technician (Table) */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="p-4 md:p-5 border-b border-border">
              <h3 className="text-sm font-semibold text-text-primary">
                Workload per technician
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Active ticket allocations and completion counts for IT staff
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">
                      Technician
                    </th>
                    <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-center">
                      Assigned
                    </th>
                    <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-center">
                      In progress
                    </th>
                    <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-center">
                      Resolved
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {workloadList.map((tech) => (
                    <tr key={tech.technicianId} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">{tech.name}</div>
                        <div className="text-[11px] text-text-muted">{tech.email}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-text-primary px-2 py-0.5 bg-[#F2F4F7] rounded">
                          {tech.assigned}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-[#B54708] px-2 py-0.5 bg-[#FEF0C7] rounded">
                          {tech.inProgress}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-[#027A48] px-2 py-0.5 bg-[#ECFDF3] rounded">
                          {tech.resolved}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <div>
          <Card>
            <CardHeader
              title="Recent activity"
              subtitle="Latest recorded operations across the system"
            />
            {activityList.length === 0 ? (
              <div className="text-xs text-text-muted py-6 text-center">
                No recent activity recorded.
              </div>
            ) : (
              <div className="space-y-3.5">
                {activityList.slice(0, 7).map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="p-1 rounded-full bg-[#F2F4F7] mt-0.5 flex-shrink-0">
                      {getActivityIcon(act.eventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-text-primary leading-tight">
                        <span className="font-semibold">{act.actorName}</span>{' '}
                        <span className="text-text-secondary">{act.summary}</span>{' '}
                        <span className="font-mono text-[11px] text-brand">
                          ({act.ticketNumber})
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatActivityTime(act.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
