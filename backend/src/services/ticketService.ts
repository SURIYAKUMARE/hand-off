import { prisma } from '../prisma';
import { AppError } from '../middleware/errorHandler';
import { sendEmailNotification } from './emailService';
import {
  CreateTicketInput,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  PRIORITY_CONFIG,
  canTransitionStatus,
  VALID_STATUS_TRANSITIONS,
} from '@helpdesk360/shared';

function calculateTicketDeadlines(
  createdAt: Date,
  priority: TicketPriority,
  policy: { firstResponseMinutes: number; resolutionMinutes: number } | null
) {
  const start = createdAt.getTime();
  const resolutionMinutes = policy?.resolutionMinutes ?? PRIORITY_CONFIG[priority].slaHours * 60;
  return {
    slaDeadline: new Date(start + resolutionMinutes * 60_000),
    firstResponseDeadline: policy ? new Date(start + policy.firstResponseMinutes * 60_000) : null,
  };
}

export async function generateNextTicketNumber(): Promise<string> {
  const tickets = await prisma.ticket.findMany({
    select: { ticketNumber: true },
  });

  let maxNum = 1000;
  for (const t of tickets) {
    if (t.ticketNumber && t.ticketNumber.startsWith('HD-')) {
      const n = parseInt(t.ticketNumber.replace('HD-', ''), 10);
      if (!isNaN(n) && n > maxNum) {
        maxNum = n;
      }
    }
  }

  return `HD-${maxNum + 1}`;
}

export async function createTicket(reporterId: string, input: CreateTicketInput) {
  // 1. Check for Automatic Assignment Rule
  let assignedTechnicianId: string | null = null;
  const autoAssignRule = await prisma.automationRule.findFirst({
    where: { actionType: 'AUTO_ASSIGN', isEnabled: true },
  });

  if (autoAssignRule) {
    // Find active, available technicians
    const eligibleTechnicians = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN',
        status: 'ACTIVE',
        technicianProfile: {
          status: 'AVAILABLE',
        },
      },
      include: {
        technicianProfile: true,
        assignedTickets: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          select: { id: true },
        },
      },
    });

    if (eligibleTechnicians.length > 0) {
      // Prioritize specialists matching the ticket category
      const specialists = eligibleTechnicians.filter(
        (t) => t.technicianProfile?.specialization === input.category
      );
      const candidatePool = specialists.length > 0 ? specialists : eligibleTechnicians;

      // Pick the technician with lowest active workload
      candidatePool.sort((a, b) => a.assignedTickets.length - b.assignedTickets.length);
      assignedTechnicianId = candidatePool[0].id;
    }
  }

  // 2. Compute SLA Deadlines from stored SlaPolicy
  const createdAt = new Date();
  const policy = await prisma.slaPolicy.findUnique({
    where: { priority: input.priority },
  });

  const ticket = await prisma.$transaction(async (tx) => {
    // Generate sequential ticket number
    const ticketNumber = await generateNextTicketNumber();

    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        status: 'OPEN',
        reporterId,
        assignedTechnicianId,
        departmentId: input.departmentId || null,
        assetId: input.assetId || null,
        createdAt,
        ...calculateTicketDeadlines(createdAt, input.priority, policy),
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        assignedTechnician: {
          select: { id: true, name: true, email: true },
        },
        department: {
          select: { id: true, name: true },
        },
        asset: {
          select: { id: true, assetTag: true, name: true, type: true },
        },
      },
    });

    // Audit Event: CREATED
    await tx.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        eventType: 'CREATED',
        actorId: reporterId,
        oldValue: null,
        newValue: ticket.title,
      },
    });

    if (assignedTechnicianId) {
      await tx.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          eventType: 'ASSIGNED',
          actorId: reporterId,
          oldValue: 'Unassigned',
          newValue: ticket.assignedTechnician ? ticket.assignedTechnician.name : 'Auto-assigned',
        },
      });

      // Notification to assigned technician
      await tx.notification.create({
        data: {
          userId: assignedTechnicianId,
          title: 'New ticket assigned to you',
          message: `${ticket.ticketNumber} (${ticket.title}) was assigned to you.`,
          type: 'TICKET_ASSIGNED',
          link: `/technician/tickets/${ticket.id}`,
        },
      });
    }

    // If Urgent, notify all active technicians
    if (input.priority === 'URGENT') {
      const allTechs = await tx.user.findMany({
        where: { role: 'TECHNICIAN', status: 'ACTIVE' },
        select: { id: true },
      });
      for (const tech of allTechs) {
        if (tech.id !== assignedTechnicianId) {
          await tx.notification.create({
            data: {
              userId: tech.id,
              title: 'URGENT Ticket Created',
              message: `${ticket.ticketNumber}: ${ticket.title}`,
              type: 'TICKET_CREATED',
              link: `/technician/tickets/${ticket.id}`,
            },
          });
        }
      }
    }

    return ticket;
  });

  // Asynchronous transactional email dispatch
  if (ticket.assignedTechnician) {
    sendEmailNotification({
      to: ticket.assignedTechnician.email,
      recipientName: ticket.assignedTechnician.name,
      subject: `[${ticket.ticketNumber}] New ticket assigned: ${ticket.title}`,
      ticketNumber: ticket.ticketNumber,
      ticketTitle: ticket.title,
      ticketPriority: ticket.priority,
      eventType: 'ASSIGNED',
      details: input.description,
      actionUrl: `/technician/tickets/${ticket.id}`,
    }).catch(() => {});
  }

  return ticket;
}

export async function assignTechnician(ticketId: string, assignedTechnicianId: string | null, actorId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { assignedTechnician: true },
  });

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  let newTechName = 'Unassigned';
  if (assignedTechnicianId) {
    const tech = await prisma.user.findUnique({
      where: { id: assignedTechnicianId },
    });

    if (!tech || tech.role !== 'TECHNICIAN') {
      throw new AppError('Assigned user must be a valid IT technician.', 400);
    }
    newTechName = tech.name;
  }

  const oldTechName = ticket.assignedTechnician ? ticket.assignedTechnician.name : 'Unassigned';

  const updated = await prisma.$transaction(async (tx) => {
    const updated = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        assignedTechnicianId,
        updatedAt: new Date(),
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignedTechnician: { select: { id: true, name: true, email: true } },
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId,
        eventType: 'ASSIGNED',
        actorId,
        oldValue: oldTechName,
        newValue: newTechName,
      },
    });

    // Notify assigned technician if assigned
    if (assignedTechnicianId) {
      await tx.notification.create({
        data: {
          userId: assignedTechnicianId,
          title: 'Ticket assigned to you',
          message: `You were assigned to ${ticket.ticketNumber}.`,
          type: 'TICKET_ASSIGNED',
          link: `/technician/tickets/${ticket.id}`,
        },
      });
    }

    return updated;
  });

  if (updated.assignedTechnician) {
    sendEmailNotification({
      to: updated.assignedTechnician.email,
      recipientName: updated.assignedTechnician.name,
      subject: `[${updated.ticketNumber}] Ticket assigned to you`,
      ticketNumber: updated.ticketNumber,
      ticketTitle: updated.title,
      ticketPriority: updated.priority,
      eventType: 'ASSIGNED',
      details: `Reassigned from ${oldTechName} to you.`,
      actionUrl: `/technician/tickets/${updated.id}`,
    }).catch(() => {});
  }

  return updated;
}

export async function updateTicketPriority(ticketId: string, priority: TicketPriority, actorId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new AppError('Ticket not found.', 404);
  if (ticket.priority === priority) return ticket;
  if (ticket.status !== 'OPEN' && ticket.status !== 'IN_PROGRESS') {
    throw new AppError('Only open or in-progress tickets can be reprioritized.', 409);
  }

  return prisma.$transaction(async (tx) => {
    const policy = await tx.slaPolicy.findUnique({ where: { priority } });
    const deadlines = calculateTicketDeadlines(ticket.createdAt, priority, policy);
    const result = await tx.ticket.updateMany({
      where: { id: ticketId, priority: ticket.priority, status: ticket.status, updatedAt: ticket.updatedAt },
      data: {
        priority,
        slaDeadline: deadlines.slaDeadline,
        firstResponseDeadline: ticket.firstResponseAt ? ticket.firstResponseDeadline : deadlines.firstResponseDeadline,
      },
    });
    if (result.count === 0) throw new AppError('The ticket changed. Refresh it and try again.', 409);

    await tx.ticketEvent.create({
      data: { ticketId, eventType: 'PRIORITY_CHANGED', actorId, oldValue: ticket.priority, newValue: priority },
    });
    return tx.ticket.findUniqueOrThrow({ where: { id: ticketId } });
  });
}

export async function updateTicketStatus(ticketId: string, newStatus: TicketStatus, actorId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  const currentStatus = ticket.status as TicketStatus;

  if (currentStatus === newStatus) {
    return ticket;
  }

  if (!canTransitionStatus(currentStatus, newStatus)) {
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    throw new AppError(
      `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${
        allowed.length > 0 ? allowed.join(', ') : 'None (Ticket is Closed)'
      }`,
      400
    );
  }

  const now = new Date();
  const resolvedAt = newStatus === 'RESOLVED' ? now : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    const updated = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        resolvedAt,
        updatedAt: now,
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignedTechnician: { select: { id: true, name: true, email: true } },
      },
    });

    // Record Status History
    await tx.statusHistory.create({
      data: {
        ticketId,
        previousStatus: currentStatus,
        newStatus,
        changedBy: actorId,
        changedAt: now,
      },
    });

    // Audit Event
    await tx.ticketEvent.create({
      data: {
        ticketId,
        eventType: 'STATUS_CHANGED',
        actorId,
        oldValue: currentStatus,
        newValue: newStatus,
      },
    });

    // Dispatch status change notification to ticket reporter
    await tx.notification.create({
      data: {
        userId: ticket.reporterId,
        title: `Ticket status updated to ${newStatus.replace('_', ' ')}`,
        message: `Your ticket ${ticket.ticketNumber} is now marked as ${newStatus.replace('_', ' ')}.`,
        type: 'STATUS_CHANGED',
        link: `/employee/tickets/${ticket.id}`,
      },
    });

    return updated;
  });

  if (updated.reporter) {
    sendEmailNotification({
      to: updated.reporter.email,
      recipientName: updated.reporter.name,
      subject: `[${updated.ticketNumber}] Status updated to ${newStatus.replace('_', ' ')}`,
      ticketNumber: updated.ticketNumber,
      ticketTitle: updated.title,
      ticketPriority: updated.priority,
      eventType: newStatus === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGED',
      details: `Your ticket status was transitioned to ${newStatus.replace('_', ' ')}.`,
      actionUrl: `/employee/tickets/${updated.id}`,
    }).catch(() => {});
  }

  return updated;
}

export async function addComment(
  ticketId: string,
  authorId: string,
  rawContent: string,
  isInternal: boolean = false
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { reporter: true, assignedTechnician: true },
  });

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  // Sanitize content against XSS / HTML tags
  const sanitizedContent = rawContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();

  if (!sanitizedContent) {
    throw new AppError('Comment content is empty or contains disallowed script content.', 400);
  }

  return await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        ticketId,
        authorId,
        content: sanitizedContent,
        isInternal,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Audit event
    await tx.ticketEvent.create({
      data: {
        ticketId,
        eventType: 'COMMENTED',
        actorId: authorId,
        oldValue: isInternal ? 'INTERNAL_NOTE' : null,
        newValue: sanitizedContent.substring(0, 80),
      },
    });

    // Touch ticket updatedAt
    await tx.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    // If public comment, notify the other participant
    if (!isInternal) {
      if (authorId === ticket.reporterId && ticket.assignedTechnicianId) {
        await tx.notification.create({
          data: {
            userId: ticket.assignedTechnicianId,
            title: 'New message from employee',
            message: `${ticket.reporter.name} commented on ${ticket.ticketNumber}.`,
            type: 'NEW_COMMENT',
            link: `/technician/tickets/${ticket.id}`,
          },
        });
      } else if (authorId !== ticket.reporterId) {
        await tx.notification.create({
          data: {
            userId: ticket.reporterId,
            title: 'Technician replied to your ticket',
            message: `A new response was posted on ${ticket.ticketNumber}.`,
            type: 'NEW_COMMENT',
            link: `/employee/tickets/${ticket.id}`,
          },
        });
      }
    }

    return comment;
  });
}
