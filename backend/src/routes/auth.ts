import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { config } from '../config';
import { createSession, deleteSession, authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { LoginSchema } from '@helpdesk360/shared';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.post('/login', loginRateLimiter, validateBody(LoginSchema), async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        department: {
          select: { id: true, name: true },
        },
        technicianProfile: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(
        `Account is ${user.status.toLowerCase()}. Please contact your IT administrator.`,
        403
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Record last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { token, expiresAt } = await createSession(user.id);

    // Set secure HTTP-only cookie
    res.cookie(config.sessionCookieName, token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
      path: '/',
      expires: rememberMe ? expiresAt : undefined, // session cookie if rememberMe not selected
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        employeeId: user.employeeId,
        department: user.department,
        technicianProfile: user.technicianProfile,
      },
      token, // Also return token for headless testing or bearer clients
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    if (req.sessionToken) {
      await deleteSession(req.sessionToken);
    }

    res.clearCookie(config.sessionCookieName, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
      path: '/',
    });

    return res.json({
      success: true,
      message: 'Signed out successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        employeeId: true,
        departmentId: true,
        department: {
          select: { id: true, name: true },
        },
        technicianProfile: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      user: fullUser,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
