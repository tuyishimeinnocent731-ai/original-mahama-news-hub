export const API_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000';

const getAuthToken = () => {
  try {
    const auth = localStorage.getItem('auth');
    if (auth) return JSON.parse(auth).token;
  } catch (err) { console.warn('apiService token parse', err); }
  return null;
};

const buildHeaders = (isJson = true) => {
  const headers: Record<string,string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: buildHeaders(true), credentials: 'include' });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status}: ${txt}`); }
    return res.json();
  },
  post: async <T>(endpoint: string, body: any, isJson = true): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: buildHeaders(isJson), credentials: 'include', body: isJson ? JSON.stringify(body) : body });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status}: ${txt}`); }
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : (await res.text()) as unknown as T;
  },
  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'PUT', headers: buildHeaders(true), credentials: 'include', body: JSON.stringify(body) });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status}: ${txt}`); }
    return res.json();
  },
  delete: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers: buildHeaders(true), credentials: 'include' });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status}: ${txt}`); }
    return res.json();
  }
};
