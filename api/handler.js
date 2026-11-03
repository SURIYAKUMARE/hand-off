const fs = require('fs');
const path = require('path');

let dbInitialized = false;

function setupDb() {
  if (dbInitialized) return;
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'backend', 'prisma', 'production-seed.db'),
        path.join(__dirname, '..', 'backend', 'prisma', 'production-seed.db'),
        path.join(process.cwd(), 'backend', 'prisma', 'dev.db'),
        path.join(__dirname, '..', 'backend', 'prisma', 'dev.db'),
        path.join(__dirname, 'production-seed.db'),
        path.join(__dirname, 'dev.db'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          } catch (e) {
            console.error('Failed to copy db:', e);
          }
        }
      }
    }
    process.env.DATABASE_URL = 'file:' + tmpDbPath;
  }
  dbInitialized = true;
}

setupDb();

let app;
try {
  const backend = require('../backend/dist/app');
  app = backend.app;
} catch (err) {
  console.error('Error loading backend app:', err);
}

module.exports = (req, res) => {
  setupDb();
  if (!app) {
    return res.status(500).json({ error: 'Backend application failed to initialize.' });
  }
  return app(req, res);
};
