import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

// Active SSE client connections keyed by userId
const sseClients = new Map<string, Set<Response>>();

// Active Web Push subscriptions keyed by userId
const pushSubscriptions = new Map<string, any[]>();

// In-memory user preferences store (with defaults)
const userPreferences = new Map<string, {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  urgentOnly: boolean;
}>();

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

// 4. Web Push VAPID Public Key
router.get('/push/public-key', (_req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjS5Snfyzj0n34nF86-gWq8qX2Z-Q';
  return res.json({
    success: true,
    publicKey,
  });
});

// 5. Register Web Push Subscription
router.post('/push/subscribe', (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      throw new AppError('Invalid push subscription payload.', 400);
    }

    if (!pushSubscriptions.has(userId)) {
      pushSubscriptions.set(userId, []);
    }

    const userSubs = pushSubscriptions.get(userId)!;
    const exists = userSubs.some((s) => s.endpoint === subscription.endpoint);
    if (!exists) {
      userSubs.push(subscription);
    }

    return res.status(201).json({
      success: true,
      message: 'Push notifications registered successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// 6. User Notification Preferences
router.get('/preferences', (req, res) => {
  const userId = req.user!.id;
  const prefs = userPreferences.get(userId) || {
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    urgentOnly: false,
  };

  return res.json({
    success: true,
    preferences: prefs,
  });
});

router.patch('/preferences', (req, res) => {
  const userId = req.user!.id;
  const current = userPreferences.get(userId) || {
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    urgentOnly: false,
  };

  const updated = {
    ...current,
    ...req.body,
  };

  userPreferences.set(userId, updated);

  return res.json({
    success: true,
    preferences: updated,
    message: 'Notification preferences updated.',
  });
});

// 7. Server-Sent Events (SSE) Stream
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
