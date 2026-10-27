import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function getHealth(req, res) {
  let dbStatus = 'disconnected';
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db?.admin?.()?.ping?.() || Promise.resolve();
      dbStatus = 'connected';
    }
  } catch {
    dbStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    database: dbStatus,
    mode: env.IS_MOCK_MODE ? 'mock' : 'live',
    isMockMode: env.IS_MOCK_MODE,
    timestamp: new Date().toISOString(),
  });
}
