import { apiClient } from './client.js';

export async function apiSubmitFeedback({ messageId, rating, reason = '' }) {
  return apiClient('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({ messageId, rating, reason }),
  });
}

export async function apiGetMessageFeedback(messageId) {
  return apiClient(`/api/feedback/message/${messageId}`);
}
