import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';

describe('Auth API (/api/auth)', () => {
  const app = createApp();

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  it('signup 201 creates user and returns token without passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('signup 409 on duplicate email', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'duplicate@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'duplicate@example.com', password: 'differentpassword' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('signup 400 on invalid input or short password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'bad-email', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('login 200 with valid credentials returns token without passwordHash', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'login@example.com', password: 'securePassword123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'securePassword123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('login 401 on wrong password', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'user@example.com', password: 'correctPassword' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('protected route without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('protected route with valid token returns current user', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'me@example.com', password: 'password123' });

    const token = signupRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});
