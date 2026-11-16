import { apiClient } from './client.js';

export async function apiAskQuestion({ chatId, question }) {
  return apiClient('/api/chat/ask', {
    method: 'POST',
    body: JSON.stringify({ chatId, question }),
  });
}

export async function apiGetChats({ page = 1, limit = 20, q = '' } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(q ? { q } : {}),
  });
  return apiClient(`/api/chats?${query.toString()}`, {
    method: 'GET',
  });
}

export async function apiGetChat(chatId) {
  return apiClient(`/api/chats/${chatId}`, {
    method: 'GET',
  });
}

export async function apiUpdateChatTitle(chatId, title) {
  return apiClient(`/api/chats/${chatId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function apiDeleteChat(chatId) {
  return apiClient(`/api/chats/${chatId}`, {
    method: 'DELETE',
  });
}
