import { app } from './app';
import { config } from './config';
import { prisma, checkDatabaseHealth } from './prisma';

async function startServer() {
  try {
    const isDbConnected = await checkDatabaseHealth();
    if (!isDbConnected) {
      console.warn('Warning: Database connection check failed on startup. Will continue...');
    } else {
      console.log('Database connected successfully.');
    }

    const server = app.listen(config.port, () => {
      console.log(`HelpDesk 360 Backend running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`Health check: http://localhost:${config.port}/api/health`);
    });

    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Server and database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
}

startServer();
