import crypto from 'crypto';

export function hashQuery(question, depth = 'quick') {
  const normalized = (question || '').trim().toLowerCase();
  return crypto
    .createHash('sha256')
    .update(`${normalized}:${depth}`)
    .digest('hex');
}
