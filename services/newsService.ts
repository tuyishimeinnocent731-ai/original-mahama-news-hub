import { GoogleGenAI, Type } from "@google/genai";
import { Ad, Article } from '../types';

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
let offlineArticleIds: string[] = loadFromStorage<string[]>('offline-articles', []);

const updateOfflineStatus = (article: Article): Article => ({
    ...article,
    isOffline: offlineArticleIds.includes(article.id)
});

// --- Article Service Functions ---
export const getAllArticles = async (): Promise<Article[]> => {
    const now = new Date();
    // Filter out scheduled articles for non-admins and update offline status
    const visibleArticles = articles
        .filter(a => !a.scheduledFor || new Date(a.scheduledFor) <= now)
        .map(updateOfflineStatus);
    return Promise.resolve(visibleArticles);
};

export const deleteArticle = (articleId: string): void => {
    articles = articles.filter(article => article.id !== articleId);
    saveToStorage('articles', articles);
};

export const updateArticle = (articleId: string, articleData: Partial<Omit<Article, 'id'>>): Article | null => {
    const articleIndex = articles.findIndex(a => a.id === articleId);
    if (articleIndex === -1) return null;
    
    const updatedArticle = { ...articles[articleIndex], ...articleData };
    articles[articleIndex] = updatedArticle;
    saveToStorage('articles', articles);
    return updatedArticle;
};

export const getArticles = async (category: string = 'World'): Promise<Article[]> => {
    console.log(`Fetching articles for category: ${category}`);
    const now = new Date();
    const lowerCategory = category.toLowerCase();

    const filtered = articles.filter(article => {
        // Exclude future-scheduled articles
        if (article.scheduledFor && new Date(article.scheduledFor) > now) {
            return false;
        }

        if (lowerCategory === 'world') return ['world', 'europe', 'asia', 'americas', 'africa'].includes(article.category.toLowerCase());
        if (lowerCategory === 'business') return ['business', 'markets', 'companies', 'economy'].includes(article.category.toLowerCase());
        if (lowerCategory === 'technology') return ['technology', 'ai', 'gadgets', 'innovation'].includes(article.category.toLowerCase());
        if (lowerCategory === 'entertainment') return ['entertainment', 'movies', 'music', 'gaming'].includes(article.category.toLowerCase());
        return article.category.toLowerCase() === lowerCategory;
    }).map(updateOfflineStatus);
    
    return Promise.resolve(filtered);
};

export const getTopStories = async (): Promise<Article[]> => {
    const now = new Date();
    const sorted = [...articles]
        .filter(a => !a.scheduledFor || new Date(a.scheduledFor) <= now)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return Promise.resolve(sorted.slice(0, 4).map(updateOfflineStatus));
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
    const now = new Date();
    return articles
        .filter(a => !a.scheduledFor || new Date(a.scheduledFor) <= now)
        .find(a => a.category.toLowerCase() === category.toLowerCase()) 
        || articles[0] 
        || null;
};

export const getArticlesForMegaMenu = (category: string, count: number = 2): Article[] => {
    const now = new Date();
    const availableArticles = articles.filter(a => !a.scheduledFor || new Date(a.scheduledFor) <= now);
    const lowerCategory = category.toLowerCase();
    
    const allCategoryArticles = availableArticles.filter(article => article.category.toLowerCase() === lowerCategory);
    if (allCategoryArticles.length > 0) return allCategoryArticles.slice(0, count);

    const subCategoryArticles = availableArticles.filter(article => {
        if (lowerCategory === 'world') return ['africa', 'americas', 'asia', 'europe'].includes(article.category.toLowerCase());
        if (lowerCategory === 'business') return ['markets', 'companies'].includes(article.category.toLowerCase());
        if (lowerCategory === 'technology') return ['ai', 'gadgets', 'innovation'].includes(article.category.toLowerCase());
        if (lowerCategory === 'entertainment') return ['movies', 'music', 'gaming'].includes(article.category.toLowerCase());
        return false;
    });

    return subCategoryArticles.slice(0, count);
};

export const searchArticles = async (query: string, filters: { category?: string; author?: string } = {}): Promise<Article[]> => {
    console.log(`Searching for: ${query} with filters:`, filters);
    const lowercasedQuery = query.toLowerCase();
    const now = new Date();
    
    return Promise.resolve(articles.filter(a => {
        if (a.scheduledFor && new Date(a.scheduledFor) > now) {
            return false;
        }

        const queryMatch = !query || (
            a.title.toLowerCase().includes(lowercasedQuery) || 
            a.description.toLowerCase().includes(lowercasedQuery) ||
            a.body.toLowerCase().includes(lowercasedQuery)
        );

        const categoryMatch = !filters.category || a.category.toLowerCase() === filters.category.toLowerCase();
        const authorMatch = !filters.author || a.author.toLowerCase() === filters.author.toLowerCase();

        return queryMatch && categoryMatch && authorMatch;
    }).map(updateOfflineStatus));
};

export const getSearchSuggestions = async (query: string): Promise<Article[]> => {
    if (!query) return [];
    const lowercasedQuery = query.toLowerCase();
    const now = new Date();
    return Promise.resolve(
        articles.filter(a => 
            (!a.scheduledFor || new Date(a.scheduledFor) <= now) &&
            a.title.toLowerCase().includes(lowercasedQuery)
        ).slice(0, 5).map(updateOfflineStatus)
    );
};

export const getRelatedArticles = async (currentArticleId: string, category: string): Promise<Article[]> => {
    const now = new Date();
    const availableArticles = articles.filter(a => !a.scheduledFor || new Date(a.scheduledFor) <= now);
    
    const relatedInCategory = availableArticles.filter(a =>
        a.id !== currentArticleId && a.category.toLowerCase() === category.toLowerCase()
    );

    if (relatedInCategory.length >= 4) {
        return Promise.resolve(relatedInCategory.slice(0, 4).map(updateOfflineStatus));
    }

    const otherArticles = availableArticles.filter(a => {
        if (a.id === currentArticleId) return false;
        if (relatedInCategory.some(r => r.id === a.id)) return false;
        return true;
    });
    
    const combined = [...relatedInCategory, ...otherArticles];
    return Promise.resolve(combined.slice(0, 4).map(updateOfflineStatus));
};

// --- Offline Functionality ---
export const saveArticleForOffline = (articleId: string) => {
    if (!offlineArticleIds.includes(articleId)) {
        offlineArticleIds.push(articleId);
        saveToStorage('offline-articles', offlineArticleIds);
    }
};

export const removeArticleFromOffline = (articleId: string) => {
    offlineArticleIds = offlineArticleIds.filter(id => id !== articleId);
    saveToStorage('offline-articles', offlineArticleIds);
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

export const updateAd = (adId: string, adData: Partial<Omit<Ad, 'id'>>): Ad | null => {
    const adIndex = ads.findIndex(a => a.id === adId);
    if (adIndex === -1) return null;
    
    const updatedAd = { ...ads[adIndex], ...adData };
    ads[adIndex] = updatedAd;
    saveToStorage('ads', ads);
    return updatedAd;
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
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = response.text;
        return text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    } catch (error) {
        console.error("Error getting key points:", error);
        return ["Could not extract key points at this time."];
    }
};

export const askAboutArticle = async (body: string, title: string, question: string): Promise<string> => {
    const prompt = `Based on the following article, please answer the user's question. If the answer is not in the article, say that you cannot find the information in the provided text.
    
    Title: ${title}
    Article: ${body}
    
    Question: ${question}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error answering question about article:", error);
        return "Sorry, I encountered an error while trying to answer your question.";
    }
};

export const generateImageForArticle = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `News article illustration, professional digital art style. ${prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Sorry, we couldn't generate an image at this time.");
    }
};

export const translateArticle = async (body: string, title: string, targetLanguage: string): Promise<{ title: string, body: string }> => {
    const prompt = `Translate the following news article into ${targetLanguage}. Return a JSON object with two keys: "translatedTitle" and "translatedBody". Do not add any other text or markdown formatting outside of the JSON object.
    Original Title: ${title}
    Original Body: ${body}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translatedTitle: { type: Type.STRING },
                        translatedBody: { type: Type.STRING }
                    },
                    required: ["translatedTitle", "translatedBody"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        return {
            title: parsed.translatedTitle,
            body: parsed.translatedBody,
        };
    } catch (error) {
        console.error(`Error translating article to ${targetLanguage}:`, error);
        return { title: "Translation Failed", body: "We couldn't translate this article at the moment. Please try again later." };
    }
};