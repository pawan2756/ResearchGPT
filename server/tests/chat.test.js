import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { User } from '../src/models/User.js';
import { Chat } from '../src/models/Chat.js';
import { Message } from '../src/models/Message.js';
import { signToken } from '../src/services/authService.js';

describe('Chat API (/api/chat)', () => {
  const app = createApp();
  let user1, token1, user2, _token2;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();

    user1 = await User.create({ email: 'user1@example.com', passwordHash: 'hash123' });
    token1 = signToken(user1);

    user2 = await User.create({ email: 'user2@example.com', passwordHash: 'hash123' });
    _token2 = signToken(user2);
  });

  it('POST /api/chat/ask without chatId creates new chat and messages', async () => {
    const res = await request(app)
      .post('/api/chat/ask')
      .set('Authorization', `Bearer ${token1}`)
      .send({ question: 'Explain merge sort' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('chatId');
    expect(res.body.message).toHaveProperty('content');
    expect(res.body.message.mode).toBe('direct');
    expect(res.body).toHaveProperty('researchScore');
    expect(res.body).toHaveProperty('signals');
    expect(res.body).toHaveProperty('shouldPrompt');

    // Verify DB records
    const chatInDb = await Chat.findById(res.body.chatId);
    expect(chatInDb).not.toBeNull();
    expect(chatInDb.userId.toString()).toBe(user1.id);

    const messages = await Message.find({ chatId: res.body.chatId });
    expect(messages.length).toBe(2); // 1 user + 1 assistant
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('Explain merge sort');
    expect(messages[1].role).toBe('assistant');
  });

  it('POST /api/chat/ask with existing chatId appends to conversation', async () => {
    const chat = await Chat.create({ userId: user1.id, title: 'Existing Chat' });

    const res = await request(app)
      .post('/api/chat/ask')
      .set('Authorization', `Bearer ${token1}`)
      .send({ chatId: chat.id, question: 'What is O(n log n)?' });

    expect(res.status).toBe(200);
    expect(res.body.chatId).toBe(chat.id);

    const messages = await Message.find({ chatId: chat.id });
    expect(messages.length).toBe(2);
  });

  it('POST /api/chat/ask returns 400 on empty question', async () => {
    const res = await request(app)
      .post('/api/chat/ask')
      .set('Authorization', `Bearer ${token1}`)
      .send({ question: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/chat/ask returns 400 on question > 1000 characters', async () => {
    const longQuestion = 'a'.repeat(1001);
    const res = await request(app)
      .post('/api/chat/ask')
      .set('Authorization', `Bearer ${token1}`)
      .send({ question: longQuestion });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/chat/ask returns 403 if user tries to access another user chat', async () => {
    const chatUser2 = await Chat.create({ userId: user2.id, title: 'User 2 Secret Chat' });

    const res = await request(app)
      .post('/api/chat/ask')
      .set('Authorization', `Bearer ${token1}`)
      .send({ chatId: chatUser2.id, question: 'Intrude into chat' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('POST /api/chat/ask returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/chat/ask')
      .send({ question: 'Hello without token' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
