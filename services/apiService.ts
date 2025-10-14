// frontend: services/apiService.ts - improved error handling and env-based base URL
export const API_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000';

const getAuthToken = () => {
  try {
    const auth = localStorage.getItem('auth');
    if (auth) return JSON.parse(auth).token;
  } catch (err) {
    console.warn('apiService: failed to parse token', err);
  }
  return null;
};

const buildHeaders = (isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: buildHeaders(true), credentials: 'include' });
    if (!res.ok) {
      const txt = await res.text();
      let message = txt;
      try { message = JSON.parse(txt).message || txt; } catch {}
      throw new Error(`HTTP ${res.status}: ${message}`);
    }
    return res.json();
  },

  post: async <T>(endpoint: string, body: any, isJson = true): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(isJson),
      credentials: 'include',
      body: isJson ? JSON.stringify(body) : body
    });
    if (!res.ok) {
      const txt = await res.text();
      let message = txt;
      try { message = JSON.parse(txt).message || txt; } catch {}
      throw new Error(`HTTP ${res.status}: ${message}`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return (await res.text()) as unknown as T;
  },

  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'PUT', headers: buildHeaders(true), credentials: 'include', body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers: buildHeaders(true), credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
};
