import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { CreateAssetSchema } from '@helpdesk360/shared';

const router = Router();

router.use(authenticate);

// 1. List assets
router.get('/', async (req, res, next) => {
  try {
    const { search, type, departmentId, status } = req.query as any;

    const where: any = {};
    if (type && type !== 'ALL') where.type = type;
    if (departmentId && departmentId !== 'ALL') where.departmentId = departmentId;
    if (status && status !== 'ALL') where.status = status;
    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { assetTag: { contains: q } },
        { name: { contains: q } },
        { serialNumber: { contains: q } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
        _count: {
          select: {
            tickets: { where: { status: { not: 'CLOSED' } } },
          },
        },
      },
    });

    const result = assets.map((a) => ({
      id: a.id,
      assetTag: a.assetTag,
      name: a.name,
      type: a.type,
      serialNumber: a.serialNumber,
      assignedUserId: a.assignedUserId,
      assignedUser: a.assignedUser,
      departmentId: a.departmentId,
      department: a.department,
      status: a.status,
      activeTicketCount: a._count.tickets,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

    return res.json({
      success: true,
      assets: result,
    });
  } catch (error) {
    next(error);
  }
});

// 2. Add asset (Admin / Technician)
router.post('/', requireRole(['ADMIN', 'TECHNICIAN']), validateBody(CreateAssetSchema), async (req, res, next) => {
  try {
    const { assetTag, name, type, serialNumber, assignedUserId, departmentId, status } = req.body;

    const existing = await prisma.asset.findUnique({ where: { assetTag: assetTag.trim() } });
    if (existing) {
      throw new AppError('An asset with this tag already exists.', 400);
    }

    const asset = await prisma.asset.create({
      data: {
        assetTag: assetTag.trim(),
        name: name.trim(),
        type,
        serialNumber: serialNumber ? serialNumber.trim() : null,
        assignedUserId: assignedUserId || null,
        departmentId: departmentId || null,
        status: status || 'ACTIVE',
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'ASSET_CREATED',
        targetType: 'ASSET',
        targetId: asset.id,
        metadataJson: JSON.stringify({ assetTag: asset.assetTag, name: asset.name }),
      },
    });

    return res.status(201).json({
      success: true,
      asset,
      message: `Asset ${asset.assetTag} created successfully.`,
    });
  } catch (error) {
    next(error);
  }
});

// 3. Update asset
router.patch('/:id', requireRole(['ADMIN', 'TECHNICIAN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, serialNumber, assignedUserId, departmentId, status } = req.body;

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        name,
        type,
        serialNumber,
        assignedUserId,
        departmentId,
        status,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return res.json({
      success: true,
      asset: updated,
      message: 'Asset updated successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
