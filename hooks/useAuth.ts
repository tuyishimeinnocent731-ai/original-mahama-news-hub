import { useState, useEffect, useCallback } from 'react';
import { User, Article, Ad, IntegrationId, SubscriptionPlan, PaymentRecord } from '../types';
import { useToast } from '../contexts/ToastContext';

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
        avatar: `https://i.pravatar.cc/150?u=adminreponse`,
        bio: 'Site Administrator.',
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
            // In a real app, you'd check the password hash
            // For admins, we have a special password
            if ((potentialUser.role === 'admin' || potentialUser.role === 'sub-admin') && password === '2025') {
                 setUser(potentialUser);
                 localStorage.setItem('loggedInUser', email);
                 addToast(`Welcome back, ${potentialUser.role} ${potentialUser.name.split(' ')[0]}!`, 'success');
                 return true;
            }
            // For regular users, any password works for this mock setup
            if (potentialUser.role === 'user' || !potentialUser.role) {
                 setUser(potentialUser);
                 localStorage.setItem('loggedInUser', email);
                 addToast(`Welcome back, ${potentialUser.name.split(' ')[0]}!`, 'success');
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
        
        addToast(isSaved ? 'Article removed from saved.' : 'Article saved!', 'success');
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

    const updateProfile = useCallback((profileData: Partial<Pick<User, 'name' | 'bio'>>) => {
        if (!user) return;
        persistUserUpdate({ ...user, ...profileData });
    }, [user]);

    const toggleTwoFactor = useCallback((enabled: boolean) => {
        if (!user) return;
        persistUserUpdate({ ...user, twoFactorEnabled: enabled });
    }, [user]);
    
    const validatePassword = async (password: string): Promise<boolean> => {
        // Mock validation for any password for regular users, specific for admin
        return new Promise(resolve => setTimeout(() => {
            if (user?.role === 'admin' || user?.role === 'sub-admin') {
                resolve(password === '2025');
            } else {
                resolve(true); // Allow any password for demo purposes
            }
        }, 500));
    };

    const changePassword = async (newPassword: string): Promise<boolean> => {
        // Mock password change
        console.log(`Password for ${user?.email} changed to ${newPassword}`);
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

    const addUser = useCallback((userData: Pick<User, 'name' | 'email' | 'role' | 'subscription'>) => {
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
        // FIX: Explicitly type the parameter in the 'find' callback to resolve type inference issues.
        const userToUpdate = Object.values(users).find((u: User) => u.id === userId);
        if (!userToUpdate) {
            addToast('User not found.', 'error');
            return false;
        }
        if (userData.email && userData.email !== userToUpdate.email && users[userData.email]) {
            addToast('An account with the new email already exists.', 'error');
            return false;
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
