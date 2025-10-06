import { useState, useEffect, useCallback } from 'react';
import { User, SubscriptionPlan, Ad, Article, IntegrationId } from '../types';

const MOCK_USER: User = {
    id: 'user-123',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    avatar: 'https://i.pravatar.cc/150?u=alexj',
    subscription: 'free',
    savedArticles: ['1', '3'],
    bio: 'News enthusiast and tech lover.',
    userAds: [],
    searchHistory: ['AI', 'Global Economy'],
    twoFactorEnabled: true,
    integrations: {
        slack: false,
        'google-calendar': true,
        notion: false,
    },
};

// Simulate a stored password hash for the mock user
const MOCK_PASSWORD = "password123";

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const updateUserState = (updatedUser: User | null) => {
        setUser(updatedUser);
        if (updatedUser) {
            localStorage.setItem('auth-user', JSON.stringify(updatedUser));
        } else {
            localStorage.removeItem('auth-user');
        }
    };

    useEffect(() => {
        setAuthLoading(true);
        try {
            const storedUser = localStorage.getItem('auth-user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Ensure all default keys are present, especially new ones like integrations
                const mergedUser = { 
                    ...MOCK_USER, 
                    ...parsedUser,
                    integrations: {
                        ...MOCK_USER.integrations,
                        ...(parsedUser.integrations || {})
                    }
                };
                setUser(mergedUser);
                setIsLoggedIn(true);
            }
        } catch (e) {
            console.error("Failed to parse user from storage", e);
            localStorage.removeItem('auth-user');
        } finally {
            setTimeout(() => setAuthLoading(false), 500);
        }
    }, []);

    const login = useCallback((email: string) => {
        setAuthLoading(true);
        const newUser: User = { ...MOCK_USER, email };
        updateUserState(newUser);
        setIsLoggedIn(true);
        setTimeout(() => setAuthLoading(false), 300);
    }, []);

    const logout = useCallback(() => {
        setAuthLoading(true);
        updateUserState(null);
        setIsLoggedIn(false);
        setTimeout(() => setAuthLoading(false), 300);
    }, []);

    const updateProfile = useCallback((profileData: Partial<Pick<User, 'name' | 'bio'>>) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, ...profileData };
            updateUserState(updatedUser);
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
            updateUserState(updatedUser);
            return updatedUser;
        });
    }, []);

    const createAd = useCallback((ad: Omit<Ad, 'id'>) => {
        setUser(currentUser => {
            if (!currentUser || currentUser.subscription !== 'pro') return currentUser;
            const newAd: Ad = { ...ad, id: `user-ad-${Date.now()}`};
            const updatedUser = { ...currentUser, userAds: [...currentUser.userAds, newAd] };
            updateUserState(updatedUser);
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
            updateUserState(updatedUser);
            return updatedUser;
        });
    }, []);

    const addSearchToHistory = useCallback((query: string) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedHistory = [query, ...currentUser.searchHistory.filter(item => item !== query)].slice(0, 10);
            const updatedUser = { ...currentUser, searchHistory: updatedHistory };
            updateUserState(updatedUser);
            return updatedUser;
        });
    }, []);

    const clearSearchHistory = useCallback(() => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, searchHistory: [] };
            updateUserState(updatedUser);
            return updatedUser;
        });
    }, []);
    
    const toggleTwoFactor = useCallback((enabled: boolean) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, twoFactorEnabled: enabled };
            updateUserState(updatedUser);
            return updatedUser;
        });
    }, []);
    
    const toggleIntegration = useCallback((integrationId: IntegrationId) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedIntegrations = {
                ...currentUser.integrations,
                [integrationId]: !currentUser.integrations[integrationId],
            };
            const updatedUser = { ...currentUser, integrations: updatedIntegrations };
            updateUserState(updatedUser);
            return updatedUser;
        });
    }, []);

    const validatePassword = async (password: string): Promise<boolean> => {
        // Simulate an API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(password === MOCK_PASSWORD);
            }, 500);
        });
    };

    const changePassword = async (newPassword: string): Promise<boolean> => {
        // In a real app, this would make an API call to change the password.
        // For this mock, we just resolve true.
        console.log("Password changed to:", newPassword);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(true);
            }, 500);
        });
    };

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
        toggleSaveArticle,
        addSearchToHistory,
        clearSearchHistory,
        toggleTwoFactor,
        validatePassword,
        changePassword,
        toggleIntegration,
    };
};