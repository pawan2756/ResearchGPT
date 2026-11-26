import { apiClient } from './client.js';

export async function apiGetAnalyticsSummary() {
  return apiClient('/api/analytics/summary');
}
