import { useState, useEffect, useCallback } from 'react';
import { User, Article, Ad, IntegrationId, SubscriptionPlan, PaymentRecord } from '../types';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/apiService';

interface AuthState {
    user: User | null;
    token: string | null;
}

const loadAuthFromStorage = (): AuthState | null => {
    try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            return JSON.parse(storedAuth);
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
            // Optional: verify token with backend on initial load
        }
        setLoading(false);
    }, []);

    const handleAuthSuccess = (data: any) => {
        const { token, ...userData } = data;
        setUser(userData);
        setToken(token);
        saveAuthToStorage({ user: userData, token });
    };

    const login = useCallback(async (email: string, password?: string) => {
        try {
            // FIX: Specify the expected return type from the API call to resolve the 'unknown' type error.
            const data = await api.post<User & { token: string }>('/api/auth/login', { email, password });
            handleAuthSuccess(data);
            addToast(`Welcome back, ${data.name.split(' ')[0]}!`, 'success');
            return true;
        } catch (error: any) {
            addToast(error.message || 'Login failed. Please try again.', 'error');
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
            // The name is derived from email on backend, but we can pass it
            const name = email.split('@')[0];
            // FIX: Specify the expected return type from the API call to resolve the 'unknown' type error.
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
            setUser(userData);
            saveAuthToStorage({ user: userData, token });
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

    const addSearchHistory = useCallback((query: string) => {
        // This is now handled on the backend during the search API call
    }, []);

    const clearSearchHistory = useCallback(async () => {
        if (!user) return;
        try {
            await api.delete('/api/users/search-history');
            setUser(prev => prev ? { ...prev, searchHistory: [] } : null);
            addToast("Search history cleared.", "success");
        } catch(e) {
            addToast("Failed to clear history.", "error");
        }
    }, [user, addToast]);
    
    const addUserAd = useCallback(async (adData: Omit<Ad, 'id'>) => {
        if (!user) return;
        const formData = new FormData();
        Object.entries(adData).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        // This assumes adData.image is a base64 string, need to convert to blob
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

    // FIX: Refactored to correctly handle async avatar uploads and prevent type errors.
    const updateProfile = useCallback(async (profileData: Partial<Pick<User, 'name' | 'bio' | 'avatar' | 'socials'>>) => {
        if (!user) return;
        
        try {
            const formData = new FormData();

            if (profileData.name) formData.append('name', profileData.name);
            if (profileData.bio) formData.append('bio', profileData.bio);
            if (profileData.socials) formData.append('socials', JSON.stringify(profileData.socials));

            // Handle avatar separately to manage async logic and type safety
            if (profileData.avatar && typeof profileData.avatar === 'string') {
                if (!profileData.avatar.startsWith('http')) {
                    // It's a new base64 image, convert to blob
                    const fetchRes = await fetch(profileData.avatar);
                    const blob = await fetchRes.blob();
                    formData.append('avatar', blob, 'avatar.png');
                } else {
                    // It's an existing URL, append as is
                    formData.append('avatar', profileData.avatar);
                }
            }

            await api.putFormData('/api/users/profile', formData);
            addToast('Profile updated!', 'success');
            await refetchUser();
        } catch(error) {
            addToast('Failed to update profile.', 'error');
        }
    }, [user, addToast]);

    const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
        try {
            await api.put('/api/users/password', { currentPassword, newPassword });
            return true;
        } catch(e: any) {
            addToast(e.message, 'error');
            return false;
        }
    };
    
    // Admin functions
    const getAllUsers = async (): Promise<User[]> => {
        try {
            return await api.get<User[]>('/api/users');
        } catch (error) {
            addToast('Failed to fetch users.', 'error');
            return [];
        }
    };

    const addUser = async (userData: any) => {
        try {
            await api.post('/api/users', userData);
            addToast('User created successfully.', 'success');
            return true;
        } catch (error: any) {
            addToast(error.message, 'error');
            return false;
        }
    };
    
    const updateUser = async (userId: string, userData: any) => {
        try {
            await api.put(`/api/users/${userId}`, userData);
            addToast('User updated successfully.', 'success');
            return true;
        } catch (error: any) {
            addToast(error.message, 'error');
            return false;
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            await api.delete(`/api/users/${userId}`);
            addToast('User deleted successfully.', 'success');
            return true;
        } catch (error: any) {
            addToast(error.message, 'error');
            return false;
        }
    };
    
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


    return { 
        user, 
        isLoggedIn: !!user,
        loading,
        login, 
        logout,
        register,
        isArticleSaved,
        toggleSaveArticle,
        addSearchHistory,
        clearSearchHistory,
        addUserAd,
        updateProfile,
        // The following are stubs or need full implementation
        toggleTwoFactor: (enabled: boolean) => { console.log('2FA toggle:', enabled); },
        validatePassword: async (password: string) => { console.log('Validating pw'); return true; },
        changePassword,
        toggleIntegration: (id: IntegrationId) => { console.log('Toggle integration:', id); },
        upgradeSubscription,
        // Admin functions
        getAllUsers,
        addUser,
        updateUser,
        deleteUser,
        updateUserRole: (email: string, role: string) => { console.log('Update role'); return false; },
    };
};