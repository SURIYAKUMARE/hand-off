import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../prisma';
import { seed } from '../../prisma/seed';

describe('Enterprise Features 1-8 Verification Tests', () => {
  let employeeCookie: string[];
  let adminCookie: string[];
  let employeeToken: string;
  let adminToken: string;

  beforeAll(async () => {
    await seed();

    // Authenticate Employee
    const empLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.nair@helpdesk.local', password: 'Password123!' });
    employeeCookie = empLogin.headers['set-cookie'] as any;
    employeeToken = empLogin.body.token;

    // Authenticate Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@helpdesk.local', password: 'Password123!' });
    adminCookie = adminLogin.headers['set-cookie'] as any;
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ==========================================
  // FEATURE 7: AI TICKET CATEGORIZATION & SMART ASSIST
  // ==========================================
  describe('Feature 7: AI Ticket Categorization & Recommendations', () => {
    it('accurately categorizes hardware ticket and suggests action', async () => {
      const res = await request(app)
        .post('/api/tickets/ai-suggest')
        .set('Cookie', employeeCookie)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          title: 'Dell laptop does not turn on',
          description: 'My charger is connected and battery light is blinking amber, but screen stays black.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.suggestion.category).toBe('HARDWARE');
      expect(res.body.suggestion.suggestedAction).toContain('power');
      expect(res.body.suggestion.explanation).toContain('laptop');
      expect(Array.isArray(res.body.suggestion.suggestedArticles)).toBe(true);
    });

    it('identifies urgent incident with meeting constraint', async () => {
      const res = await request(app)
        .post('/api/tickets/ai-suggest')
        .set('Cookie', employeeCookie)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          title: 'VPN disconnected during executive board meeting',
          description: 'I have an important meeting in 30 minutes and production network is completely down.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.suggestion.category).toBe('NETWORK');
      expect(res.body.suggestion.priority).toBe('URGENT');
      expect(res.body.suggestion.isUrgentIncident).toBe(true);
    });
  });

  // ==========================================
  // FEATURE 3: AUTOMATIC TICKET ESCALATION
  // ==========================================
  describe('Feature 3: SLA-Based Ticket Escalation Engine', () => {
    it('executes escalation sweep and audits SLA breaches', async () => {
      // Create an overdue ticket intentionally with expired deadline
      const pastDate = new Date(Date.now() - 5 * 3600 * 1000); // 5 hours ago
      const expiredTicket = await prisma.ticket.create({
        data: {
          ticketNumber: 'HD-TEST-OVERDUE',
          title: 'Expired critical server issue',
          description: 'This ticket has breached its resolution SLA.',
          category: 'SOFTWARE',
          priority: 'MEDIUM',
          status: 'OPEN',
          reporterId: (await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } }))!.id,
          slaDeadline: pastDate,
          firstResponseDeadline: pastDate,
        },
      });

      // Run escalation check as admin
      const sweepRes = await request(app)
        .post('/api/admin/escalations/run-check')
        .set('Cookie', adminCookie)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(sweepRes.status).toBe(200);
      expect(sweepRes.body.success).toBe(true);
      expect(sweepRes.body.result.breachesEscalated).toBeGreaterThanOrEqual(1);

      // Verify the ticket was escalated in the database
      const refreshed = await prisma.ticket.findUnique({
        where: { id: expiredTicket.id },
        include: { events: true },
      });

      expect(refreshed?.isEscalated).toBe(true);
      expect(refreshed?.priority).toBe('HIGH'); // Bumped from MEDIUM
      const escalationEvent = refreshed?.events.find((e) => e.eventType === 'ESCALATED');
      expect(escalationEvent).toBeDefined();

      // Clean up test ticket
      await prisma.ticket.delete({ where: { id: expiredTicket.id } });
    });

    it('lists escalated tickets in admin panel', async () => {
      const res = await request(app)
        .get('/api/admin/escalations')
        .set('Cookie', adminCookie)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.tickets)).toBe(true);
    });
  });

  // ==========================================
  // FEATURE 2: EMAIL, PUSH AND IN-APP NOTIFICATIONS
  // ==========================================
  describe('Feature 2: Push Notifications & User Preferences', () => {
    it('retrieves VAPID public key for Web Push', async () => {
      const res = await request(app)
        .get('/api/notifications/push/public-key')
        .set('Cookie', employeeCookie)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.publicKey).toBe('string');
    });

    it('registers Web Push subscription', async () => {
      const res = await request(app)
        .post('/api/notifications/push/subscribe')
        .set('Cookie', employeeCookie)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          subscription: {
            endpoint: 'https://fcm.googleapis.com/fcm/send/fake-test-device-id',
            keys: {
              p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0P61G0QWfqQIe0LWDG2A',
              auth: 'tBHItDaA7mWG4w_yKVPbAg',
            },
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('manages user notification preferences', async () => {
      const getRes = await request(app)
        .get('/api/notifications/preferences')
        .set('Cookie', employeeCookie)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.preferences).toHaveProperty('emailNotifications');

      const patchRes = await request(app)
        .patch('/api/notifications/preferences')
        .set('Cookie', employeeCookie)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ urgentOnly: true });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.preferences.urgentOnly).toBe(true);
    });
  });

  // ==========================================
  // FEATURE 8: CSV AND PDF REPORT EXPORT
  // ==========================================
  describe('Feature 8: CSV and PDF Report Export', () => {
    it('exports well-formatted CSV reports', async () => {
      const res = await request(app)
        .get('/api/admin/reports/export-csv')
        .set('Cookie', adminCookie)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Ticket Number,Title,Category,Priority,Status');
      expect(res.text).toContain('HD-1042');
    });

    it('generates compliant binary PDF reports with %PDF-1.4 header', async () => {
      const res = await request(app)
        .get('/api/admin/reports/export-pdf')
        .set('Cookie', adminCookie)
        .set('Authorization', `Bearer ${adminToken}`)
        .buffer(true)
        .parse((r, cb) => {
          const chunks: any[] = [];
          r.on('data', (c) => chunks.push(c));
          r.on('end', () => cb(null, Buffer.concat(chunks)));
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');

      const pdfBuf = res.body as Buffer;
      const pdfHeader = pdfBuf.subarray(0, 8).toString('latin1');
      expect(pdfHeader).toContain('%PDF-1.4');

      const pdfStr = pdfBuf.toString('latin1');
      expect(pdfStr).toContain('/Type /Catalog');
      expect(pdfStr).toContain('HelpDesk 360');
      expect(pdfStr).toContain('%%EOF');
    });
  });
});
