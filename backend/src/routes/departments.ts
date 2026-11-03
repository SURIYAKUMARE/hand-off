import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { CreateDepartmentSchema, UpdateDepartmentSchema } from '@helpdesk360/shared';

const router = Router();

router.use(authenticate);

// 1. Get all departments (accessible by all authenticated roles for ticket creation dropdowns)
router.get('/', async (_req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            tickets: true,
            assets: true,
          },
        },
      },
    });

    const result = departments.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      isActive: d.isActive,
      userCount: d._count.users,
      ticketCount: d._count.tickets,
      assetCount: d._count.assets,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    return res.json({
      success: true,
      departments: result,
    });
  } catch (error) {
    next(error);
  }
});

// 2. Create department (Admin only)
router.post('/', requireRole('ADMIN'), validateBody(CreateDepartmentSchema), async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await prisma.department.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      throw new AppError('A department with this name already exists.', 400);
    }

    const dept = await prisma.department.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'DEPARTMENT_CREATED',
        targetType: 'DEPARTMENT',
        targetId: dept.id,
        metadataJson: JSON.stringify({ name: dept.name }),
      },
    });

    return res.status(201).json({
      success: true,
      department: dept,
      message: `Department ${dept.name} created.`,
    });
  } catch (error) {
    next(error);
  }
});

// 3. Update department (Admin only)
router.patch('/:id', requireRole('ADMIN'), validateBody(UpdateDepartmentSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Department not found.', 404);
    }

    if (name && name.trim() !== existing.name) {
      const nameTaken = await prisma.department.findUnique({ where: { name: name.trim() } });
      if (nameTaken) {
        throw new AppError('Department name already in use.', 400);
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        description,
        isActive,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'DEPARTMENT_UPDATED',
        targetType: 'DEPARTMENT',
        targetId: id,
        metadataJson: JSON.stringify(req.body),
      },
    });

    return res.json({
      success: true,
      department: updated,
      message: 'Department updated.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
