import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../prisma';
import { seed } from '../../prisma/seed';

describe('Employee Role and Permissions API Tests', () => {
  let employeeCookie: string;
  let employee2Cookie: string;
  let priyaTicketId: string;
  let kavyaTicketId: string;

  beforeAll(async () => {
    await seed();

    // Login Priya Nair (Employee 1)
    const priyaLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.nair@helpdesk.local', password: 'Password123!' });
    employeeCookie = priyaLogin.headers['set-cookie'][0];

    // Login Kavya Raman (Employee 2)
    const kavyaLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'kavya.raman@helpdesk.local', password: 'Password123!' });
    employee2Cookie = kavyaLogin.headers['set-cookie'][0];

    // Retrieve Priya's ticket and Kavya's ticket from database
    const priyaTicket = await prisma.ticket.findFirst({
      where: { reporter: { email: 'priya.nair@helpdesk.local' } },
    });
    priyaTicketId = priyaTicket!.id;

    const kavyaTicket = await prisma.ticket.findFirst({
      where: { reporter: { email: 'kavya.raman@helpdesk.local' } },
    });
    kavyaTicketId = kavyaTicket!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('allows employee to create a new ticket with valid sequential number', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', employeeCookie)
      .send({
        title: 'External webcam video freezing during meetings',
        description: 'Logitech C920 webcam video stream freezes after 5-10 minutes in Google Meet and Zoom.',
        category: 'HARDWARE',
        priority: 'MEDIUM',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket.ticketNumber).toMatch(/^HD-\d+$/);
    expect(res.body.ticket.status).toBe('OPEN');
    expect(res.body.ticket.reporter.name).toBe('Priya Nair');

    // Verify stored in DB
    const dbRecord = await prisma.ticket.findUnique({
      where: { id: res.body.ticket.id },
    });
    expect(dbRecord).toBeDefined();
    expect(dbRecord?.title).toBe('External webcam video freezing during meetings');

    // Verify audit event in DB
    const event = await prisma.ticketEvent.findFirst({
      where: { ticketId: res.body.ticket.id, eventType: 'CREATED' },
    });
    expect(event).toBeDefined();
  });

  it('rejects ticket creation with description exceeding 2000 characters', async () => {
    const hugeDesc = 'A'.repeat(2001);
    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', employeeCookie)
      .send({
        title: 'Test description limit',
        description: hugeDesc,
        category: 'SOFTWARE',
        priority: 'LOW',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('scopes employee ticket listing strictly to tickets reported by that employee', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Cookie', employeeCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Every ticket in the list must belong to Priya Nair
    res.body.data.forEach((ticket: any) => {
      expect(ticket.reporter.email).toBe('priya.nair@helpdesk.local');
    });
  });

  it('allows employee to view their own ticket detail', async () => {
    const res = await request(app)
      .get(`/api/tickets/${priyaTicketId}`)
      .set('Cookie', employeeCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket.id).toBe(priyaTicketId);
  });

  it('blocks employee from accessing another employees ticket (HTTP 403 Forbidden)', async () => {
    // Priya Nair tries to access Kavya Raman's ticket
    const res = await request(app)
      .get(`/api/tickets/${kavyaTicketId}`)
      .set('Cookie', employeeCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("don't have permission");
  });

  it('blocks employee from assigning technicians (HTTP 403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${priyaTicketId}/assign`)
      .set('Cookie', employeeCookie)
      .send({ assignedTechnicianId: null });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('blocks employee from changing ticket status (HTTP 403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${priyaTicketId}/status`)
      .set('Cookie', employeeCookie)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
