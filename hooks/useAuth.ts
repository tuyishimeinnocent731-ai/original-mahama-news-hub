

import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as userService from '../services/userService';
import { useToast } from '../contexts/ToastContext';

interface AuthData {
    token: string;
    user: User;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { addToast } = useToast();

    const setAuthData = useCallback((data: AuthData | null) => {
        if (data) {
            localStorage.setItem('auth', JSON.stringify(data));
            setUser(data.user);
            setToken(data.token);
            setIsLoggedIn(true);
        } else {
            localStorage.removeItem('auth');
            setUser(null);
            setToken(null);
            setIsLoggedIn(false);
        }
    }, []);
    
    useEffect(() => {
        try {
            const authDataString = localStorage.getItem('auth');
            if (authDataString) {
                const authData: AuthData = JSON.parse(authDataString);
                setAuthData(authData);
            }
        } catch (error) {
            console.error("Failed to parse auth data from localStorage", error);
            setAuthData(null);
        }
    }, [setAuthData]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const authData = await userService.login(email, password);
            setAuthData(authData);
            addToast(`Welcome back, ${authData.user.name}!`, 'success');
            return true;
        } catch (error: any) {
            addToast(error.message || 'Login failed', 'error');
            return false;
        }
    }, [addToast, setAuthData]);

    const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            const authData = await userService.register(name, email, password);
            setAuthData(authData);
            addToast(`Welcome, ${authData.user.name}!`, 'success');
            return true;
        } catch (error: any) {
            addToast(error.message || 'Registration failed', 'error');
            return false;
        }
    }, [addToast, setAuthData]);
    
    const loginWithGoogle = useCallback(async (credential: string): Promise<boolean> => {
        try {
            const authData = await userService.loginWithGoogle(credential);
            setAuthData(authData);
            addToast(`Welcome, ${authData.user.name}!`, 'success');
            return true;
        } catch (error: any) {
            addToast(error.message || 'Google Sign-In failed', 'error');
            return false;
        }
    }, [addToast, setAuthData]);
    
    const logout = useCallback(() => {
        setAuthData(null);
        addToast('You have been logged out.', 'info');
    }, [addToast, setAuthData]);
    
    const refreshUser = useCallback(async () => {
        if (isLoggedIn) {
            try {
                const updatedUser = await userService.getProfile();
                const authDataString = localStorage.getItem('auth');
                if (authDataString) {
                    const authData: AuthData = JSON.parse(authDataString);
                    authData.user = updatedUser;
                    setAuthData(authData);
                }
            } catch (error) {
                console.error("Failed to refresh user data", error);
                logout(); // Logout if profile fetch fails (e.g., token expired)
            }
        }
    }, [isLoggedIn, setAuthData, logout]);

    return { user, token, isLoggedIn, login, logout, register, refreshUser, loginWithGoogle };
};