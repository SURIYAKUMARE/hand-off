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
            console.log('Successfully copied SQLite DB to', tmpDbPath);
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
function getApp() {
  if (!app) {
    setupDb();
    try {
      const backend = require('../backend/dist/app');
      app = backend.app;
    } catch (err) {
      console.error('Error loading backend app:', err);
    }
  }
  return app;
}

module.exports = (req, res) => {
  const application = getApp();
  if (!application) {
    return res.status(500).json({ error: 'Backend application failed to initialize.' });
  }

  // 1. Check Vercel headers for original request path
  const matchedPath =
    req.headers['x-vercel-matched-path'] ||
    req.headers['x-matched-path'] ||
    req.headers['x-forwarded-uri'] ||
    req.headers['x-original-uri'];

  if (matchedPath && !matchedPath.includes('handler') && !matchedPath.includes('[...path]')) {
    req.url = matchedPath;
  } else if (req.query && req.query.path) {
    // 2. Handled via api/[...path].js wildcard route
    const subPath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
    const queryIdx = req.url.indexOf('?');
    const queryString = queryIdx !== -1 ? req.url.substring(queryIdx) : '';
    req.url = `/api/${subPath}${queryString}`;
  } else if (req.url.startsWith('/api/handler') || req.url.startsWith('/api/[...path]')) {
    // 3. Fallback when routed to handler endpoint directly
    const queryIdx = req.url.indexOf('?');
    const queryString = queryIdx !== -1 ? req.url.substring(queryIdx) : '';
    const cleanUrl = req.url.replace(/^\/api\/(handler|\[\.\.\.path\])(\.js)?/, '/api');
    req.url = cleanUrl || `/api${queryString}`;
  }

  return application(req, res);
};
