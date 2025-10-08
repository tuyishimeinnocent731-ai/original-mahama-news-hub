import { NavLink, Page, ContactMessage, JobPosting, JobApplication } from '../types';
import { api } from './apiService';

// --- Navigation ---
export const getNavLinks = async (): Promise<NavLink[]> => {
    try {
        return await api.get<NavLink[]>('/api/site/nav-links');
    } catch (error) {
        console.error("Failed to fetch nav links from API, returning empty array.", error);
        return [];
    }
};

export const saveNavLinks = async (links: NavLink[]): Promise<void> => {
    try {
        await api.put('/api/site/nav-links', links);
    } catch (error) {
        console.error("Failed to save nav links.", error);
        throw new Error("Could not save navigation links.");
    }
};

// --- Site Settings ---
export const getSiteSettings = async (): Promise<{siteName: string, maintenanceMode: boolean}> => {
    try {
        return await api.get('/api/site/settings');
    } catch(error) {
        console.error("Failed to fetch site settings", error);
        return { siteName: 'Mahama News Hub', maintenanceMode: false }; // fallback
    }
}

export const saveSiteSettings = async (settings: Partial<{siteName: string, maintenanceMode: boolean}>): Promise<void> => {
    try {
        await api.put('/api/site/settings', settings);
    } catch (error) {
        console.error("Failed to save site settings.", error);
        throw new Error("Could not save site settings.");
    }
};

// --- Page Content ---
export const getPage = async (slug: string): Promise<Page> => {
    return api.get<Page>(`/api/site/pages/${slug}`);
};

export const updatePage = async (slug: string, data: Partial<Page>): Promise<void> => {
    return api.put(`/api/site/pages/${slug}`, data);
};

// --- Contact Messages ---
export const submitContactForm = async (data: { name: string; email: string; subject?: string; message: string }): Promise<void> => {
    return api.post('/api/site/contact', data);
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
    return api.get<ContactMessage[]>('/api/site/contact-messages');
};

export const updateContactMessage = async (id: number, data: Partial<{ is_read: boolean }>): Promise<void> => {
    return api.put(`/api/site/contact-messages/${id}`, data);
};

export const deleteContactMessage = async (id: number): Promise<void> => {
    return api.delete(`/api/site/contact-messages/${id}`);
};

// --- Job Postings & Applications ---
export const getJobPostings = async (): Promise<JobPosting[]> => {
    return api.get<JobPosting[]>('/api/site/jobs');
};

export const applyForJob = async (jobId: number, applicationData: FormData): Promise<void> => {
    return api.postFormData(`/api/site/jobs/${jobId}/apply`, applicationData);
};

// Admin Job Functions
export const createJob = async (jobData: Omit<JobPosting, 'id' | 'created_at'>): Promise<JobPosting> => {
    return api.post<JobPosting>('/api/site/jobs', jobData);
};

export const updateJob = async (jobId: number, jobData: Partial<JobPosting>): Promise<void> => {
    return api.put(`/api/site/jobs/${jobId}`, jobData);
};

export const deleteJob = async (jobId: number): Promise<void> => {
    return api.delete(`/api/site/jobs/${jobId}`);
};

export const getApplicationsForJob = async (jobId: number): Promise<JobApplication[]> => {
    return api.get<JobApplication[]>(`/api/site/jobs/${jobId}/applications`);
};