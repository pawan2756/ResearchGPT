import { QueryCache } from '../models/QueryCache.js';
import { hashQuery } from '../utils/hash.js';
import { logger } from '../utils/logger.js';

const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export { hashQuery };

export async function getCached(hash) {
  try {
    const entry = await QueryCache.findOne({
      queryHash: hash,
      expiresAt: { $gt: new Date() },
    }).lean();

    return entry ? entry.results : null;
  } catch (err) {
    logger.warn({ err: err.message }, 'QueryCache lookup failed. Proceeding without cache.');
    return null;
  }
}

export async function setCached(hash, results, ttlMs = DEFAULT_TTL_MS) {
  try {
    const expiresAt = new Date(Date.now() + ttlMs);
    await QueryCache.findOneAndUpdate(
      { queryHash: hash },
      { queryHash: hash, results, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to write to QueryCache.');
  }
}
