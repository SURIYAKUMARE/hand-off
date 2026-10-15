import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../prisma';
import { seed } from '../../prisma/seed';

describe('Authentication and Authorization API Tests', () => {
  beforeAll(async () => {
    await seed();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejects login with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'Password123!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.nair@helpdesk.local', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid email or password');
  });

  it('successfully authenticates employee and sets secure cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.nair@helpdesk.local', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('Priya Nair');
    expect(res.body.user.role).toBe('EMPLOYEE');

    // Verify Set-Cookie header is present
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('helpdesk360_sid=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('persists session and allows /api/auth/me retrieval', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'arjun.mehta@helpdesk.local', password: 'Password123!' });

    const cookie = loginRes.headers['set-cookie'][0];

    // 2. Query /api/auth/me with cookie
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.name).toBe('Arjun Mehta');
    expect(meRes.body.user.role).toBe('TECHNICIAN');
  });

  it('properly logs out and invalidates session token', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.nair@helpdesk.local', password: 'Password123!' });

    const cookie = loginRes.headers['set-cookie'][0];

    // 2. Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);

    expect(logoutRes.status).toBe(200);

    // 3. Attempt to access protected endpoint with old cookie
    const protectedRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(protectedRes.status).toBe(401);
  });

  it('rejects unauthenticated requests to protected endpoints', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });
});
