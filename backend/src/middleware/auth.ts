import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { config } from '../config';
import { AppError } from './errorHandler';
import { UserRole, AccountStatus } from '@helpdesk360/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        status: AccountStatus;
        departmentId?: string | null;
      };
      sessionToken?: string;
    }
  }
}

interface SessionPayload {
  userId: string;
  exp: number; // millisecond timestamp
  rnd: string;
}

export function generateSignedToken(userId: string, expiresAt: Date): string {
  const payload: SessionPayload = {
    userId,
    exp: expiresAt.getTime(),
    rnd: crypto.randomBytes(16).toString('hex'),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifySignedToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(payloadB64)
    .digest('base64url');

  if (signature.length !== expectedSignature.length) return null;
  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
    if (!isValid) return null;

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );
    if (!payload.userId || !payload.exp) return null;
    if (Date.now() > payload.exp) return null; // Expired
    return payload;
  } catch {
    return null;
  }
}

// In-memory revocation cache for explicitly logged-out stateless tokens
const revokedTokens = new Set<string>();

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.sessionDurationDays);

  const token = generateSignedToken(userId, expiresAt);

  // Still attempt to store in Prisma session table for audit/revocation
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  }).catch(() => {});

  return { token, expiresAt };
}

export async function deleteSession(token: string): Promise<void> {
  revokedTokens.add(token);
  await prisma.session.deleteMany({
    where: { token },
  }).catch(() => {});
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[config.sessionCookieName];

    // Fallback support for Authorization: Bearer <token>
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      throw new AppError('Authentication required. Please sign in.', 401);
    }

    if (revokedTokens.has(token)) {
      throw new AppError('Session expired. Please sign in again.', 401);
    }

    let sessionUser: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      departmentId: string | null;
    } | null = null;

    // 1. Try finding in DB first (fast path if running on same container / stateful DB)
    const dbSession = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            departmentId: true,
          },
        },
      },
    }).catch(() => null);

    if (dbSession) {
      if (new Date() > dbSession.expiresAt) {
        await prisma.session.delete({ where: { token } }).catch(() => {});
        throw new AppError('Session expired. Please sign in again.', 401);
      }
      sessionUser = dbSession.user;
    } else {
      // 2. Stateless cryptographic verification (essential for serverless multi-container instances)
      const verified = verifySignedToken(token);
      if (!verified) {
        throw new AppError('Session not found or expired. Please sign in again.', 401);
      }

      // Lookup user in current container's database
      const user = await prisma.user.findUnique({
        where: { id: verified.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          departmentId: true,
        },
      }).catch(() => null);

      if (!user) {
        throw new AppError('Session not found or expired. Please sign in again.', 401);
      }

      sessionUser = user;

      // Opportunistically sync session to this container's SQLite DB
      prisma.session.upsert({
        where: { token },
        create: {
          token,
          userId: user.id,
          expiresAt: new Date(verified.exp),
        },
        update: {},
      }).catch(() => {});
    }

    if (sessionUser.status !== 'ACTIVE') {
      await prisma.session.delete({ where: { token } }).catch(() => {});
      throw new AppError(
        `Your account is ${sessionUser.status.toLowerCase()}. Please contact your IT administrator.`,
        403
      );
    }

    req.user = {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role as UserRole,
      status: sessionUser.status as AccountStatus,
      departmentId: sessionUser.departmentId,
    };
    req.sessionToken = token;

    next();
  } catch (error) {
    next(error);
  }
}
