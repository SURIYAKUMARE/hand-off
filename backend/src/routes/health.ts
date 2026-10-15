import { Router } from 'express';
import { checkDatabaseHealth } from '../prisma';

const router = Router();

router.get('/health', async (_req, res) => {
  const dbOk = await checkDatabaseHealth();

  if (!dbOk) {
    return res.status(503).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }

  return res.json({
    status: 'ok',
    database: 'connected',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
