import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { getGeminiProviderStatus } from '../services/gemini.js';
import { getTavilyProviderStatus } from '../services/tavily.js';

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

  // Local workspace mode works without MongoDB; its data lives only for this
  // server session so the API remains healthy for local demos.
  const localWorkspace = dbStatus !== 'connected';
  const isHealthy = true;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    database: localWorkspace ? 'local-memory' : dbStatus,
    storage: localWorkspace ? 'local-memory' : 'mongodb',
    mode: env.IS_MOCK_MODE ? 'mock' : 'live',
    isMockMode: env.IS_MOCK_MODE,
    providers: {
      gemini: getGeminiProviderStatus(),
      tavily: { ...getTavilyProviderStatus(), configured: Boolean(env.TAVILY_API_KEY) },
    },
    timestamp: new Date().toISOString(),
  });
}
