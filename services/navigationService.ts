import { NavLink } from '../types';
import { NAV_LINKS as INITIAL_NAV_LINKS } from '../constants';

const addIds = (links: Omit<NavLink, 'id'>[], parentId: string = 'nav'): NavLink[] => {
    return links.map((link, index) => {
        const id = `${parentId}-${link.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`;
        return {
            ...link,
            id,
            sublinks: link.sublinks ? addIds(link.sublinks, id) : [],
        };
    });
};

const defaultNavLinks = addIds(INITIAL_NAV_LINKS);

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from storage`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to storage`, error);
    }
};

export const getNavLinks = async (): Promise<NavLink[]> => {
    return Promise.resolve(loadFromStorage<NavLink[]>('nav-links', defaultNavLinks));
};

export const saveNavLinks = (links: NavLink[]): void => {
    saveToStorage('nav-links', links);
};