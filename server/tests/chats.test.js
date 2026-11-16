import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { User } from '../src/models/User.js';
import { Chat } from '../src/models/Chat.js';
import { Message } from '../src/models/Message.js';
import { signToken } from '../src/services/authService.js';

describe('Chats History API (/api/chats)', () => {
  const app = createApp();
  let user1, token1, user2, token2;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();

    user1 = await User.create({ email: 'alice@example.com', passwordHash: 'hash123' });
    token1 = signToken(user1);

    user2 = await User.create({ email: 'bob@example.com', passwordHash: 'hash123' });
    token2 = signToken(user2);
  });

  it('lists chats with pagination and search filtering', async () => {
    // Create 3 chats for user1 and 1 for user2
    await Chat.create({ userId: user1.id, title: 'Binary Search Algorithm' });
    await Chat.create({ userId: user1.id, title: 'Graph Traversal BFS' });
    await Chat.create({ userId: user1.id, title: 'Sorting Algorithms' });
    await Chat.create({ userId: user2.id, title: 'Bob Private Chat' });

    // User1 list with limit=2, page=1
    const resPage1 = await request(app)
      .get('/api/chats?page=1&limit=2')
      .set('Authorization', `Bearer ${token1}`);

    expect(resPage1.status).toBe(200);
    expect(resPage1.body.chats.length).toBe(2);
    expect(resPage1.body.pagination.total).toBe(3);
    expect(resPage1.body.pagination.pages).toBe(2);

    // Search query q=Graph
    const resSearch = await request(app)
      .get('/api/chats?q=Graph')
      .set('Authorization', `Bearer ${token1}`);

    expect(resSearch.status).toBe(200);
    expect(resSearch.body.chats.length).toBe(1);
    expect(resSearch.body.chats[0].title).toBe('Graph Traversal BFS');

    // Bob should see only his chat
    const resBob = await request(app)
      .get('/api/chats')
      .set('Authorization', `Bearer ${token2}`);

    expect(resBob.status).toBe(200);
    expect(resBob.body.chats.length).toBe(1);
    expect(resBob.body.chats[0].title).toBe('Bob Private Chat');
  });

  it('GET /api/chats/:id returns chat details and messages', async () => {
    const chat = await Chat.create({ userId: user1.id, title: 'Chat With Messages' });
    await Message.create({ chatId: chat.id, role: 'user', content: 'What is quicksort?' });
    await Message.create({ chatId: chat.id, role: 'assistant', content: 'An O(n log n) sorting algorithm.' });

    const res = await request(app)
      .get(`/api/chats/${chat.id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.chat.title).toBe('Chat With Messages');
    expect(res.body.messages.length).toBe(2);
    expect(res.body.messages[0].content).toBe('What is quicksort?');
  });

  it('PATCH /api/chats/:id renames chat', async () => {
    const chat = await Chat.create({ userId: user1.id, title: 'Old Title' });

    const res = await request(app)
      .patch(`/api/chats/${chat.id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: 'New Renamed Title' });

    expect(res.status).toBe(200);
    expect(res.body.chat.title).toBe('New Renamed Title');

    const updated = await Chat.findById(chat.id);
    expect(updated.title).toBe('New Renamed Title');
  });

  it('DELETE /api/chats/:id returns 204 and cascades message deletion', async () => {
    const chat = await Chat.create({ userId: user1.id, title: 'Chat To Delete' });
    await Message.create({ chatId: chat.id, role: 'user', content: 'Delete me' });

    const res = await request(app)
      .delete(`/api/chats/${chat.id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(204);

    const chatInDb = await Chat.findById(chat.id);
    expect(chatInDb).toBeNull();

    const messagesInDb = await Message.find({ chatId: chat.id });
    expect(messagesInDb.length).toBe(0);
  });

  it('cannot access, rename, or delete another user chat (403 Forbidden)', async () => {
    const aliceChat = await Chat.create({ userId: user1.id, title: 'Alice Protected Chat' });

    // Bob attempts to read
    const getRes = await request(app)
      .get(`/api/chats/${aliceChat.id}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(getRes.status).toBe(403);

    // Bob attempts to rename
    const patchRes = await request(app)
      .patch(`/api/chats/${aliceChat.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: 'Hacked Title' });
    expect(patchRes.status).toBe(403);

    // Bob attempts to delete
    const deleteRes = await request(app)
      .delete(`/api/chats/${aliceChat.id}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(deleteRes.status).toBe(403);

    // Verify Alice chat was not modified or deleted
    const stillExists = await Chat.findById(aliceChat.id);
    expect(stillExists).not.toBeNull();
    expect(stillExists.title).toBe('Alice Protected Chat');
  });
});
