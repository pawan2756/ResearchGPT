const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Network error: Unable to connect to server. Please check your connection.');
  }

  // Handle 401 Unauthorized by clearing stale credentials
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return null;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.code = data?.error?.code || 'REQUEST_FAILED';
    err.status = res.status;
    throw err;
  }

  return data;
}
