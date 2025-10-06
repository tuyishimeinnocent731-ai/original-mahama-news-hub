import { GoogleGenAI } from "@google/genai";
import { Ad, Article } from '../types';

// FIX: Initializing Gemini AI Client according to guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- LocalStorage Persistence ---
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from storage`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to storage`, error);
    }
};

// --- Data Stores (loaded from localStorage) ---
let articles: Article[] = loadFromStorage<Article[]>('articles', []);
let ads: Ad[] = loadFromStorage<Ad[]>('ads', []);


// --- Article Service Functions ---
export const getAllArticles = async (): Promise<Article[]> => {
    return Promise.resolve(articles);
};

export const deleteArticle = (articleId: string): void => {
    articles = articles.filter(article => article.id !== articleId);
    saveToStorage('articles', articles);
};

export const getArticles = async (category: string = 'World'): Promise<Article[]> => {
    console.log(`Fetching articles for category: ${category}`);
    const lowerCategory = category.toLowerCase();
    const filtered = articles.filter(article => {
        if (lowerCategory === 'world') return ['world', 'europe', 'asia', 'americas', 'africa'].includes(article.category.toLowerCase());
        if (lowerCategory === 'business') return ['business', 'markets', 'companies', 'economy'].includes(article.category.toLowerCase());
        if (lowerCategory === 'technology') return ['technology', 'ai', 'gadgets', 'innovation'].includes(article.category.toLowerCase());
        return article.category.toLowerCase() === lowerCategory;
    });
    return Promise.resolve(filtered);
};

export const getTopStories = async (): Promise<Article[]> => {
    const sorted = [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return Promise.resolve(sorted.slice(0, 4));
}

export const addArticle = (articleData: Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>): Article => {
    const newArticle: Article = {
        ...articleData,
        id: `article-${Date.now()}`,
        publishedAt: new Date().toISOString(),
        source: { name: 'Mahama News Hub' },
        url: '#',
    };
    articles.unshift(newArticle);
    saveToStorage('articles', articles);
    return newArticle;
};

export const getFeaturedArticleForCategory = (category: string): Article | null => {
    return articles.find(a => a.category.toLowerCase() === category.toLowerCase()) || articles[0] || null;
};

export const getArticlesForMegaMenu = (category: string, count: number = 2): Article[] => {
    const lowerCategory = category.toLowerCase();
    const allCategoryArticles = articles.filter(article => article.category.toLowerCase() === lowerCategory);
    if (allCategoryArticles.length > 0) return allCategoryArticles.slice(0, count);

    // Fallback for parent categories like 'World'
    const subCategoryArticles = articles.filter(article => {
        if (lowerCategory === 'world') return ['africa', 'americas', 'asia', 'europe'].includes(article.category.toLowerCase());
        if (lowerCategory === 'business') return ['markets', 'companies'].includes(article.category.toLowerCase());
        if (lowerCategory === 'technology') return ['ai', 'gadgets', 'innovation'].includes(article.category.toLowerCase());
        return false;
    });

    return subCategoryArticles.slice(0, count);
};

export const searchArticles = async (query: string): Promise<Article[]> => {
    console.log(`Searching for: ${query}`);
    if (!query) return [];
    const lowercasedQuery = query.toLowerCase();
    return Promise.resolve(articles.filter(a => 
        a.title.toLowerCase().includes(lowercasedQuery) || 
        a.description.toLowerCase().includes(lowercasedQuery) ||
        a.body.toLowerCase().includes(lowercasedQuery)
    ));
};

export const getRelatedArticles = async (currentArticleId: string, category: string): Promise<Article[]> => {
    const relatedInCategory = articles.filter(a =>
        a.id !== currentArticleId && a.category.toLowerCase() === category.toLowerCase()
    );

    if (relatedInCategory.length >= 4) {
        return Promise.resolve(relatedInCategory.slice(0, 4));
    }

    // Get other articles to fill up, excluding current article and ones already selected.
    const otherArticles = articles.filter(a => {
        if (a.id === currentArticleId) return false;
        if (relatedInCategory.some(r => r.id === a.id)) return false;
        return true;
    });
    
    const combined = [...relatedInCategory, ...otherArticles];
    return Promise.resolve(combined.slice(0, 4));
};

// --- Ad Service Functions ---
export const getAds = async (): Promise<Ad[]> => {
    return Promise.resolve(ads);
};

export const addAd = (adData: Omit<Ad, 'id'>): Ad => {
    const newAd: Ad = {
        ...adData,
        id: `ad-${Date.now()}`,
    };
    ads.unshift(newAd);
    saveToStorage('ads', ads);
    return newAd;
};

export const deleteAd = (adId: string): void => {
    ads = ads.filter(ad => ad.id !== adId);
    saveToStorage('ads', ads);
};


// --- Gemini API Functions ---
export const summarizeArticle = async (body: string, title: string): Promise<string> => {
    const prompt = `Summarize the following news article in 3-4 concise sentences, focusing on the main points.
    Title: ${title}
    Article: ${body}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // FIX: Using .text property to get the response text, as per guidelines
        return response.text;
    } catch (error) {
        console.error("Error summarizing article:", error);
        return "Sorry, we couldn't generate a summary at this time.";
    }
};

export const getKeyPoints = async (body: string): Promise<string[]> => {
    const prompt = `Extract the 3 to 5 most important key points from the following article. Present them as a list. Do not use markdown like '*' or '-'. Each point should be a separate line.
    Article: ${body}`;

    try {
        const response = await ai.models.generateContent({
            // FIX: Corrected typo in model name
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // FIX: Using .text property to get the response text and parsing it, as per guidelines
        const text = response.text;
        return text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    } catch (error) {
        console.error("Error getting key points:", error);
        return ["Could not extract key points at this time."];
    }
};