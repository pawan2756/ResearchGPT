import { hashQuery } from '../utils/hash.js';
const cache = new Map();
const TTL = 6 * 60 * 60 * 1000;
export { hashQuery };
export async function getCached(hash) { const item = cache.get(hash); return item && item.expiresAt > Date.now() ? item.results : null; }
export async function setCached(hash, results, ttl = TTL) { cache.set(hash, { results, expiresAt: Date.now() + ttl }); }
