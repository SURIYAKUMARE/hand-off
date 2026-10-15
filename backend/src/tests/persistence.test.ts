import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { seed } from '../../prisma/seed';
import { createTicket, assignTechnician, updateTicketStatus } from '../services/ticketService';

describe('Data Persistence & Restart Integrity Tests', () => {
  let prismaInstance: PrismaClient;

  beforeAll(async () => {
    await seed();
    prismaInstance = new PrismaClient();
  });

  afterAll(async () => {
    await prismaInstance.$disconnect();
  });

  it('persists newly created tickets, assignments, and status transitions through database disconnect and reconnection', async () => {
    // 1. Get reporter and technician
    const reporter = await prismaInstance.user.findFirst({
      where: { role: 'EMPLOYEE' },
    });
    const technician = await prismaInstance.user.findFirst({
      where: { role: 'TECHNICIAN' },
    });

    expect(reporter).toBeDefined();
    expect(technician).toBeDefined();

    // 2. Create Ticket
    const ticket = await createTicket(reporter!.id, {
      title: 'Persistent Server Test Ticket',
      description: 'Testing that database records survive application restart and reconnect.',
      category: 'SOFTWARE',
      priority: 'HIGH',
    });

    expect(ticket.id).toBeDefined();
    expect(ticket.ticketNumber).toBeDefined();

    // 3. Assign Technician
    await assignTechnician(ticket.id, technician!.id, technician!.id);

    // 4. Update Status to IN_PROGRESS
    await updateTicketStatus(ticket.id, 'IN_PROGRESS', technician!.id);

    // 5. Simulate Server & Connection Restart: Disconnect client completely
    await prismaInstance.$disconnect();

    // Reconnect with a brand new Prisma Client instance
    const newPrisma = new PrismaClient();

    // 6. Verify Ticket Still Exists with Exact Data
    const reloadedTicket = await newPrisma.ticket.findUnique({
      where: { id: ticket.id },
      include: {
        reporter: true,
        assignedTechnician: true,
        statusHistory: true,
        events: true,
      },
    });

    expect(reloadedTicket).toBeDefined();
    expect(reloadedTicket?.title).toBe('Persistent Server Test Ticket');
    expect(reloadedTicket?.status).toBe('IN_PROGRESS');
    expect(reloadedTicket?.assignedTechnicianId).toBe(technician!.id);
    expect(reloadedTicket?.assignedTechnician?.name).toBe(technician!.name);

    // Verify Status History survives
    expect(reloadedTicket?.statusHistory.length).toBeGreaterThanOrEqual(1);
    expect(reloadedTicket?.statusHistory[0].newStatus).toBe('IN_PROGRESS');

    // Verify Audit Events survive
    expect(reloadedTicket?.events.length).toBeGreaterThanOrEqual(2);

    await newPrisma.$disconnect();
  });
});
