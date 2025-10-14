// frontend: services/newsService.ts - appended powerful APIs
import { api } from './apiService';
import { Article } from '../types';

// Keep existing functions as-is; append these
export const getRecommendations = async (userId: string, count = 10): Promise<Article[]> => {
  return api.get(`/api/recommendations?userId=${encodeURIComponent(userId)}&count=${count}`);
};

export const searchArticles = async (query: string, filters: Record<string, any> = {}, page = 1, limit = 10) => {
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('page', String(page));
  params.append('limit', String(limit));
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
  return api.get(`/api/search?${params.toString()}`);
};

export const syncExternalNews = async (source?: string) => {
  return api.post('/api/external/sync', { source });
};

export const getTrendingArticles = async (limit = 10) => {
  return api.get(`/api/articles?category=World&page=1&limit=${limit}`);
};

// Bookmarks
export const addBookmark = async (articleId: string) => api.post('/api/bookmarks', { articleId });
export const removeBookmark = async (bookmarkId: string) => api.delete(`/api/bookmarks/${encodeURIComponent(bookmarkId)}`);
export const getBookmarks = async () => api.get('/api/bookmarks');
