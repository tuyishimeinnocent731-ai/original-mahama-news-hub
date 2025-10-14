import { api } from './apiService';
export async function fetchRecommendations(userId: string|null, count = 10) {
  return api.get(`/api/recommendations?userId=${encodeURIComponent(userId||'')}&count=${count}`);
}
