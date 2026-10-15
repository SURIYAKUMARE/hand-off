import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import {
  getDashboardSummary,
  getStatusDistribution,
  getPriorityDistribution,
  getTechnicianWorkload,
  getRecentActivity,
} from '../services/dashboardService';

const router = Router();

// Dashboard is restricted to Technicians
router.use(authenticate);
router.use(requireRole('TECHNICIAN'));

router.get('/summary', async (_req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    return res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
});

router.get('/status-distribution', async (_req, res, next) => {
  try {
    const distribution = await getStatusDistribution();
    return res.json({ success: true, distribution });
  } catch (error) {
    next(error);
  }
});

router.get('/priority-distribution', async (_req, res, next) => {
  try {
    const distribution = await getPriorityDistribution();
    return res.json({ success: true, distribution });
  } catch (error) {
    next(error);
  }
});

router.get('/workload', async (_req, res, next) => {
  try {
    const workload = await getTechnicianWorkload();
    return res.json({ success: true, workload });
  } catch (error) {
    next(error);
  }
});

router.get('/activity', async (_req, res, next) => {
  try {
    const activity = await getRecentActivity(15);
    return res.json({ success: true, activity });
  } catch (error) {
    next(error);
  }
});

export default router;
