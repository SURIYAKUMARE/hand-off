import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
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
  SubmitFeedbackSchema,
  TicketPriority,
  TicketStatus,
} from '@helpdesk360/shared';
import {
  createTicket,
  assignTechnician,
  updateTicketStatus,
} from '../services/ticketService';

const router = Router();

// Ensure attachments directory exists (use /tmp in serverless / Vercel environments)
const UPLOAD_DIR = process.env.VERCEL
  ? path.join('/tmp', 'uploads', 'attachments')
  : path.resolve(__dirname, '../../uploads/attachments');

try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Upload directory initialization notice:', e);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Disallowed file type. Allowed: Images, PDF, TXT, CSV, ZIP.', 400));
    }
  },
});

// All ticket routes require authentication
router.use(authenticate);

// ==========================================
// 1. DUPLICATE TICKET DETECTION
// ==========================================
router.get('/duplicates', async (req, res, next) => {
  try {
    const { title } = req.query as any;
    if (!title || String(title).trim().length < 3) {
      return res.json({ success: true, duplicates: [] });
    }

    const words = String(title)
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 3);

    if (words.length === 0) {
      return res.json({ success: true, duplicates: [] });
    }

    const similar = await prisma.ticket.findMany({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        OR: words.map((w) => ({ title: { contains: w } })),
      },
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
      },
      take: 5,
    });

    return res.json({
      success: true,
      duplicates: similar,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. CREATE TICKET
// ==========================================
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

// ==========================================
// 3. LIST TICKETS
// ==========================================
router.get('/', validateQuery(TicketFilterSchema), async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      assigneeId,
      departmentId,
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

    // Filter by Department
    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId;
    }

    // Filter by Assignee
    if (assigneeId) {
      if (assigneeId === 'unassigned') {
        where.assignedTechnicianId = null;
      } else {
        where.assignedTechnicianId = assigneeId;
      }
    }

    // Search by Ticket ID, Title, or Reporter
    if (search && search.trim() !== '') {
      const trimmed = search.trim();
      where.OR = [
        { ticketNumber: { contains: trimmed } },
        { title: { contains: trimmed } },
        { reporter: { name: { contains: trimmed } } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    let orderBy: any = [];
    if (req.user!.role === 'TECHNICIAN' && !req.query.sort) {
      orderBy = [{ priority: 'desc' }, { createdAt: 'desc' }];
    } else {
      orderBy = [{ [sort]: order }];
    }

    const [total, tickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          reporter: {
            select: { id: true, name: true, email: true },
          },
          assignedTechnician: {
            select: { id: true, name: true, email: true },
          },
          department: {
            select: { id: true, name: true },
          },
          asset: {
            select: { id: true, assetTag: true, name: true, type: true },
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. GET SINGLE TICKET DETAIL
// ==========================================
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
        department: {
          select: { id: true, name: true },
        },
        asset: {
          select: { id: true, assetTag: true, name: true, type: true },
        },
        attachments: {
          include: {
            uploader: { select: { id: true, name: true } },
          },
        },
        feedback: true,
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, name: true, role: true },
            },
            attachments: true,
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

    // Internal Notes Security: If caller is EMPLOYEE, completely remove internal notes!
    if (req.user!.role === 'EMPLOYEE') {
      ticket.comments = ticket.comments.filter((c) => !c.isInternal);
    }

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. ATTACHMENT UPLOADS
// ==========================================
router.post('/:id/attachments', upload.single('file'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { commentId } = req.body;

    if (!req.file) {
      throw new AppError('No file uploaded.', 400);
    }

    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { ticketNumber: id.toUpperCase() }] },
    });
    if (!ticket) {
      throw new AppError('Ticket not found.', 404);
    }

    if (req.user!.role === 'EMPLOYEE' && ticket.reporterId !== req.user!.id) {
      throw new AppError('Permission denied.', 403);
    }

    const attachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        storagePath: req.file.path,
        ticketId: ticket.id,
        commentId: commentId || null,
        uploaderId: req.user!.id,
      },
      include: {
        uploader: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({
      success: true,
      attachment,
      message: 'Attachment uploaded successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 6. DOWNLOAD ATTACHMENT
// ==========================================
router.get('/attachments/:attachmentId/download', async (req, res, next) => {
  try {
    const { attachmentId } = req.params;
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      throw new AppError('Attachment not found.', 404);
    }

    if (req.user!.role === 'EMPLOYEE' && attachment.ticket.reporterId !== req.user!.id) {
      throw new AppError('Access denied to attachment.', 403);
    }

    if (!fs.existsSync(attachment.storagePath)) {
      throw new AppError('File missing on disk.', 404);
    }

    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.fileName}"`);
    return fs.createReadStream(attachment.storagePath).pipe(res);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 7. SUBMIT TICKET FEEDBACK
// ==========================================
router.post('/:id/feedback', validateBody(SubmitFeedbackSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { ticketNumber: id.toUpperCase() }] },
    });

    if (!ticket) {
      throw new AppError('Ticket not found.', 404);
    }

    if (ticket.reporterId !== req.user!.id) {
      throw new AppError('Only the ticket reporter can submit satisfaction feedback.', 403);
    }

    if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
      throw new AppError('Feedback can only be provided after ticket resolution.', 400);
    }

    const existingFeedback = await prisma.ticketFeedback.findUnique({
      where: { ticketId: ticket.id },
    });
    if (existingFeedback) {
      throw new AppError('Feedback has already been submitted for this ticket.', 400);
    }

    const feedback = await prisma.ticketFeedback.create({
      data: {
        ticketId: ticket.id,
        employeeId: req.user!.id,
        rating,
        comment: comment ? comment.trim() : null,
      },
    });

    return res.status(201).json({
      success: true,
      feedback,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 8. ASSIGN TECHNICIAN
// ==========================================
router.patch(
  '/:id/assign',
  requireRole(['TECHNICIAN', 'ADMIN']),
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

// ==========================================
// 9. UPDATE TICKET STATUS
// ==========================================
router.patch(
  '/:id/status',
  requireRole(['TECHNICIAN', 'ADMIN']),
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
