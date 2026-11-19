import { prisma } from '../prisma';

export interface EscalationRunResult {
  scannedCount: number;
  warningsIssued: number;
  breachesEscalated: number;
  escalatedTicketNumbers: string[];
}

export async function checkAndEscalateTickets(): Promise<EscalationRunResult> {
  const now = new Date();
  const warningWindowMs = 60 * 60 * 1000; // 1 hour warning window

  // Find all active tickets with SLA deadlines
  const activeTickets = await prisma.ticket.findMany({
    where: {
      status: { in: ['OPEN', 'IN_PROGRESS'] },
      slaDeadline: { not: null },
    },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      assignedTechnician: { select: { id: true, name: true, email: true } },
      events: {
        select: { eventType: true },
      },
    },
  });

  let warningsIssued = 0;
  let breachesEscalated = 0;
  const escalatedTicketNumbers: string[] = [];

  // Fetch all admins to notify on SLA breaches
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', status: 'ACTIVE' },
    select: { id: true, name: true, email: true },
  });

  for (const ticket of activeTickets) {
    if (!ticket.slaDeadline) continue;

    const deadlineTime = ticket.slaDeadline.getTime();
    const currentTime = now.getTime();
    const timeRemaining = deadlineTime - currentTime;

    // 1. SLA BREACH AND AUTO-ESCALATION
    if (timeRemaining <= 0 && !ticket.isEscalated) {
      const priorPriority = ticket.priority;
      const newPriority = priorPriority === 'LOW' ? 'MEDIUM' : priorPriority === 'MEDIUM' ? 'HIGH' : 'URGENT';

      await prisma.$transaction(async (tx) => {
        // Mark as escalated and bump priority
        await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            isEscalated: true,
            priority: newPriority,
            updatedAt: now,
          },
        });

        // Record Escalation Event
        await tx.ticketEvent.create({
          data: {
            ticketId: ticket.id,
            eventType: 'ESCALATED',
            actorId: ticket.assignedTechnicianId || ticket.reporterId,
            oldValue: `${priorPriority} (SLA ${ticket.slaDeadline?.toISOString()})`,
            newValue: `Automatic SLA breach escalation -> ${newPriority}`,
          },
        });

        // Notify assigned technician
        if (ticket.assignedTechnicianId) {
          await tx.notification.create({
            data: {
              userId: ticket.assignedTechnicianId,
              title: `SLA BREACH: ${ticket.ticketNumber} Escalated`,
              message: `Ticket ${ticket.ticketNumber} exceeded SLA resolution target and was automatically escalated.`,
              type: 'SLA_BREACH',
              link: `/technician/tickets/${ticket.id}`,
            },
          });
        }

        // Notify all Admins
        for (const admin of admins) {
          await tx.notification.create({
            data: {
              userId: admin.id,
              title: `System Escalation: ${ticket.ticketNumber}`,
              message: `Ticket ${ticket.ticketNumber} (${ticket.title}) breached SLA. Assigned: ${ticket.assignedTechnician?.name || 'Unassigned'}.`,
              type: 'ESCALATED',
              link: `/admin/tickets`,
            },
          });
        }

        // Notify ticket reporter
        await tx.notification.create({
          data: {
            userId: ticket.reporterId,
            title: `Priority Escalation: ${ticket.ticketNumber}`,
            message: `Your ticket has been escalated to senior engineering for expedited resolution.`,
            type: 'ESCALATED',
            link: `/employee/tickets/${ticket.id}`,
          },
        });
      });

      breachesEscalated++;
      escalatedTicketNumbers.push(ticket.ticketNumber);
      continue;
    }

    // 2. SLA WARNING (Approaching breach within 1 hour)
    const hasReceivedWarning = ticket.events.some((e) => e.eventType === 'SLA_WARNING');
    if (timeRemaining > 0 && timeRemaining <= warningWindowMs && !hasReceivedWarning) {
      await prisma.$transaction(async (tx) => {
        await tx.ticketEvent.create({
          data: {
            ticketId: ticket.id,
            eventType: 'SLA_WARNING',
            actorId: ticket.assignedTechnicianId || ticket.reporterId,
            oldValue: null,
            newValue: `Approaching SLA deadline (${Math.round(timeRemaining / 60000)} mins remaining)`,
          },
        });

        if (ticket.assignedTechnicianId) {
          await tx.notification.create({
            data: {
              userId: ticket.assignedTechnicianId,
              title: `SLA Warning: ${ticket.ticketNumber}`,
              message: `Ticket ${ticket.ticketNumber} will breach SLA in ${Math.round(timeRemaining / 60000)} minutes.`,
              type: 'SLA_WARNING',
              link: `/technician/tickets/${ticket.id}`,
            },
          });
        }
      });

      warningsIssued++;
    }
  }

  return {
    scannedCount: activeTickets.length,
    warningsIssued,
    breachesEscalated,
    escalatedTicketNumbers,
  };
}
