/**
 * Sets up headers and connection for Server-Sent Events (SSE).
 * @param {import('express').Response} res Express response object
 */
export function openSse(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
}

/**
 * Sends a single SSE event.
 * @param {import('express').Response} res Express response object
 * @param {string} event Event type name
 * @param {any} data Payload data
 */
export function sendEvent(res, event, data) {
  if (res.writableEnded) return;
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  res.write(`event: ${event}\ndata: ${payload}\n\n`);
  res.flush?.();
}

/**
 * Gracefully ends the SSE stream.
 * @param {import('express').Response} res Express response object
 */
export function closeSse(res) {
  if (!res.writableEnded) {
    res.end();
  }
}
