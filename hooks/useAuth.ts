import { useState, useEffect, useCallback } from 'react';
import { User, Article, Ad, IntegrationId, SubscriptionPlan, PaymentRecord } from '../types';
import { useToast } from '../contexts/ToastContext';
import * as newsService from '../services/newsService';

// --- LocalStorage Persistence for Users ---
const loadUsersFromStorage = (): { [email: string]: User } => {
    try {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }
    } catch (error) {
        console.error("Error loading users from storage", error);
    }
    // If no users, create the default admin
    const defaultAdmin: User = {
        id: 'admin-001',
        name: 'Admin Reponse',
        email: 'reponsekdz0@gmail.com',
        password: '2025', // Add default password
        avatar: `https://i.pravatar.cc/150?u=adminreponse`,
        bio: 'Site Administrator.',
        socials: { twitter: 'reponse', linkedin: 'reponse' },
        subscription: 'pro',
        savedArticles: [],
        searchHistory: [],
        userAds: [],
        twoFactorEnabled: true,
        integrations: { slack: true, notion: true, 'google-calendar': true },
        role: 'admin',
        paymentHistory: [],
    };
    const initialUsers = { [defaultAdmin.email]: defaultAdmin };
    saveUsersToStorage(initialUsers);
    return initialUsers;
};

const saveUsersToStorage = (users: { [email: string]: User }) => {
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error("Error saving users to storage", error);
    }
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<{ [email: string]: User }>(loadUsersFromStorage);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        // Simulate checking for a logged-in user
        setTimeout(() => {
            const storedUserEmail = localStorage.getItem('loggedInUser');
            if (storedUserEmail && users[storedUserEmail]) {
                 setUser(users[storedUserEmail]);
            }
            setLoading(false);
        }, 500);
    }, [users]);
    
    const persistUserUpdate = (updatedUser: User, oldEmail?: string) => {
        const newUsers = { ...users };
        if (oldEmail && oldEmail !== updatedUser.email) {
            delete newUsers[oldEmail];
        }
        newUsers[updatedUser.email] = updatedUser;
        setUsers(newUsers);
        saveUsersToStorage(newUsers);

        if (user?.id === updatedUser.id) {
            setUser(updatedUser);
            if (oldEmail && oldEmail !== updatedUser.email) {
                 localStorage.setItem('loggedInUser', updatedUser.email);
            }
        }
    };


    const login = useCallback((email: string, password?: string) => {
        const potentialUser = users[email];
        
        if (potentialUser) {
            let passwordIsValid = false;
            if (potentialUser.password) {
                // New users created by admin will have a password
                passwordIsValid = potentialUser.password === password;
            } else {
                // Backwards compatibility for demo purposes for pre-existing users
                if ((potentialUser.role === 'admin' || potentialUser.role === 'sub-admin') && password === '2025') {
                    passwordIsValid = true;
                } else if (!potentialUser.role || potentialUser.role === 'user') {
                    passwordIsValid = true; // Allow any password for old regular users
                }
            }
            
            if (passwordIsValid) {
                setUser(potentialUser);
                localStorage.setItem('loggedInUser', email);
                const welcomeRole = (potentialUser.role === 'admin' || potentialUser.role === 'sub-admin') ? `${potentialUser.role} ` : '';
                addToast(`Welcome back, ${welcomeRole}${potentialUser.name.split(' ')[0]}!`, 'success');
                return true;
            }
        }
        
        addToast('Invalid credentials. Please try again.', 'error');
        return false;
    }, [users, addToast]);
    
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('loggedInUser');
        addToast('You have been logged out.', 'info');
    }, [addToast]);
    
    const register = useCallback((email: string, password?: string) => {
        if (users[email]) {
            addToast('An account with this email already exists.', 'error');
            return false;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            password: password,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            subscription: 'free',
            savedArticles: [],
            searchHistory: [],
            userAds: [],
            twoFactorEnabled: false,
            integrations: {},
            role: 'user',
            paymentHistory: [],
        };
        
        const newUsers = { ...users, [email]: newUser };
        setUsers(newUsers);
        saveUsersToStorage(newUsers);
        
        addToast('Registration successful! Welcome.', 'success');
        // Automatically log in the new user
        setUser(newUser);
        localStorage.setItem('loggedInUser', email);
        return true;

    }, [users, addToast]);

    const isArticleSaved = useCallback((articleId: string) => {
        return user?.savedArticles.includes(articleId) || false;
    }, [user]);

    const toggleSaveArticle = useCallback((article: Article) => {
        if (!user) {
            addToast('You must be logged in to save articles.', 'warning');
            return;
        }
        const isSaved = user.savedArticles.includes(article.id);
        const newSavedArticles = isSaved
            ? user.savedArticles.filter(id => id !== article.id)
            : [...user.savedArticles, article.id];
        
        if (!isSaved) {
            newsService.saveArticleForOffline(article.id);
            addToast('Article saved and available offline!', 'success');
        } else {
            newsService.removeArticleFromOffline(article.id);
            addToast('Article removed from saved.', 'info');
        }

        persistUserUpdate({ ...user, savedArticles: newSavedArticles });
    }, [user, addToast]);
    
    const addSearchHistory = useCallback((query: string) => {
        if (!user || user.searchHistory.includes(query)) return;
        const newHistory = [query, ...user.searchHistory].slice(0, 5); // Keep last 5
        persistUserUpdate({ ...user, searchHistory: newHistory });
    }, [user]);

    const clearSearchHistory = useCallback(() => {
        if (!user) return;
        persistUserUpdate({ ...user, searchHistory: [] });
    }, [user]);

    const updateProfile = useCallback((profileData: Partial<Pick<User, 'name' | 'bio' | 'avatar' | 'socials'>>) => {
        if (!user) return;
        persistUserUpdate({ ...user, ...profileData });
    }, [user]);

    const toggleTwoFactor = useCallback((enabled: boolean) => {
        if (!user) return;
        persistUserUpdate({ ...user, twoFactorEnabled: enabled });
    }, [user]);
    
    const validatePassword = async (password: string): Promise<boolean> => {
        return new Promise(resolve => setTimeout(() => {
             if (user?.password) {
                resolve(password === user.password);
            } else if (user?.role === 'admin' || user?.role === 'sub-admin') {
                resolve(password === '2025');
            } else {
                resolve(true); // Allow any password for demo purposes for users without one set
            }
        }, 500));
    };

    const changePassword = async (newPassword: string): Promise<boolean> => {
        if (!user) return false;
        persistUserUpdate({ ...user, password: newPassword });
        return new Promise(resolve => setTimeout(() => resolve(true), 500));
    };

    const toggleIntegration = useCallback((integrationId: IntegrationId) => {
        if (!user) return;
        persistUserUpdate({ 
            ...user,
            integrations: {
                ...user.integrations,
                [integrationId]: !user.integrations[integrationId]
            }
        });
    }, [user]);
    
    const getAllUsers = useCallback(() => {
        return Object.values(users);
    }, [users]);

    const addUser = useCallback((userData: Pick<User, 'name' | 'email' | 'role' | 'subscription' | 'password'>) => {
         if (user?.role !== 'admin') {
            addToast('You do not have permission for this action.', 'error');
            return false;
        }
        if (users[userData.email]) {
            addToast('An account with this email already exists.', 'error');
            return false;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            avatar: `https://i.pravatar.cc/150?u=${userData.email}`,
            subscription: userData.subscription,
            savedArticles: [],
            searchHistory: [],
            userAds: [],
            twoFactorEnabled: false,
            integrations: {},
            role: userData.role,
            paymentHistory: [],
        };
        
        persistUserUpdate(newUser);
        addToast(`User ${newUser.name} created successfully.`, 'success');
        return true;
    }, [user, users, addToast]);

    const updateUser = useCallback((userId: string, userData: Partial<User>) => {
        if (user?.role !== 'admin') {
            addToast('You do not have permission for this action.', 'error');
            return false;
        }
        // FIX: All errors stemmed from 'userToUpdate' being inferred as 'unknown'.
        // Removing the explicit type annotation `(u: User)` from the `find` callback
        // allows TypeScript to correctly infer the type of `u` as `User` from the `users` state array.
        // This ensures `userToUpdate` is correctly typed as `User | undefined`, which is then
        // narrowed to `User` after the existence check, resolving all subsequent property access and spread operator errors.
        const userToUpdate = Object.values(users).find(u => u.id === userId);
        if (!userToUpdate) {
            addToast('User not found.', 'error');
            return false;
        }
        
        if (userData.email && userData.email !== userToUpdate.email && users[userData.email]) {
            addToast('An account with the new email already exists.', 'error');
            return false;
        }
        
        if (userData.role && userData.role !== userToUpdate.role) {
            if (userToUpdate.email === 'reponsekdz0@gmail.com' && userData.role !== 'admin') {
                addToast('Cannot change the primary admin role.', 'warning');
                return false;
            }
            if (userData.role === 'sub-admin' && (userData.subscription || userToUpdate.subscription) !== 'pro') {
                    addToast('Cannot promote to Sub-Admin. User must have a Pro subscription.', 'error');
                    return false;
            }
        }

        const oldEmail = userToUpdate.email;
        const updatedUser = { ...userToUpdate, ...userData };
        persistUserUpdate(updatedUser, oldEmail);
        addToast(`User ${updatedUser.name} updated successfully.`, 'success');
        return true;
    }, [user, users, addToast]);

    const updateUserRole = useCallback((emailToModify: string, newRole: 'admin' | 'sub-admin' | 'user') => {
        if (user?.role !== 'admin') {
            addToast('You do not have permission for this action.', 'error');
            return false;
        }
        if (emailToModify === 'reponsekdz0@gmail.com' && newRole !== 'admin') {
            addToast('Cannot change the primary admin role.', 'warning');
            return false;
        }

        const targetUser = users[emailToModify];
        if (!targetUser) {
            addToast('User not found.', 'error');
            return false;
        }
        
        if (newRole === 'sub-admin' && targetUser.subscription !== 'pro') {
            addToast('Cannot promote to Sub-Admin. User must have a Pro subscription.', 'error');
            return false;
        }

        targetUser.role = newRole;
        addToast(`${targetUser.name}'s role has been updated to ${newRole}.`, 'success');
        persistUserUpdate(targetUser);
        return true;

    }, [user, users, addToast]);

    const deleteUser = useCallback((emailToDelete: string) => {
        if (user?.role !== 'admin') {
            addToast('You do not have permission for this action.', 'error');
            return false;
        }
        if (emailToDelete === user.email) {
            addToast('You cannot delete your own account.', 'error');
            return false;
        }
        if (emailToDelete === 'reponsekdz0@gmail.com') {
            addToast('Cannot delete the primary admin account.', 'warning');
            return false;
        }

        const targetUser = users[emailToDelete];
        if (!targetUser) {
            addToast('User not found.', 'error');
            return false;
        }

        const newUsers = { ...users };
        delete newUsers[emailToDelete];
        setUsers(newUsers);
        saveUsersToStorage(newUsers);
        addToast(`User ${targetUser.name} has been deleted.`, 'success');
        return true;

    }, [user, users, addToast]);

    const upgradeSubscription = useCallback((plan: SubscriptionPlan, amount: string, method: PaymentRecord['method']) => {
        if (!user) {
             addToast('You must be logged in to upgrade.', 'error');
            return;
        }

        const newPayment: PaymentRecord = {
            id: `pay-${Date.now()}`,
            date: new Date().toISOString(),
            plan,
            amount,
            method,
            status: 'succeeded',
        };

        const updatedUser: User = {
            ...user,
            subscription: plan,
            paymentHistory: [newPayment, ...user.paymentHistory],
        };
        
        persistUserUpdate(updatedUser);
        addToast(`Successfully upgraded to ${plan} plan!`, 'success');

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
        updateProfile,
        toggleTwoFactor,
        validatePassword,
        changePassword,
        toggleIntegration,
        getAllUsers,
        addUser,
        updateUser,
        updateUserRole,
        deleteUser,
        upgradeSubscription,
    };
};
