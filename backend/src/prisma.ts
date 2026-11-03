import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  if (!fs.existsSync(tmpDbPath)) {
    const candidates = [
      path.join(process.cwd(), 'backend', 'prisma', 'production-seed.db'),
      path.join(__dirname, '..', 'prisma', 'production-seed.db'),
      path.join(__dirname, '..', '..', 'backend', 'prisma', 'production-seed.db'),
      path.join(process.cwd(), 'backend', 'prisma', 'dev.db'),
      path.join(__dirname, '..', 'prisma', 'dev.db'),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        try {
          fs.copyFileSync(candidate, tmpDbPath);
          break;
        } catch (e) {
          console.error('Failed to copy db to /tmp:', e);
        }
      }
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'test' ? [] : ['warn', 'error'],
});

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}
