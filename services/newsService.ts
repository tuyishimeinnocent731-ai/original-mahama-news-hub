import { api } from './apiService';
export const getRecommendations = async (userId: string|null, count = 10) => api.get(`/api/recommendations?userId=${encodeURIComponent(userId||'')}&count=${count}`);
export const searchArticles = async (query: string, page = 1, limit = 10) => api.get(`/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
export const syncExternalNews = async (source?: string) => api.post('/api/external/sync', { source });
export const getTrendingArticles = async (limit = 10) => api.get(`/api/analytics/trending?limit=${limit}`);
export const addBookmark = async (articleId: string) => api.post('/api/bookmarks', { articleId });
export const removeBookmark = async (bookmarkId: string) => api.delete(`/api/bookmarks/${encodeURIComponent(bookmarkId)}`);
export const getBookmarks = async () => api.get('/api/bookmarks');
