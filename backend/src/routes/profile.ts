import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { UpdateProfileSchema, ChangePasswordSchema } from '@helpdesk360/shared';

const router = Router();

router.use(authenticate);

// 1. Get current profile
router.get('/', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        employeeId: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        technicianProfile: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      profile: user,
    });
  } catch (error) {
    next(error);
  }
});

// 2. Update profile name
router.patch('/', validateBody(UpdateProfileSchema), async (req, res, next) => {
  try {
    const { name } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        employeeId: true,
        department: { select: { id: true, name: true } },
      },
    });

    return res.json({
      success: true,
      profile: updated,
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// 3. Change password securely validating current password
router.post('/change-password', validateBody(ChangePasswordSchema), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'PASSWORD_CHANGED_SELF',
        targetType: 'USER',
        targetId: user.id,
      },
    });

    return res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
