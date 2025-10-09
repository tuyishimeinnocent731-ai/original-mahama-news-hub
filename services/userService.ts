import { api } from './apiService';
import { User, UserSession, ApiKey, Notification, JobApplication, ActivityLog } from '../types';

// Profile & Settings
export const updateProfile = async (profileData: Partial<Pick<User, 'name' | 'bio' | 'avatar' | 'socials'>>) => {
    const formData = new FormData();

    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (profileData.socials) formData.append('socials', JSON.stringify(profileData.socials));

    if (profileData.avatar && typeof profileData.avatar === 'string' && profileData.avatar.startsWith('data:')) {
        const fetchRes = await fetch(profileData.avatar);
        const blob = await fetchRes.blob();
        formData.append('avatar', blob, 'avatar.png');
    }

    return api.putFormData('/api/users/profile', formData);
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/api/users/password', { currentPassword, newPassword });
};

export const clearSearchHistory = async (): Promise<void> => {
    await api.delete('/api/users/search-history');
};

export const deleteAccount = async (): Promise<void> => {
    await api.delete('/api/users/me/account');
}

// Security & Sessions
export const getSessions = async (): Promise<UserSession[]> => {
    return api.get<UserSession[]>('/api/users/sessions');
};

export const terminateSession = async (sessionId: number): Promise<void> => {
    await api.delete(`/api/users/sessions/${sessionId}`);
};

// API Keys (Pro feature)
export const getApiKeys = async (): Promise<ApiKey[]> => {
    return api.get<ApiKey[]>('/api/users/api-keys');
};

export const createApiKey = async (description: string): Promise<{ key: string }> => {
    return api.post<{ key: string }>('/api/users/api-keys', { description });
};

export const deleteApiKey = async (keyId: string): Promise<void> => {
    await api.delete(`/api/users/api-keys/${keyId}`);
};

// Notifications
export const getNotifications = async (): Promise<Notification[]> => {
    return api.get<Notification[]>('/api/users/notifications');
};

export const markNotificationRead = async (notificationId: number): Promise<void> => {
    return api.put(`/api/users/notifications/${notificationId}/read`, {});
}

export const markAllNotificationsRead = async (): Promise<void> => {
    return api.post('/api/users/notifications/read-all', {});
};

export const deleteNotification = async (notificationId: number): Promise<void> => {
    return api.delete(`/api/users/notifications/${notificationId}`);
};


// Data Management
export const exportUserData = async (): Promise<any> => {
    return api.get('/api/users/data-export');
};

// Job Applications
export const getMyApplications = async (): Promise<JobApplication[]> => {
    return api.get<JobApplication[]>('/api/users/me/applications');
};

// Admin
export const getUserActivity = async (userId: string): Promise<ActivityLog[]> => {
    return api.get<ActivityLog[]>(`/api/users/${userId}/activity`);
};

export const adminResetPassword = async (userId: string): Promise<{ temporaryPassword: string }> => {
    return api.post(`/api/users/${userId}/reset-password`, {});
};