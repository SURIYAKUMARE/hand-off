import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  sessionSecret: process.env.SESSION_SECRET || 'helpdesk-360-enterprise-session-secret-key-99',
  sessionCookieName: 'helpdesk360_sid',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  sessionDurationDays: 7,
};
