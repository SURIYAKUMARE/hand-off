import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

// Active SSE client connections keyed by userId
const sseClients = new Map<string, Set<Response>>();

export function sendNotificationToUser(userId: string, notification: any) {
  const userClients = sseClients.get(userId);
  if (userClients) {
    const payload = `data: ${JSON.stringify(notification)}\n\n`;
    userClients.forEach((client) => {
      try {
        client.write(payload);
      } catch (err) {
        // Handled on client close
      }
    });
  }
}

// 1. Get recent notifications for user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

// 2. Mark specific notification as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!notification) {
      throw new AppError('Notification not found.', 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({
      success: true,
      notification: updated,
    });
  } catch (error) {
    next(error);
  }
});

// 3. Mark all notifications as read
router.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });

    return res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
});

// 4. Server-Sent Events (SSE) Stream
router.get('/stream', (req, res) => {
  const userId = req.user!.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId)!.add(res);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  // Heartbeat ping every 25s
  const interval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (e) {
      clearInterval(interval);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(interval);
    const clients = sseClients.get(userId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(userId);
      }
    }
  });
});

export default router;
