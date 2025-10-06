import { useState, useEffect, useCallback } from 'react';
import { ALL_CATEGORIES } from '../constants';

type Theme = 'light' | 'dark' | 'system';
type LayoutMode = 'normal' | 'compact';
type FontSize = 'sm' | 'base' | 'lg';

export interface Settings {
    theme: Theme;
    notifications: boolean;
    preferredCategories: string[];
    fontSize: FontSize;
    layoutMode: LayoutMode;
    region: string;
    showSponsored: boolean;
}

const defaultSettings: Settings = {
    theme: 'system',
    notifications: true,
    preferredCategories: ['Technology', 'Business'],
    fontSize: 'base',
    layoutMode: 'normal',
    region: 'us',
    showSponsored: true,
};

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    const applyTheme = useCallback((theme: Theme) => {
        const root = window.document.documentElement;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            root.classList.add(systemPrefersDark ? 'dark' : 'light');
        } else {
            root.classList.add(theme);
        }
    }, []);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem('settings');
            const loadedSettings = storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;
            setSettings(loadedSettings);
            applyTheme(loadedSettings.theme);
        } catch (error) {
            console.error("Failed to parse settings from localStorage", error);
            applyTheme(defaultSettings.theme);
        }
    }, [applyTheme]);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (settings.theme === 'system') {
                applyTheme('system');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings.theme, applyTheme]);


    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('settings', JSON.stringify(updated));
            if (newSettings.theme) {
                applyTheme(newSettings.theme);
            }
            return updated;
        });
    };

    return { settings, updateSettings, allCategories: ALL_CATEGORIES };
};
