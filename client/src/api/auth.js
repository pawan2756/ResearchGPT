import { apiClient } from './client.js';

export async function apiSignup(email, password) {
  return apiClient('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogin(email, password) {
  return apiClient('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetMe() {
  return apiClient('/api/auth/me', {
    method: 'GET',
  });
}

export async function apiGetHealth() {
  return apiClient('/api/health', {
    method: 'GET',
  });
}
