import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all active technicians for assignment dropdowns
router.get('/technicians', authenticate, async (_req, res, next) => {
  try {
    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.json({
      success: true,
      technicians,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
