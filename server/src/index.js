import mongoose from 'mongoose';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

let mongodInstance = null;

async function bootstrap() {
  try {
    logger.info(`Starting ResearchGPT server (Mock mode: ${env.IS_MOCK_MODE ? 'ACTIVE' : 'OFF'})...`);

    // Connect when available. Local mock mode uses the in-process workspace
    // store, so the application remains usable without MongoDB.
    try {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      logger.info('Connected to local/remote MongoDB successfully.');
    } catch (dbErr) {
      logger.warn({ err: dbErr.message }, 'MongoDB is unavailable; using the local in-memory workspace store.');
    }

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`ResearchGPT Server listening on http://localhost:${env.PORT}`);
      logger.info(`Allowed Client Origin: ${env.CLIENT_ORIGIN}`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close(false);
        if (mongodInstance) {
          await mongodInstance.stop();
        }
        logger.info('Closed database connection and HTTP server.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.fatal({ err }, 'Fatal startup error');
    process.exit(1);
  }
}

bootstrap();
