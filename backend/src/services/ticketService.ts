import { prisma } from '../prisma';
import { AppError } from '../middleware/errorHandler';
import {
  CreateTicketInput,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  canTransitionStatus,
  VALID_STATUS_TRANSITIONS,
} from '@helpdesk360/shared';

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
  return await prisma.$transaction(async (tx) => {
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
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        assignedTechnician: {
          select: { id: true, name: true, email: true },
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

    return ticket;
  });
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

  return await prisma.$transaction(async (tx) => {
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

    return updated;
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

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
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
        changedAt: new Date(),
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

    return updated;
  });
}

export async function addComment(ticketId: string, authorId: string, rawContent: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
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
        actorId,
        oldValue: null,
        newValue: sanitizedContent.substring(0, 80),
      },
    });

    // Touch ticket updatedAt
    await tx.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    return comment;
  });
}
