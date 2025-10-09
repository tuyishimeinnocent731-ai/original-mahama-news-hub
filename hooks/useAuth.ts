import { useState, useEffect, useCallback } from 'react';
// FIX: Add missing 'Article' type import.
import { User, Ad, IntegrationId, SubscriptionPlan, PaymentRecord, Article } from '../types';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/apiService';

interface AuthState {
    user: User | null;
    token: string | null;
}

const parseUser = (user: any): User => {
    return {
        ...user,
        settings: typeof user.settings === 'string' ? JSON.parse(user.settings || '{}') : user.settings,
        socials: typeof user.socials === 'string' ? JSON.parse(user.socials || '{}') : user.socials,
        savedArticles: user.savedArticles || [],
        searchHistory: user.searchHistory || [],
        userAds: user.userAds || [],
        paymentHistory: user.paymentHistory || [],
        integrations: user.integrations || {},
    };
}

const loadAuthFromStorage = (): AuthState | null => {
    try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            const auth = JSON.parse(storedAuth);
            if(auth.user) {
                auth.user = parseUser(auth.user);
            }
            return auth;
        }
    } catch (error) {
        console.error("Error loading auth from storage", error);
    }
    return null;
};

const saveAuthToStorage = (auth: AuthState) => {
    try {
        localStorage.setItem('auth', JSON.stringify(auth));
    } catch (error) {
        console.error("Error saving auth to storage", error);
    }
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    
    useEffect(() => {
        const authData = loadAuthFromStorage();
        if (authData && authData.token) {
            setUser(authData.user);
            setToken(authData.token);
        }
        setLoading(false);
    }, []);

    const handleAuthSuccess = (data: any) => {
        const { token, ...userData } = data;
        const parsed = parseUser(userData);
        setUser(parsed);
        setToken(token);
        saveAuthToStorage({ user: parsed, token });
    };

    const login = useCallback(async (email: string, password?: string) => {
        try {
            const data = await api.post<User & { token: string }>('/api/auth/login', { email, password });
            handleAuthSuccess(data);
            addToast(`Welcome back, ${data.name.split(' ')[0]}!`, 'success');
            return true;
        } catch (error: any) {
            addToast(error.message || 'Login failed. Please try again.', 'error');
            return false;
        }
    }, [addToast]);

    const loginWithGoogle = useCallback(async (googleToken: string) => {
        try {
            const data = await api.post<User & { token: string }>('/api/auth/google', { token: googleToken });
            handleAuthSuccess(data);
            addToast(`Welcome, ${data.name.split(' ')[0]}!`, 'success');
            return true;
        } catch (error: any) {
            addToast(error.message || 'Google login failed. Please try again.', 'error');
            return false;
        }
    }, [addToast]);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth');
        addToast('You have been logged out.', 'info');
    }, [addToast]);

    const register = useCallback(async (email: string, password?: string) => {
        try {
            const name = email.split('@')[0];
            const data = await api.post<User & { token: string }>('/api/auth/register', { email, password, name });
            handleAuthSuccess(data);
            addToast('Registration successful! Welcome.', 'success');
            return true;
        } catch (error: any) {
            addToast(error.message || 'Registration failed.', 'error');
            return false;
        }
    }, [addToast]);

    const refetchUser = async () => {
        if (!token) return;
        try {
            const userData = await api.get<User>('/api/users/profile');
            const parsed = parseUser(userData);
            setUser(parsed);
            saveAuthToStorage({ user: parsed, token });
        } catch (error) {
            console.error("Failed to refetch user", error);
            logout(); // Token might be invalid
        }
    };

    const isArticleSaved = useCallback((articleId: string) => {
        return user?.savedArticles?.includes(articleId) || false;
    }, [user]);

    const toggleSaveArticle = useCallback(async (article: Article) => {
        if (!user) {
            addToast('You must be logged in to save articles.', 'warning');
            return;
        }
        try {
            await api.post(`/api/users/saved/${article.id}`, {});
            // Optimistic update
            const isCurrentlySaved = user.savedArticles?.includes(article.id);
            const newSavedArticles = isCurrentlySaved
                ? user.savedArticles.filter(id => id !== article.id)
                : [...(user.savedArticles || []), article.id];
            
            setUser(prev => prev ? { ...prev, savedArticles: newSavedArticles } : null);
            
            addToast(isCurrentlySaved ? 'Article removed.' : 'Article saved!', 'success');
        } catch (error) {
            addToast('Could not update saved articles.', 'error');
        }
    }, [user, addToast]);

    
    const addUserAd = useCallback(async (adData: Omit<Ad, 'id'>) => {
        if (!user) return;
        const formData = new FormData();
        Object.entries(adData).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        const fetchRes = await fetch(adData.image);
        const blob = await fetchRes.blob();
        formData.set('image', blob);

        try {
            await api.postFormData('/api/users/ads', formData);
            refetchUser();
        } catch (error) {
            addToast('Failed to create ad.', 'error');
        }
    }, [user, addToast]);

    const upgradeSubscription = useCallback(async (plan: SubscriptionPlan, amount: string, method: PaymentRecord['method']) => {
        if (!user) return;
        try {
            await api.post('/api/users/subscription', { plan, amount, method });
            addToast(`Successfully upgraded to ${plan}!`, 'success');
            refetchUser();
        } catch (error) {
            addToast('Subscription upgrade failed.', 'error');
        }
    }, [user, addToast]);

    // Admin functions moved to dedicated components that will use a userService
    const getAllUsers = async (): Promise<User[]> => api.get<User[]>('/api/users');
    const addUser = async (userData: any) => api.post('/api/users', userData);
    const updateUser = async (userId: string, userData: any) => api.put(`/api/users/${userId}`, userData);
    const deleteUser = async (userId: string) => api.delete(`/api/users/${userId}`);


    return { 
        user, 
        isLoggedIn: !!user,
        loading,
        login, 
        loginWithGoogle,
        logout,
        register,
        // FIX: Expose refetchUser function to be used after events like successful payment.
        refetchUser,
        isArticleSaved,
        toggleSaveArticle,
        addUserAd,
        upgradeSubscription,
        // Admin functions are no longer directly returned from here
        // but are available for App.tsx to pass down. This is a temporary state
        // before fully migrating components to use userService.
        getAllUsers,
        addUser,
        updateUser,
        deleteUser,
        clearSearchHistory: () => api.delete('/api/users/search-history'),
        updateProfile: (profileData: any) => api.putFormData('/api/users/profile', profileData),
    };
};