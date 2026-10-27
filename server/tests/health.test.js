import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('GET /api/health', () => {
  it('returns health status and mock mode info', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');
    // Since mongoose is not connected in this unit test, it returns 503 degraded
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('mode');
    expect(res.body).toHaveProperty('isMockMode');
  });
});
