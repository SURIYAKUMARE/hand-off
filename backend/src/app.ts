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
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Trust proxy for rate limiting behind reverse proxies / docker
app.set('trust proxy', 1);

// Standard Middlewares
app.use(
  cors({
    origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', userRoutes);
app.use('/api', healthRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found.',
  });
});

// Centralized Error Handler
app.use(errorHandler);
