import { useState, useEffect, useCallback } from 'react';
import { Settings, ThemeSettings, FontSettings, LayoutSettings } from '../types';
import { ALL_CATEGORIES, THEMES, ACCENT_COLORS, FONTS, FONT_WEIGHTS } from '../constants';

const defaultSettings: Settings = {
    theme: { name: 'default', accent: 'yellow' },
    font: { family: 'Inter', weight: '400' },
    layout: { homepage: 'grid', density: 'comfortable', infiniteScroll: false },
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
};

const applySettingsToDOM = (settings: Settings) => {
    const root = document.documentElement;

    // --- THEME & ACCENT ---
    const theme = THEMES.find(t => t.id === settings.theme.name) || THEMES[0];
    const isDark = settings.highContrast ? root.classList.contains('dark') : (settings.theme.name !== 'default' || root.classList.contains('dark'));
    
    // Determine the color palette
    const palette = isDark ? (theme.palette.dark || theme.palette.light) : theme.palette.light;

    Object.entries(palette).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
    });

    const accent = ACCENT_COLORS.find(a => a.id === settings.theme.accent) || ACCENT_COLORS[0];
    root.style.setProperty('--color-accent', accent.rgb);
    root.style.setProperty('--color-accent-foreground', accent.fgRgb);

    // --- FONT ---
    const font = FONTS.find(f => f.family === settings.font.family) || FONTS[0];
    const fontWeight = settings.font.weight;
    
    // Dynamically load Google Font
    const fontLoader = document.getElementById('font-loader');
    if (fontLoader) {
        const fontUrl = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
        const existingLink = document.getElementById(`font-link-${font.family}`);
        if (!existingLink) {
            fontLoader.innerHTML = ''; // Clear previous fonts
            const link = document.createElement('link');
            link.id = `font-link-${font.family}`;
            link.rel = 'stylesheet';
            link.href = fontUrl;
            fontLoader.appendChild(link);
        }
    }
    root.style.setProperty('--font-body', `"${font.family}"`);
    root.style.setProperty('--font-weight-body', fontWeight);


    // --- General Accessibility & Layout ---
    root.style.fontSize = settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px';
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('reduce-motion', settings.reduceMotion);
    root.classList.toggle('dyslexia-font', settings.dyslexiaFont);

    // Apply layout density class
    document.body.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    document.body.classList.add(`density-${settings.layout.density}`);
};

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem('app-settings');
            if (storedSettings) {
                const parsed = JSON.parse(storedSettings);
                // Deep merge to ensure all keys are present, preventing crashes on new settings
                const mergedSettings: Settings = {
                    ...defaultSettings,
                    ...parsed,
                    theme: { ...defaultSettings.theme, ...(parsed.theme || {}) },
                    font: { ...defaultSettings.font, ...(parsed.font || {}) },
                    layout: { ...defaultSettings.layout, ...(parsed.layout || {}) },
                    notifications: { ...defaultSettings.notifications, ...(parsed.notifications || {}) },
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
            // Deep merge partial updates
            const updatedSettings = {
                ...prevSettings,
                ...newSettings,
                theme: { ...prevSettings.theme, ...(newSettings.theme || {}) },
                font: { ...prevSettings.font, ...(newSettings.font || {}) },
                layout: { ...prevSettings.layout, ...(newSettings.layout || {}) },
                notifications: { ...prevSettings.notifications, ...(newSettings.notifications || {}) },
            };
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
        const handleChange = (e: MediaQueryListEvent) => {
            document.documentElement.classList.toggle('dark', e.matches);
            applySettingsToDOM(settings);
        };
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings, isInitialized]);

    return { settings, updateSettings, allCategories: ALL_CATEGORIES, isInitialized };
};
