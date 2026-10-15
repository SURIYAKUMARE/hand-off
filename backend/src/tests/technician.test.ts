import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../prisma';
import { seed } from '../../prisma/seed';

describe('Technician Operations and Strict State Machine API Tests', () => {
  let techCookie: string;
  let rahulTechId: string;
  let testTicketId: string;

  beforeAll(async () => {
    await seed();

    // Login Arjun Mehta (Technician)
    const techLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'arjun.mehta@helpdesk.local', password: 'Password123!' });
    techCookie = techLogin.headers['set-cookie'][0];

    // Get Rahul Menon's ID
    const rahul = await prisma.user.findUnique({
      where: { email: 'rahul.menon@helpdesk.local' },
    });
    rahulTechId = rahul!.id;

    // Find an OPEN ticket to test transition flow
    const openTicket = await prisma.ticket.findFirst({
      where: { status: 'OPEN' },
    });
    testTicketId = openTicket!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('allows technician to view the complete support queue across all reporters', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(1);
  });

  it('filters queue by priority accurately', async () => {
    const res = await request(app)
      .get('/api/tickets?priority=URGENT')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((ticket: any) => {
      expect(ticket.priority).toBe('URGENT');
    });
  });

  it('filters queue by category accurately', async () => {
    const res = await request(app)
      .get('/api/tickets?category=HARDWARE')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((ticket: any) => {
      expect(ticket.category).toBe('HARDWARE');
    });
  });

  it('filters queue by status accurately', async () => {
    const res = await request(app)
      .get('/api/tickets?status=IN_PROGRESS')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((ticket: any) => {
      expect(ticket.status).toBe('IN_PROGRESS');
    });
  });

  it('assigns technician to a ticket, updates DB, and records ASSIGNED audit event', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/assign`)
      .set('Cookie', techCookie)
      .send({ assignedTechnicianId: rahulTechId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket.assignedTechnicianId).toBe(rahulTechId);

    // Verify database record
    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: testTicketId },
    });
    expect(updatedTicket?.assignedTechnicianId).toBe(rahulTechId);

    // Verify audit event
    const event = await prisma.ticketEvent.findFirst({
      where: { ticketId: testTicketId, eventType: 'ASSIGNED' },
      orderBy: { createdAt: 'desc' },
    });
    expect(event).toBeDefined();
    expect(event?.newValue).toBe('Rahul Menon');
  });

  it('REJECTS direct jump from OPEN to CLOSED (State machine violation returns HTTP 400)', async () => {
    // Current ticket is OPEN
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Cookie', techCookie)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid status transition');
  });

  it('advances status from OPEN to IN_PROGRESS cleanly', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Cookie', techCookie)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket.status).toBe('IN_PROGRESS');

    // Verify status history in database
    const history = await prisma.statusHistory.findFirst({
      where: { ticketId: testTicketId, newStatus: 'IN_PROGRESS' },
    });
    expect(history).toBeDefined();
    expect(history?.previousStatus).toBe('OPEN');
  });

  it('advances status from IN_PROGRESS to RESOLVED cleanly', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Cookie', techCookie)
      .send({ status: 'RESOLVED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket.status).toBe('RESOLVED');
  });

  it('advances status from RESOLVED to CLOSED cleanly', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Cookie', techCookie)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket.status).toBe('CLOSED');
  });

  it('rejects any further transition on a CLOSED ticket', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Cookie', techCookie)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
