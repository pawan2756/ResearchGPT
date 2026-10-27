import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'HH:MM:ss Z',
          },
        }
      : undefined,
});

/**
 * Log a research pipeline step safely without leaking prompts, queries, or secrets.
 * @param {string} reqId Request identifier
 * @param {string} step Step name (direct_answer, research_score, cache, tavily_search, credibility, generate, verify)
 * @param {number} ms Execution time in milliseconds
 * @param {object} meta Metadata containing only counts, flags, or scores
 */
export function logStep(reqId, step, ms, meta = {}) {
  // Ensure no sensitive fields like passwords, tokens, prompts, or raw queries are passed
  const safeMeta = { ...meta };
  delete safeMeta.password;
  delete safeMeta.token;
  delete safeMeta.prompt;
  delete safeMeta.rawText;
  delete safeMeta.apiKey;

  logger.info({
    type: 'pipeline_step',
    reqId,
    step,
    latencyMs: Math.round(ms),
    ...safeMeta,
  });
}
