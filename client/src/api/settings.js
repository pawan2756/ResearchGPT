import { apiClient } from './client.js';

export async function apiGetSettings() {
  return apiClient('/api/settings');
}

export async function apiUpdateSettings(settings) {
  return apiClient('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}
