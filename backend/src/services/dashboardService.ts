import { prisma } from '../prisma';
import {
  DashboardSummary,
  StatusDistributionItem,
  PriorityDistributionItem,
  TechnicianWorkloadItem,
  ActivityFeedItem,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  TicketStatus,
  TicketPriority,
  UserRole,
} from '@helpdesk360/shared';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [openIssues, urgentRequests, inProgress, completed] = await Promise.all([
    // Open issues: status == 'OPEN'
    prisma.ticket.count({
      where: { status: 'OPEN' },
    }),
    // Urgent requests: priority == 'URGENT' and status != 'CLOSED'
    prisma.ticket.count({
      where: {
        priority: 'URGENT',
        status: { not: 'CLOSED' },
      },
    }),
    // In progress: status == 'IN_PROGRESS'
    prisma.ticket.count({
      where: { status: 'IN_PROGRESS' },
    }),
    // Completed: status in ['RESOLVED', 'CLOSED']
    prisma.ticket.count({
      where: {
        status: { in: ['RESOLVED', 'CLOSED'] },
      },
    }),
  ]);

  return {
    openIssues,
    urgentRequests,
    inProgress,
    completed,
  };
}

export async function getStatusDistribution(): Promise<StatusDistributionItem[]> {
  const statuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  const counts = await Promise.all(
    statuses.map((status) =>
      prisma.ticket.count({
        where: { status },
      })
    )
  );

  return statuses.map((status, index) => ({
    status,
    label: STATUS_CONFIG[status].label,
    count: counts[index],
    color: STATUS_CONFIG[status].indicatorColor,
  }));
}

export async function getPriorityDistribution(): Promise<PriorityDistributionItem[]> {
  const priorities: TicketPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

  const counts = await Promise.all(
    priorities.map((priority) =>
      prisma.ticket.count({
        where: { priority },
      })
    )
  );

  return priorities.map((priority, index) => ({
    priority,
    label: PRIORITY_CONFIG[priority].label,
    count: counts[index],
    color: PRIORITY_CONFIG[priority].color,
  }));
}

export async function getTechnicianWorkload(): Promise<TechnicianWorkloadItem[]> {
  const technicians = await prisma.user.findMany({
    where: { role: 'TECHNICIAN' },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  const workloadItems: TechnicianWorkloadItem[] = await Promise.all(
    technicians.map(async (tech) => {
      const [assigned, inProgress, resolved] = await Promise.all([
        prisma.ticket.count({
          where: { assignedTechnicianId: tech.id },
        }),
        prisma.ticket.count({
          where: { assignedTechnicianId: tech.id, status: 'IN_PROGRESS' },
        }),
        prisma.ticket.count({
          where: { assignedTechnicianId: tech.id, status: { in: ['RESOLVED', 'CLOSED'] } },
        }),
      ]);

      return {
        technicianId: tech.id,
        name: tech.name,
        email: tech.email,
        assigned,
        inProgress,
        resolved,
      };
    })
  );

  return workloadItems;
}

export async function getRecentActivity(limit = 10): Promise<ActivityFeedItem[]> {
  const events = await prisma.ticketEvent.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      ticket: {
        select: {
          id: true,
          ticketNumber: true,
          title: true,
        },
      },
      actor: {
        select: {
          name: true,
          role: true,
        },
      },
    },
  });

  return events.map((ev) => {
    let summary = '';
    switch (ev.eventType) {
      case 'CREATED':
        summary = `Created ticket`;
        break;
      case 'ASSIGNED':
        summary = `Assigned ticket to ${ev.newValue || 'Unassigned'}`;
        break;
      case 'STATUS_CHANGED':
        summary = `Changed status to ${ev.newValue?.replace('_', ' ')}`;
        break;
      case 'COMMENTED':
        summary = `Posted a comment`;
        break;
      default:
        summary = `Updated ticket`;
    }

    return {
      id: ev.id,
      ticketId: ev.ticket.id,
      ticketNumber: ev.ticket.ticketNumber,
      ticketTitle: ev.ticket.title,
      eventType: ev.eventType as any,
      actorName: ev.actor.name,
      actorRole: ev.actor.role as UserRole,
      oldValue: ev.oldValue,
      newValue: ev.newValue,
      createdAt: ev.createdAt.toISOString(),
      summary,
    };
  });
}
