import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../prisma';
import { seed } from '../../prisma/seed';

describe('Technician Dashboard Metrics Integrity Tests', () => {
  let techCookie: string;
  let employeeCookie: string;

  beforeAll(async () => {
    await seed();

    // Login Technician
    const techLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'arjun.mehta@helpdesk.local', password: 'Password123!' });
    techCookie = techLogin.headers['set-cookie'][0];

    // Login Employee
    const empLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.nair@helpdesk.local', password: 'Password123!' });
    employeeCookie = empLogin.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('blocks employees from accessing technician dashboard (HTTP 403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Cookie', employeeCookie);

    expect(res.status).toBe(403);
  });

  it('matches KPI counts exactly with live database aggregate queries', async () => {
    // 1. Fetch from Dashboard API
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    const { summary } = res.body;

    // 2. Query direct DB counts
    const dbOpen = await prisma.ticket.count({ where: { status: 'OPEN' } });
    const dbUrgent = await prisma.ticket.count({
      where: { priority: 'URGENT', status: { not: 'CLOSED' } },
    });
    const dbInProgress = await prisma.ticket.count({ where: { status: 'IN_PROGRESS' } });
    const dbCompleted = await prisma.ticket.count({
      where: { status: { in: ['RESOLVED', 'CLOSED'] } },
    });

    expect(summary.openIssues).toBe(dbOpen);
    expect(summary.urgentRequests).toBe(dbUrgent);
    expect(summary.inProgress).toBe(dbInProgress);
    expect(summary.completed).toBe(dbCompleted);
  });

  it('matches Status Distribution counts with database aggregates', async () => {
    const res = await request(app)
      .get('/api/dashboard/status-distribution')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    const { distribution } = res.body;

    for (const item of distribution) {
      const dbCount = await prisma.ticket.count({
        where: { status: item.status },
      });
      expect(item.count).toBe(dbCount);
    }
  });

  it('matches Priority Distribution counts with database aggregates', async () => {
    const res = await request(app)
      .get('/api/dashboard/priority-distribution')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    const { distribution } = res.body;

    for (const item of distribution) {
      const dbCount = await prisma.ticket.count({
        where: { priority: item.priority },
      });
      expect(item.count).toBe(dbCount);
    }
  });

  it('matches Technician Workload counts with real users and allocations', async () => {
    const res = await request(app)
      .get('/api/dashboard/workload')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    const { workload } = res.body;

    expect(workload.length).toBeGreaterThanOrEqual(3);
    for (const tech of workload) {
      const dbAssigned = await prisma.ticket.count({
        where: { assignedTechnicianId: tech.technicianId },
      });
      expect(tech.assigned).toBe(dbAssigned);
    }
  });

  it('returns recent activity items from audit event log', async () => {
    const res = await request(app)
      .get('/api/dashboard/activity')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    expect(res.body.activity).toBeDefined();
    expect(Array.isArray(res.body.activity)).toBe(true);
  });
});
