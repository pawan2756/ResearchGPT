import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import chatsRoutes from './routes/chats.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import evalRoutes from './routes/eval.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import settingsRoutes from './routes/settings.routes.js';

export function createApp() {
  const app = express();

  // 1. Request ID tagging
  app.use(requestIdMiddleware);

  // 2. Security headers
  app.use(helmet());

  // 3. CORS restricted strictly to CLIENT_ORIGIN
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // 4. JSON body parser with size limit
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 5. Pino request logging (strictly no request bodies to preserve privacy)
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info({
        reqId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
      });
    });
    next();
  });

  // 6. Routes under /api
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/chats', chatsRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/eval', evalRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/settings', settingsRoutes);

  // 7. Not Found and Global Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
