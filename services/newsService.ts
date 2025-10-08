import { Ad, Article } from '../types';
import { api } from './apiService';

// --- Article Service Functions ---
export const getAllArticles = async (): Promise<Article[]> => {
    return api.get<Article[]>('/api/articles/all'); // Assuming an admin-only endpoint
};

export const deleteArticle = async (articleId: string): Promise<void> => {
    await api.delete(`/api/articles/${articleId}`);
};

export const updateArticle = async (articleId: string, articleData: Partial<Omit<Article, 'id'>>): Promise<Article> => {
    const formData = new FormData();
    Object.entries(articleData).forEach(([key, value]) => {
        if (value) formData.append(key, value instanceof Blob ? value : String(value));
    });
    // Check if urlToImage is a new upload (base64)
    if (articleData.urlToImage && articleData.urlToImage.startsWith('data:')) {
         const fetchRes = await fetch(articleData.urlToImage);
         const blob = await fetchRes.blob();
         formData.set('image', blob);
         formData.delete('urlToImage'); // remove base64 from body
    }
    
    return api.putFormData<Article>(`/api/articles/${articleId}`, formData);
};

export const getArticles = async (category: string = 'World'): Promise<Article[]> => {
    return api.get<Article[]>(`/api/articles?category=${encodeURIComponent(category)}`);
};

export const getTopStories = async (): Promise<Article[]> => {
    return api.get<Article[]>('/api/articles/top-stories');
}

export const addArticle = async (articleData: Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>): Promise<Article> => {
    const formData = new FormData();
    Object.entries(articleData).forEach(([key, value]) => {
         if (value) formData.append(key, value as string);
    });
     // Handle base64 image upload
    if (articleData.urlToImage && articleData.urlToImage.startsWith('data:')) {
        const fetchRes = await fetch(articleData.urlToImage);
        const blob = await fetchRes.blob();
        formData.set('image', blob);
        formData.delete('urlToImage');
    }

    return api.postFormData<Article>('/api/articles', formData);
};

export const searchArticles = async (query: string, filters: { category?: string; author?: string } = {}): Promise<Article[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (filters.category) params.append('category', filters.category);
    if (filters.author) params.append('author', filters.author);
    return api.get<Article[]>(`/api/articles/search?${params.toString()}`);
};

export const getSearchSuggestions = async (query: string): Promise<Article[]> => {
    if (!query) return [];
    return api.get<Article[]>(`/api/articles/suggestions?query=${encodeURIComponent(query)}`);
};

export const getRelatedArticles = async (currentArticleId: string, category: string): Promise<Article[]> => {
    return api.get<Article[]>(`/api/articles/${currentArticleId}/related`);
};


// --- Ad Service Functions ---
export const getAds = async (): Promise<Ad[]> => {
    return api.get<Ad[]>('/api/ads');
};

export const addAd = async (adData: Omit<Ad, 'id'>): Promise<Ad> => {
    const formData = new FormData();
    Object.entries(adData).forEach(([key, value]) => {
         if (value) formData.append(key, value as string);
    });
    if (adData.image && adData.image.startsWith('data:')) {
        const fetchRes = await fetch(adData.image);
        const blob = await fetchRes.blob();
        formData.set('image', blob);
    }
    return api.postFormData<Ad>('/api/ads', formData);
};

export const deleteAd = async (adId: string): Promise<void> => {
    await api.delete(`/api/ads/${adId}`);
};

export const updateAd = async (adId: string, adData: Partial<Omit<Ad, 'id'>>): Promise<Ad> => {
    const formData = new FormData();
    Object.entries(adData).forEach(([key, value]) => {
         if (value) formData.append(key, value as string);
    });
    if (adData.image && adData.image.startsWith('data:')) {
        const fetchRes = await fetch(adData.image);
        const blob = await fetchRes.blob();
        formData.set('image', blob);
    }
    return api.putFormData<Ad>(`/api/ads/${adId}`, formData);
};

// --- Gemini API Functions (via backend) ---
export const summarizeArticle = async (body: string, title: string): Promise<string> => {
    const response = await api.post<{ summary: string }>('/api/ai/summarize', { body, title });
    return response.summary;
};

export const getKeyPoints = async (body: string): Promise<string[]> => {
    const response = await api.post<{ keyPoints: string[] }>('/api/ai/key-points', { body });
    return response.keyPoints;
};

export const askAboutArticle = async (body: string, title: string, question: string): Promise<string> => {
    const response = await api.post<{ answer: string }>('/api/ai/ask', { body, title, question });
    return response.answer;
};

export const generateImageForArticle = async (prompt: string): Promise<string> => {
    const response = await api.post<{ imageUrl: string }>('/api/ai/generate-image', { prompt });
    return response.imageUrl;
};

export const translateArticle = async (body: string, title: string, targetLanguage: string): Promise<{ title: string, body: string }> => {
    return await api.post<{ title: string, body: string }>('/api/ai/translate', { body, title, targetLanguage });
};


// --- Offline functions are deprecated as we move to a client-server model ---
export const saveArticleForOffline = (articleId: string) => {
    console.warn("Offline functionality should be re-implemented using Service Workers and Cache API.");
};

export const removeArticleFromOffline = (articleId: string) => {
     console.warn("Offline functionality should be re-implemented using Service Workers and Cache API.");
};

// FIX: Added missing function 'getArticlesForMegaMenu' with a mock implementation
// as it is called synchronously in the Header component.
export const getArticlesForMegaMenu = (category: string, count: number): Article[] => {
    // This is a mock implementation because the original component calls it synchronously.
    // In a real application, this data should be fetched asynchronously and managed in component state.
    const mockArticles: Article[] = [
        { id: 'mega-world-1', title: 'Global Summit Addresses Climate Change Urgently', urlToImage: '/uploads/placeholder.jpg', category: 'World', author: 'Jane Doe', publishedAt: new Date().toISOString(), body: '', description: '', source: { name: 'World News' }, url: '#' },
        { id: 'mega-world-2', title: 'New Alliances Form in European Politics', urlToImage: '/uploads/placeholder.jpg', category: 'Europe', author: 'John Smith', publishedAt: new Date().toISOString(), body: '', description: '', source: { name: 'World News' }, url: '#' },
        { id: 'mega-business-1', title: 'Tech Stocks Surge on AI Breakthroughs', urlToImage: '/uploads/placeholder.jpg', category: 'Business', author: 'Emily Jones', publishedAt: new Date().toISOString(), body: '', description: '', source: { name: 'BizTech' }, url: '#' },
        { id: 'mega-business-2', title: 'Market Volatility Expected to Continue', urlToImage: '/uploads/placeholder.jpg', category: 'Markets', author: 'Chris Brown', publishedAt: new Date().toISOString(), body: '', description: '', source: { name: 'Finance Times' }, url: '#' },
        { id: 'mega-tech-1', title: 'Quantum Computing Reaches New Milestone', urlToImage: '/uploads/placeholder.jpg', category: 'Technology', author: 'Alan Turing', publishedAt: new Date().toISOString(), body: '', description: '', source: { name: 'Tech Sphere' }, url: '#' },
        { id: 'mega-tech-2', title: 'The Rise of Smart Home Gadgets', urlToImage: '/uploads/placeholder.jpg', category: 'Gadgets', author: 'Ada Lovelace', publishedAt: new Date().toISOString(), body: '', description: '', source: { name: 'Tech Sphere' }, url: '#' },
    ];

    const articlesForCategory = mockArticles.filter(
        article => article.category.toLowerCase() === category.toLowerCase()
    );

    if (articlesForCategory.length > 0) {
        return articlesForCategory.slice(0, count);
    }
    
    // Fallback if category has no specific articles, return some generic ones.
    return mockArticles.slice(0, count);
};
