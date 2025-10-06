import { useState, useEffect, useCallback } from 'react';
import { ALL_CATEGORIES } from '../constants';

export type Theme = 'light' | 'dark' | 'system';
export type LayoutMode = 'normal' | 'compact';
export type FontSize = 'sm' | 'base' | 'lg';

export interface Settings {
    theme: Theme;
    layoutMode: LayoutMode;
    fontSize: FontSize;
    preferredCategories: string[];
    highContrast: boolean;
    dyslexiaFont: boolean;
    reduceMotion: boolean;
    notifications: {
        breakingNews: boolean;
        weeklyDigest: boolean;
        specialOffers: boolean;
    };
}

const SETTINGS_STORAGE_KEY = 'mahama_news_hub_settings';

const defaultSettings: Settings = {
    theme: 'system',
    layoutMode: 'normal',
    fontSize: 'base',
    preferredCategories: [],
    highContrast: false,
    dyslexiaFont: false,
    reduceMotion: false,
    notifications: {
        breakingNews: true,
        weeklyDigest: true,
        specialOffers: false,
    },
};

const applyAllSettings = (settings: Settings) => {
    const root = window.document.documentElement;
    
    // Theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.remove('light', 'dark');
    if (settings.theme === 'system') {
        root.classList.add(systemPrefersDark ? 'dark' : 'light');
    } else {
        root.classList.add(settings.theme);
    }

    // Font Size
    root.style.fontSize = settings.fontSize === 'sm' ? '14px' : settings.fontSize === 'lg' ? '18px' : '16px';

    // Accessibility
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('dyslexia-font', settings.dyslexiaFont);
    root.classList.toggle('reduce-motion', settings.reduceMotion);
}

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            const initialSettings = storedSettings 
                ? { ...defaultSettings, ...JSON.parse(storedSettings) }
                : defaultSettings;
            
            setSettings(initialSettings);
            applyAllSettings(initialSettings);
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
            applyAllSettings(defaultSettings);
        }
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (settings.theme === 'system') {
                applyAllSettings(settings);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings]);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prevSettings => {
            // A simple merge for nested objects
            const updatedSettings = { 
                ...prevSettings, 
                ...newSettings,
                notifications: {
                    ...prevSettings.notifications,
                    ...(newSettings.notifications || {}),
                }
            };
            
            try {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
                applyAllSettings(updatedSettings);
            } catch (error) {
                console.error("Failed to save settings to localStorage", error);
            }

            return updatedSettings;
        });
    }, []);
    

    return { settings, updateSettings, allCategories: ALL_CATEGORIES };
};
