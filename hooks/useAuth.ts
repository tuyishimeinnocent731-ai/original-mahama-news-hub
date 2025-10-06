import { useState, useEffect, useCallback } from 'react';
import { User, Article, SubscriptionPlan, Ad } from '../types';

const USER_STORAGE_KEY = 'mahama_news_hub_user';
const OFFLINE_ARTICLES_KEY_PREFIX = 'mahama_offline_article_';

const defaultUser: Omit<User, 'email' | 'name' | 'avatar'> = {
    subscription: 'free',
    savedArticles: [],
    bio: '',
    userAds: [],
};

// Utility to convert image URL to base64
const toBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return url; // Fallback to original URL
    }
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                const name = parsedUser.name || parsedUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase());
                const avatar = parsedUser.avatar || `https://i.pravatar.cc/150?u=${parsedUser.email}`;
                
                // Check for offline articles
                const savedArticlesWithOfflineStatus = parsedUser.savedArticles.map((article: Article) => {
                    const offlineData = localStorage.getItem(`${OFFLINE_ARTICLES_KEY_PREFIX}${article.id}`);
                    return offlineData ? { ...article, ...JSON.parse(offlineData), isOffline: true } : article;
                });

                setUser({ ...defaultUser, ...parsedUser, name, avatar, savedArticles: savedArticlesWithOfflineStatus });
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem(USER_STORAGE_KEY);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserStorage = (updatedUser: User) => {
        try {
            // Don't store the large base64 image data in the main user object
            const userToStore = { ...updatedUser, savedArticles: updatedUser.savedArticles.map(({ isOffline, ...rest}) => rest) };
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
            setUser(updatedUser);
        } catch (error) {
            console.error("Failed to save user to localStorage", error);
        }
    };

    const login = useCallback((email: string) => {
        const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase());
        const avatar = `https://i.pravatar.cc/150?u=${email}`;
        const userData: User = { email, name, avatar, subscription: 'free', savedArticles: [], bio: '', userAds: [] };
        updateUserStorage(userData);
    }, []);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
        } catch (error) {
            console.error("Failed to remove user from localStorage", error);
        }
    }, []);
    
    const register = useCallback((email: string) => {
        login(email);
    }, [login]);

    const updateSubscription = useCallback((plan: SubscriptionPlan) => {
        if (user) {
            const updatedUser = { ...user, subscription: plan };
            updateUserStorage(updatedUser);
        }
    }, [user]);

    const saveArticle = useCallback(async (article: Article) => {
        if (user && !user.savedArticles.some(a => a.id === article.id)) {
            // Save article content for offline access
            const imageBase64 = await toBase64(article.urlToImage);
            const offlineArticleData = {
                ...article,
                urlToImage: imageBase64,
            };
            localStorage.setItem(`${OFFLINE_ARTICLES_KEY_PREFIX}${article.id}`, JSON.stringify(offlineArticleData));

            const articleWithStatus = { ...article, isOffline: true };
            const updatedUser = { ...user, savedArticles: [...user.savedArticles, articleWithStatus] };
            updateUserStorage(updatedUser);
        }
    }, [user]);

    const unsaveArticle = useCallback((articleId: string) => {
        if (user) {
            // Remove offline data
            localStorage.removeItem(`${OFFLINE_ARTICLES_KEY_PREFIX}${articleId}`);
            const updatedUser = { ...user, savedArticles: user.savedArticles.filter(a => a.id !== articleId) };
            updateUserStorage(updatedUser);
        }
    }, [user]);

    const isArticleSaved = useCallback((articleId: string) => {
        return user?.savedArticles.some(a => a.id === articleId) || false;
    }, [user]);
    
    const updateProfile = useCallback((profileData: Partial<Pick<User, 'name' | 'avatar' | 'bio'>>) => {
        if (user) {
            const updatedUser = { ...user, ...profileData };
            updateUserStorage(updatedUser);
        }
    }, [user]);

    const createAd = useCallback((ad: Omit<Ad, 'id'>) => {
        if(user && user.subscription === 'pro') {
            const newAd = { ...ad, id: `user-ad-${Date.now()}` };
            const updatedUser = { ...user, userAds: [...user.userAds, newAd] };
            updateUserStorage(updatedUser);
        }
    }, [user]);

    const clearOfflineArticles = useCallback(() => {
        if (!user) return;
        
        user.savedArticles.forEach(article => {
            localStorage.removeItem(`${OFFLINE_ARTICLES_KEY_PREFIX}${article.id}`);
        });

        const updatedArticles = user.savedArticles.map(a => ({...a, isOffline: false }));
        const updatedUser = { ...user, savedArticles: updatedArticles };
        // We only update the state here, but don't re-save to local storage,
        // as the offline articles are gone. The main user object will still list them as saved, just not available offline.
        setUser(updatedUser);
        
    }, [user]);

    return { 
        user, 
        login, 
        logout, 
        register, 
        loading, 
        isLoggedIn: !!user,
        updateSubscription,
        saveArticle,
        unsaveArticle,
        isArticleSaved,
        updateProfile,
        createAd,
        clearOfflineArticles,
    };
};