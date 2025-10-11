

import { api } from './apiService';
import { User, ApiKey, ActivityLog, Notification } from '../types';

// --- Auth ---
export const login = async (email: string, password: string): Promise<{ token: string, user: User }> => {
    return api.post('/api/auth/login', { email, password });
};

export const register = async (name: string, email: string, password: string): Promise<{ token: string, user: User }> => {
    return api.post('/api/auth/register', { name, email, password });
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    return api.post('/api/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
    return api.post('/api/auth/reset-password', { token, password });
};

export const loginWithGoogle = async (credential: string): Promise<{ token: string, user: User }> => {
    return api.post('/api/auth/google', { credential });
};


// --- User Profile & Settings ---
export const getProfile = async (): Promise<User> => {
    return api.get('/api/users/profile');
};

export const updateProfile = async (profileData: Partial<Pick<User, 'name' | 'bio' | 'avatar' | 'socials'>>): Promise<User> => {
    return api.put('/api/users/profile', profileData);
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    return api.put('/api/users/change-password', { currentPassword, newPassword });
};

export const toggleSavedArticle = async (articleId: string): Promise<{ savedArticles: string[] }> => {
    return api.post('/api/users/saved-articles', { articleId });
}

export const clearSearchHistory = async (): Promise<{ message: string }> => {
    return api.delete('/api/users/search-history');
};

// --- Admin User Management ---
export const getAllUsers = async (): Promise<User[]> => {
    return api.get('/api/users');
};

export const addUser = async (userData: any): Promise<User> => {
    return api.post('/api/users', userData);
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
    return api.put(`/api/users/${userId}`, userData);
};

export const deleteUser = async (userId: string): Promise<{ message: string }> => {
    return api.delete(`/api/users/${userId}`);
};

export const adminResetPassword = async (userId: string): Promise<{ temporaryPassword: string }> => {
    return api.post(`/api/users/${userId}/reset-password`, {});
};

// --- API Keys ---
export const getApiKeys = async (): Promise<ApiKey[]> => {
    return api.get('/api/users/api-keys');
};

export const createApiKey = async (description: string): Promise<{ key: string }> => {
    return api.post('/api/users/api-keys', { description });
};

export const deleteApiKey = async (keyId: string): Promise<{ message: string }> => {
    return api.delete(`/api/users/api-keys/${keyId}`);
};

// --- Data & Activity ---
export const exportUserData = async (): Promise<any> => {
    return api.get('/api/users/export');
};

export const getUserActivity = async (userId: string): Promise<ActivityLog[]> => {
    return api.get(`/api/users/${userId}/activity`);
};

// --- Notifications ---
export const getNotifications = async (): Promise<Notification[]> => {
    return api.get('/api/users/notifications');
};

export const markNotificationRead = async (notificationId: number): Promise<{ message: string }> => {
    return api.put(`/api/users/notifications/${notificationId}/read`, {});
};

export const markAllNotificationsRead = async (): Promise<{ message: string }> => {
    return api.post('/api/users/notifications/read-all', {});
};

export const deleteNotification = async (notificationId: number): Promise<{ message: string }> => {
    return api.delete(`/api/users/notifications/${notificationId}`);
};