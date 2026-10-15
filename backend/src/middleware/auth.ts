import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { config } from '../config';
import { AppError } from './errorHandler';
import { UserRole } from '@helpdesk360/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
      };
      sessionToken?: string;
    }
  }
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.sessionDurationDays);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
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

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found or expired. Please sign in again.', 401);
    }

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { token } }).catch(() => {});
      throw new AppError('Session expired. Please sign in again.', 401);
    }

    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role as UserRole,
    };
    req.sessionToken = token;

    next();
  } catch (error) {
    next(error);
  }
}
