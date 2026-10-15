import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody, validateQuery } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import {
  CreateTicketSchema,
  AssignTicketSchema,
  UpdateStatusSchema,
  TicketFilterSchema,
  TicketPriority,
  TicketStatus,
} from '@helpdesk360/shared';
import {
  createTicket,
  assignTechnician,
  updateTicketStatus,
} from '../services/ticketService';

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

// 1. Create a ticket (Employee or Technician)
router.post('/', validateBody(CreateTicketSchema), async (req, res, next) => {
  try {
    const ticket = await createTicket(req.user!.id, req.body);
    return res.status(201).json({
      success: true,
      ticket,
      message: `Ticket ${ticket.ticketNumber} created successfully.`,
    });
  } catch (error) {
    next(error);
  }
});

// 2. List tickets with role scoping, server filtering, search, sorting & pagination
router.get('/', validateQuery(TicketFilterSchema), async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      assigneeId,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query as any;

    const where: any = {};

    // Role Scoping: Employees can ONLY view tickets they created
    if (req.user!.role === 'EMPLOYEE') {
      where.reporterId = req.user!.id;
    }

    // Filter by Status
    if (status) {
      where.status = status;
    }

    // Filter by Priority
    if (priority) {
      where.priority = priority;
    }

    // Filter by Category
    if (category) {
      where.category = category;
    }

    // Filter by Assignee
    if (assigneeId) {
      if (assigneeId === 'unassigned') {
        where.assignedTechnicianId = null;
      } else {
        where.assignedTechnicianId = assigneeId;
      }
    }

    // Search by Ticket ID (e.g. HD-1042) or Title
    if (search && search.trim() !== '') {
      const trimmed = search.trim();
      where.OR = [
        { ticketNumber: { contains: trimmed } },
        { title: { contains: trimmed } },
      ];
    }

    const skip = (page - 1) * limit;

    // Define Sorting Order
    // Default queue ordering for technicians: Urgent tickets first, then newest
    let orderBy: any = [];
    if (req.user!.role === 'TECHNICIAN' && !req.query.sort) {
      // Prioritize urgent requests in default view
      orderBy = [
        { priority: 'desc' }, // URGENT first alphabetically/lexicographically or custom
        { createdAt: 'desc' },
      ];
    } else {
      orderBy = [{ [sort]: order }];
    }

    const [total, tickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          reporter: {
            select: { id: true, name: true, email: true },
          },
          assignedTechnician: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 3. Get single ticket detail with full history, comments, and events
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id.toUpperCase() }],
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        assignedTechnician: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
          include: {
            changer: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new AppError('Ticket not found.', 404);
    }

    // Role Scoping: Employees cannot view another employee's ticket!
    if (req.user!.role === 'EMPLOYEE' && ticket.reporterId !== req.user!.id) {
      throw new AppError("You don't have permission to view this ticket.", 403);
    }

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
});

// 4. Assign Technician (Technician only)
router.patch(
  '/:id/assign',
  requireRole('TECHNICIAN'),
  validateBody(AssignTicketSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { assignedTechnicianId } = req.body;

      const updated = await assignTechnician(id, assignedTechnicianId, req.user!.id);

      return res.json({
        success: true,
        ticket: updated,
        message: 'Technician assignment updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// 5. Update Ticket Status (Technician only, strict state machine)
router.patch(
  '/:id/status',
  requireRole('TECHNICIAN'),
  validateBody(UpdateStatusSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await updateTicketStatus(id, status as TicketStatus, req.user!.id);

      return res.json({
        success: true,
        ticket: updated,
        message: `Ticket status updated to ${status}.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
