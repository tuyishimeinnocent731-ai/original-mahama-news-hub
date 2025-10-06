
import { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';
import { ALL_CATEGORIES } from '../constants';

const defaultSettings: Settings = {
    theme: 'system',
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    dyslexiaFont: false,
    notifications: {
        breakingNews: true,
        weeklyDigest: true,
        specialOffers: false,
    },
    preferredCategories: [],
    dataSharing: true,
    adPersonalization: true,
    showSidebar: true,
};

const applySettingsToDOM = (settings: Settings) => {
    const root = window.document.documentElement;

    // Theme
    root.classList.remove('light', 'dark');
    if (settings.theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(systemPrefersDark ? 'dark' : 'light');
    } else {
        root.classList.add(settings.theme);
    }
    
    // Font size
    root.style.fontSize = settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px';

    // High contrast
    if (settings.highContrast) {
        root.classList.add('high-contrast');
    } else {
        root.classList.remove('high-contrast');
    }

    // Reduce motion
    if (settings.reduceMotion) {
        root.classList.add('reduce-motion');
    } else {
        root.classList.remove('reduce-motion');
    }

    // Dyslexia font
    if (settings.dyslexiaFont) {
        root.classList.add('dyslexia-font');
    } else {
        root.classList.remove('dyslexia-font');
    }
};

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem('app-settings');
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                // Ensure all default keys are present
                const mergedSettings = {
                    ...defaultSettings,
                    ...parsedSettings,
                    notifications: {
                        ...defaultSettings.notifications,
                        ...(parsedSettings.notifications || {})
                    }
                };
                setSettings(mergedSettings);
                applySettingsToDOM(mergedSettings);
            } else {
                applySettingsToDOM(defaultSettings);
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
            applySettingsToDOM(defaultSettings);
        }
        setIsInitialized(true);
    }, []);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prevSettings => {
            const updatedSettings = { ...prevSettings, ...newSettings };
            try {
                localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
                applySettingsToDOM(updatedSettings);
            } catch (error) {
                console.error("Failed to save settings to localStorage", error);
            }
            return updatedSettings;
        });
    }, []);

    useEffect(() => {
        if (!isInitialized) return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (settings.theme === 'system') {
                applySettingsToDOM(settings);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings, isInitialized]);

    return { settings, updateSettings, allCategories: ALL_CATEGORIES, isInitialized };
};
