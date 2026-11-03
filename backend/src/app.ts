import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import authRoutes from './routes/auth';
import ticketRoutes from './routes/tickets';
import commentRoutes from './routes/comments';
import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/users';
import healthRoutes from './routes/health';
import adminRoutes from './routes/admin';
import departmentsRoutes from './routes/departments';
import notificationsRoutes from './routes/notifications';
import knowledgeBaseRoutes from './routes/knowledgeBase';
import assetsRoutes from './routes/assets';
import profileRoutes from './routes/profile';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Trust proxy for rate limiting behind reverse proxies / docker
app.set('trust proxy', 1);

// Standard Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, same-origin, server-to-server) or localhost / vercel preview domains
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('vercel.app') || origin === config.corsOrigin) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Mount API routes (supports both direct /api/* and stripped /* from serverless rewrites)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/tickets', ticketRoutes);
app.use('/api/tickets', commentRoutes);
app.use('/tickets', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/departments', departmentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/knowledge-base', knowledgeBaseRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/assets', assetsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/profile', profileRoutes);
app.use('/api', userRoutes);
app.use('/', userRoutes);
app.use('/api', healthRoutes);
app.use('/', healthRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found.',
  });
});

// Centralized Error Handler
app.use(errorHandler);
