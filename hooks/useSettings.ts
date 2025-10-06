
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
}

const SETTINGS_STORAGE_KEY = 'mahama_news_hub_settings';

const defaultSettings: Settings = {
    theme: 'system',
    layoutMode: 'normal',
    fontSize: 'base',
    preferredCategories: [],
};

const applyTheme = (theme: Theme) => {
    const root = window.document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
        root.classList.add(systemPrefersDark ? 'dark' : 'light');
    } else {
        root.classList.add(theme);
    }
};

const applyFontSize = (size: FontSize) => {
    const root = window.document.documentElement;
    root.style.fontSize = size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px';
}

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                const newSettings = { ...defaultSettings, ...parsedSettings };
                setSettings(newSettings);
                applyTheme(newSettings.theme);
                applyFontSize(newSettings.fontSize);
            } else {
                applyTheme(defaultSettings.theme);
                applyFontSize(defaultSettings.fontSize);
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
            applyTheme(defaultSettings.theme);
            applyFontSize(defaultSettings.fontSize);
        }
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (settings.theme === 'system') {
                applyTheme('system');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings.theme]);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prevSettings => {
            const updatedSettings = { ...prevSettings, ...newSettings };
            
            try {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
                if (newSettings.theme) {
                    applyTheme(updatedSettings.theme);
                }
                if (newSettings.fontSize) {
                    applyFontSize(updatedSettings.fontSize);
                }
            } catch (error) {
                console.error("Failed to save settings to localStorage", error);
            }

            return updatedSettings;
        });
    }, []);
    

    return { settings, updateSettings, allCategories: ALL_CATEGORIES };
};
