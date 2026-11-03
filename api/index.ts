import fs from 'fs';
import path from 'path';

// If running in Vercel Serverless environment, copy the pre-seeded SQLite database to /tmp
if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  if (!fs.existsSync(tmpDbPath)) {
    const candidatePaths = [
      path.join(process.cwd(), 'backend', 'prisma', 'dev.db'),
      path.join(__dirname, '..', 'backend', 'prisma', 'dev.db'),
      path.join(__dirname, 'dev.db'),
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          fs.copyFileSync(p, tmpDbPath);
          break;
        } catch {}
      }
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

import { app } from '../backend/src/app';

export default app;
