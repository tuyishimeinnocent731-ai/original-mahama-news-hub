import { useState, useEffect, useCallback } from 'react';
import { User, Article, Ad, IntegrationId } from '../types';
import { useToast } from '../contexts/ToastContext';

// This would be in a secure backend in a real app
let ADMIN_EMAILS = ['reponsekdz0@gmail.com'];

const MOCK_USERS: { [email: string]: User } = {
  'user@example.com': {
    id: 'user-123',
    name: 'Alex Johnson',
    email: 'user@example.com',
    avatar: 'https://i.pravatar.cc/150?u=alexjohnson',
    bio: 'News enthusiast and tech lover. Following the latest trends in AI and business.',
    subscription: 'premium',
    savedArticles: ['1', '3'],
    searchHistory: ['AI', 'Renewable Energy', 'Climate Summit'],
    userAds: [],
    twoFactorEnabled: true,
    integrations: {
        slack: true,
        notion: false,
        'google-calendar': false,
    },
    role: 'user',
  },
  'pro@example.com': {
    id: 'user-456',
    name: 'Samantha Bee',
    email: 'pro@example.com',
    avatar: 'https://i.pravatar.cc/150?u=samanthabee',
    bio: 'Marketing professional and content creator. Exploring the future of digital advertising.',
    subscription: 'pro',
    savedArticles: ['2', '5', '6'],
    searchHistory: ['Tech Regulation', 'Politics', 'EU'],
    userAds: [
      { id: 'user-ad-1', headline: 'My Custom Ad!', image: 'https://images.unsplash.com/photo-1504270997621-af75a1ea5e4f?q=80&w=800', url: '#' }
    ],
    twoFactorEnabled: false,
    integrations: {
        slack: true,
        notion: true,
        'google-calendar': true,
    },
    role: 'user',
  },
  'reponsekdz0@gmail.com': {
    id: 'admin-001',
    name: 'Admin Reponse',
    email: 'reponsekdz0@gmail.com',
    avatar: 'https://i.pravatar.cc/150?u=adminreponse',
    bio: 'Site Administrator.',
    subscription: 'pro',
    savedArticles: [],
    searchHistory: [],
    userAds: [],
    twoFactorEnabled: true,
    integrations: { slack: true, notion: true, 'google-calendar': true },
    role: 'admin',
  }
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        // Simulate checking for a logged-in user
        setTimeout(() => {
            const storedUserEmail = localStorage.getItem('loggedInUser');
            if (storedUserEmail && MOCK_USERS[storedUserEmail]) {
                 const loggedInUser = MOCK_USERS[storedUserEmail];
                 // Ensure role is correctly assigned on load
                 loggedInUser.role = ADMIN_EMAILS.includes(loggedInUser.email) ? 'admin' : 'user';
                 setUser(loggedInUser);
            }
            setLoading(false);
        }, 1000);
    }, []);

    const login = useCallback((email: string, password?: string) => {
        if (email === 'reponsekdz0@gmail.com' && password === '2025') {
            const adminUser = MOCK_USERS[email];
            setUser({...adminUser, role: 'admin'});
            localStorage.setItem('loggedInUser', email);
            addToast(`Welcome back, Admin ${adminUser.name.split(' ')[0]}!`, 'success');
            return true;
        }

        if (MOCK_USERS[email] && email !== 'reponsekdz0@gmail.com') {
            const regularUser = MOCK_USERS[email];
            setUser({...regularUser, role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user'});
            localStorage.setItem('loggedInUser', email);
            addToast(`Welcome back, ${regularUser.name.split(' ')[0]}!`, 'success');
            return true;
        }
        
        addToast('Invalid credentials. Please try again.', 'error');
        return false;
    }, [addToast]);
    
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('loggedInUser');
        addToast('You have been logged out.', 'info');
    }, [addToast]);
    
    const register = useCallback((email: string) => {
        // For mock purposes, just log in as the default user
        return login(Object.keys(MOCK_USERS)[0]);
    }, [login]);

    const isArticleSaved = useCallback((articleId: string) => {
        return user?.savedArticles.includes(articleId) || false;
    }, [user]);

    const toggleSaveArticle = useCallback((article: Article) => {
        if (!user) {
            addToast('You must be logged in to save articles.', 'warning');
            return;
        }
        setUser(currentUser => {
            if (!currentUser) return null;
            const isSaved = currentUser.savedArticles.includes(article.id);
            const newSavedArticles = isSaved
                ? currentUser.savedArticles.filter(id => id !== article.id)
                : [...currentUser.savedArticles, article.id];
            
            addToast(isSaved ? 'Article removed from saved.' : 'Article saved!', 'success');

            const updatedUser = { ...currentUser, savedArticles: newSavedArticles };
            // In a real app, you would persist this to a backend
            MOCK_USERS[currentUser.email] = updatedUser;
            return updatedUser;
        });
    }, [user, addToast]);
    
    const addSearchHistory = useCallback((query: string) => {
        if (!user || user.searchHistory.includes(query)) return;
        setUser(currentUser => {
            if (!currentUser) return null;
            const newHistory = [query, ...currentUser.searchHistory].slice(0, 5); // Keep last 5
            const updatedUser = { ...currentUser, searchHistory: newHistory };
            MOCK_USERS[currentUser.email] = updatedUser;
            return updatedUser;
        });
    }, [user]);

    const clearSearchHistory = useCallback(() => {
        if (!user) return;
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, searchHistory: [] };
            MOCK_USERS[currentUser.email] = updatedUser;
            return updatedUser;
        });
    }, [user]);

    const createAd = useCallback((adData: Omit<Ad, 'id'>) => {
        if (!user) return;
        const newAd: Ad = { ...adData, id: `user-ad-${Date.now()}` };
        
        if(user.subscription !== 'pro' && user.role !== 'admin') return;

        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, userAds: [...currentUser.userAds, newAd] };
            MOCK_USERS[currentUser.email] = updatedUser;
            addToast('Advertisement created successfully!', 'success');
            return updatedUser;
        });
    }, [user, addToast]);

    const updateProfile = useCallback((profileData: Partial<Pick<User, 'name' | 'bio'>>) => {
        if (!user) return;
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, ...profileData };
            MOCK_USERS[currentUser.email] = updatedUser;
            return updatedUser;
        });
    }, [user]);

    const toggleTwoFactor = useCallback((enabled: boolean) => {
        if (!user) return;
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, twoFactorEnabled: enabled };
            MOCK_USERS[currentUser.email] = updatedUser;
            return updatedUser;
        });
    }, [user]);
    
    const validatePassword = async (password: string): Promise<boolean> => {
        // Mock validation
        return new Promise(resolve => setTimeout(() => resolve(password === 'password123' || password === '2025'), 500));
    };

    const changePassword = async (newPassword: string): Promise<boolean> => {
        // Mock password change
        return new Promise(resolve => setTimeout(() => resolve(true), 500));
    };

    const toggleIntegration = useCallback((integrationId: IntegrationId) => {
        if (!user) return;
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { 
                ...currentUser,
                integrations: {
                    ...currentUser.integrations,
                    [integrationId]: !currentUser.integrations[integrationId]
                }
            };
            MOCK_USERS[currentUser.email] = updatedUser;
            return updatedUser;
        });
    }, [user]);

    const addAdmin = useCallback((email: string) => {
        if (user?.role !== 'admin') {
            addToast('You do not have permission to perform this action.', 'error');
            return;
        }
        if (ADMIN_EMAILS.includes(email)) {
            addToast('This user is already an admin.', 'warning');
            return;
        }
        ADMIN_EMAILS.push(email);
        if (MOCK_USERS[email]) {
            MOCK_USERS[email].role = 'admin';
        }
        addToast(`${email} has been promoted to an admin.`, 'success');
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
        createAd,
        updateProfile,
        toggleTwoFactor,
        validatePassword,
        changePassword,
        toggleIntegration,
        addAdmin,
        adminEmails: ADMIN_EMAILS,
    };
};