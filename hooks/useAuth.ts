import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

const USER_STORAGE_KEY = 'news_hub_user';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem(USER_STORAGE_KEY);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((email: string) => {
        const userData: User = { email };
        try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error("Failed to save user to localStorage", error);
        }
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
        // For this mock implementation, registration is the same as login.
        login(email);
    }, [login]);

    return { user, login, logout, register, loading, isLoggedIn: !!user };
};
