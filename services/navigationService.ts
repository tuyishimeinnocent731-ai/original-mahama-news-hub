import { NavLink } from '../types';
import { api } from './apiService';

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
