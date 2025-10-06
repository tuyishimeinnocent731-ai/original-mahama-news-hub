
import { useState, useEffect, useCallback } from 'react';
import { User, SubscriptionPlan, Ad, Article } from '../types';

const MOCK_USER: User = {
    id: 'user-123',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    avatar: 'https://i.pravatar.cc/150?u=alexj',
    subscription: 'free',
    savedArticles: ['1', '3'],
    bio: 'News enthusiast and tech lover.',
    userAds: [],
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Simulate checking auth status on component mount
        setAuthLoading(true);
        try {
            const storedUser = localStorage.getItem('auth-user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
                setIsLoggedIn(true);
            }
        } catch (e) {
            console.error("Failed to parse user from storage", e);
            localStorage.removeItem('auth-user');
        } finally {
            setTimeout(() => setAuthLoading(false), 500); // simulate network delay
        }
    }, []);

    const login = useCallback((email: string) => {
        setAuthLoading(true);
        const newUser: User = { ...MOCK_USER, email };
        localStorage.setItem('auth-user', JSON.stringify(newUser));
        setUser(newUser);
        setIsLoggedIn(true);
        setTimeout(() => setAuthLoading(false), 300);
    }, []);

    const logout = useCallback(() => {
        setAuthLoading(true);
        localStorage.removeItem('auth-user');
        setUser(null);
        setIsLoggedIn(false);
        setTimeout(() => setAuthLoading(false), 300);
    }, []);

    const updateProfile = useCallback((profileData: Partial<Pick<User, 'name' | 'bio'>>) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, ...profileData };
            localStorage.setItem('auth-user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    const subscribe = useCallback((plan: SubscriptionPlan) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, subscription: plan };
             if (plan === 'free') {
                updatedUser.savedArticles = [];
            }
            localStorage.setItem('auth-user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    const createAd = useCallback((ad: Omit<Ad, 'id'>) => {
        setUser(currentUser => {
            if (!currentUser || currentUser.subscription !== 'pro') return currentUser;
            const newAd: Ad = { ...ad, id: `user-ad-${Date.now()}`};
            const updatedUser = { ...currentUser, userAds: [...currentUser.userAds, newAd] };
            localStorage.setItem('auth-user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);
    
    const isArticleSaved = useCallback((articleId: string) => {
        return user?.savedArticles.includes(articleId) ?? false;
    }, [user]);

    const toggleSaveArticle = useCallback((article: Article) => {
        setUser(currentUser => {
            if (!currentUser || currentUser.subscription === 'free') return currentUser;
            const isSaved = currentUser.savedArticles.includes(article.id);
            const newSavedArticles = isSaved
                ? currentUser.savedArticles.filter(id => id !== article.id)
                : [...currentUser.savedArticles, article.id];
            
            const updatedUser = { ...currentUser, savedArticles: newSavedArticles };
            localStorage.setItem('auth-user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    return {
        user,
        isLoggedIn,
        authLoading,
        login,
        logout,
        updateProfile,
        subscribe,
        createAd,
        isArticleSaved,
        toggleSaveArticle
    };
};
