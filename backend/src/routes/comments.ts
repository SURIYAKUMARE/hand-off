import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { CreateCommentSchema } from '@helpdesk360/shared';
import { addComment } from '../services/ticketService';

const router = Router({ mergeParams: true });

router.use(authenticate);

// 1. Get comments for a ticket
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { ticketNumber: id.toUpperCase() }] },
      select: { id: true, reporterId: true },
    });

    if (!ticket) {
      throw new AppError('Ticket not found.', 404);
    }

    if (req.user!.role === 'EMPLOYEE' && ticket.reporterId !== req.user!.id) {
      throw new AppError("You don't have permission to view comments for this ticket.", 403);
    }

    const comments = await prisma.comment.findMany({
      where: { ticketId: ticket.id },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return res.json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
});

// 2. Post a comment on a ticket
router.post('/:id/comments', validateBody(CreateCommentSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { ticketNumber: id.toUpperCase() }] },
      select: { id: true, reporterId: true },
    });

    if (!ticket) {
      throw new AppError('Ticket not found.', 404);
    }

    // Role check: Employee can only comment on their own ticket. Technicians can comment on any ticket.
    if (req.user!.role === 'EMPLOYEE' && ticket.reporterId !== req.user!.id) {
      throw new AppError("You don't have permission to comment on this ticket.", 403);
    }

    const comment = await addComment(ticket.id, req.user!.id, content);

    return res.status(201).json({
      success: true,
      comment,
      message: 'Comment posted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
