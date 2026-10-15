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
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

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

router.get('/me', authenticate, (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

export default router;
