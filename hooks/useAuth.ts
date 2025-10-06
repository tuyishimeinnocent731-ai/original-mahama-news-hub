import { useState, useEffect, useCallback } from 'react';
import { User, Article, SubscriptionPlan } from '../types';

const USER_STORAGE_KEY = 'mahama_news_hub_user';

const defaultUser: Omit<User, 'email' | 'name' | 'avatar'> = {
    subscription: 'free',
    savedArticles: [],
    bio: '',
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Backwards compatibility for users without name/avatar/bio
                const name = parsedUser.name || parsedUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase());
                const avatar = parsedUser.avatar || `https://i.pravatar.cc/150?u=${parsedUser.email}`;
                setUser({ ...defaultUser, ...parsedUser, name, avatar });
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
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error("Failed to save user to localStorage", error);
        }
    };

    const login = useCallback((email: string) => {
        const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase());
        const avatar = `https://i.pravatar.cc/150?u=${email}`;
        const userData: User = { email, name, avatar, subscription: 'free', savedArticles: [], bio: '' };
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

    const saveArticle = useCallback((article: Article) => {
        if (user && !user.savedArticles.some(a => a.id === article.id)) {
            const updatedUser = { ...user, savedArticles: [...user.savedArticles, article] };
            updateUserStorage(updatedUser);
        }
    }, [user]);

    const unsaveArticle = useCallback((articleId: string) => {
        if (user) {
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
    };
};
