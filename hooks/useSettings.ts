import { useState, useEffect, useCallback } from 'react';
import { Settings, ThemeSettings, FontSettings, LayoutSettings, UiSettings, ReadingSettings } from '../types';
import { ALL_CATEGORIES, THEMES, ACCENT_COLORS, FONTS, FONT_WEIGHTS } from '../constants';

const defaultSettings: Settings = {
    theme: { name: 'default', accent: 'yellow' },
    font: { family: 'Inter', weight: '400' },
    layout: { homepage: 'grid', density: 'comfortable', infiniteScroll: false },
    ui: { cardStyle: 'standard', borderRadius: 'rounded' },
    reading: { autoPlayAudio: false, defaultSummaryView: false, lineHeight: 1.6, letterSpacing: 0, justifyText: false },
    fontSize: 'small',
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

// Helper to extract palette from image
const getPaletteFromImage = async (base64Image: string): Promise<Record<string, string>> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Canvas context not available');
            ctx.drawImage(img, 0, 0);
            
            // Simplified palette extraction - in real-world, use a library like color-thief
            const data = ctx.getImageData(0, 0, 50, 50).data;
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i]; g += data[i+1]; b += data[i+2];
                count++;
            }
            const avgR = Math.floor(r / count);
            const avgG = Math.floor(g / count);
            const avgB = Math.floor(b / count);
            
            const isDark = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114) < 186;

            resolve({
                background: isDark ? `30 30 30` : `245 245 245`,
                foreground: isDark ? `240 240 240` : `20 20 20`,
                card: isDark ? `45 45 45` : `255 255 255`,
                'card-foreground': isDark ? `240 240 240` : `20 20 20`,
                primary: `${avgR} ${avgG} ${avgB}`,
                'primary-foreground': isDark ? `255 255 255` : `0 0 0`,
                secondary: isDark ? '60 60 60' : '230 230 230',
                'secondary-foreground': isDark ? '240 240 240' : '20 20 20',
                muted: isDark ? '70 70 70' : '220 220 220',
                'muted-foreground': isDark ? '180 180 180' : '100 100 100',
                border: isDark ? '80 80 80' : '210 210 210'
            });
        };
        img.onerror = reject;
    });
};

const applySettingsToDOM = async (settings: Settings) => {
    const root = document.documentElement;
    
    // --- BACKGROUND IMAGE ---
    if (settings.theme.name === 'image' && settings.theme.customImage) {
      root.style.setProperty('--bg-image', `url(${settings.theme.customImage})`);
      document.body.classList.add('bg-image-active');
    } else {
      root.style.removeProperty('--bg-image');
      document.body.classList.remove('bg-image-active');
    }

    // --- THEME & ACCENT ---
    let palette;
    if (settings.theme.name === 'image' && settings.theme.customImage) {
        palette = await getPaletteFromImage(settings.theme.customImage);
    } else {
        const theme = THEMES.find(t => t.id === settings.theme.name) || THEMES[0];
        const isDark = document.documentElement.classList.contains('dark');
        palette = isDark ? (theme.palette.dark || theme.palette.light) : theme.palette.light;
    }
    
    Object.entries(palette).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, String(value));
    });

    const accent = ACCENT_COLORS.find(a => a.id === settings.theme.accent) || ACCENT_COLORS[0];
    root.style.setProperty('--color-accent', accent.rgb);
    root.style.setProperty('--color-accent-foreground', accent.fgRgb);

    // --- FONT ---
    const font = FONTS.find(f => f.family === settings.font.family) || FONTS[0];
    const fontWeight = settings.font.weight;
    
    const fontLoader = document.getElementById('font-loader');
    if (fontLoader) {
        const fontUrl = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
        const existingLink = document.getElementById(`font-link-${font.family}`);
        if (!existingLink) {
            fontLoader.innerHTML = '';
            const link = document.createElement('link');
            link.id = `font-link-${font.family}`;
            link.rel = 'stylesheet';
            link.href = fontUrl;
            fontLoader.appendChild(link);
        }
    }
    root.style.setProperty('--font-body', `"${font.family}"`);
    root.style.setProperty('--font-weight-body', fontWeight);

    // --- READING EXPERIENCE ---
    root.style.setProperty('--line-height', String(settings.reading.lineHeight));
    root.style.setProperty('--letter-spacing', `${settings.reading.letterSpacing}px`);
    document.body.classList.toggle('text-justify', settings.reading.justifyText);


    // --- UI SETTINGS (Card style, border radius) ---
    const radii = { sharp: '0rem', rounded: '0.5rem', pill: '9999px' };
    root.style.setProperty('--radius', radii[settings.ui.borderRadius]);
    
    document.body.classList.remove('card-standard', 'card-elevated', 'card-outline');
    document.body.classList.add(`card-${settings.ui.cardStyle}`);

    // --- General Accessibility & Layout ---
    root.style.fontSize = settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px';
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('reduce-motion', settings.reduceMotion);
    root.classList.toggle('dyslexia-font', settings.dyslexiaFont);

    document.body.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    document.body.classList.add(`density-${settings.layout.density}`);
};

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const loadAndApplySettings = async () => {
            try {
                const storedSettings = localStorage.getItem('app-settings');
                let effectiveSettings = defaultSettings;
                if (storedSettings) {
                    const parsed = JSON.parse(storedSettings);
                    effectiveSettings = {
                        ...defaultSettings,
                        ...parsed,
                        theme: { ...defaultSettings.theme, ...(parsed.theme || {}) },
                        font: { ...defaultSettings.font, ...(parsed.font || {}) },
                        layout: { ...defaultSettings.layout, ...(parsed.layout || {}) },
                        ui: { ...defaultSettings.ui, ...(parsed.ui || {}) },
                        reading: { ...defaultSettings.reading, ...(parsed.reading || {}) },
                        notifications: { ...defaultSettings.notifications, ...(parsed.notifications || {}) },
                    };
                }
                setSettings(effectiveSettings);
                await applySettingsToDOM(effectiveSettings);
            } catch (error) {
                console.error("Failed to load settings from localStorage", error);
                await applySettingsToDOM(defaultSettings);
            }
            setIsInitialized(true);
        };
        loadAndApplySettings();
    }, []);

    const updateSettings = useCallback((newSettings: Partial<Settings> | ((s: Settings) => Partial<Settings>)) => {
        setSettings(prevSettings => {
            const updates = typeof newSettings === 'function' ? newSettings(prevSettings) : newSettings;
            
            const updated: Settings = {
                ...prevSettings,
                ...updates,
                theme: { ...prevSettings.theme, ...(updates.theme || {}) },
                font: { ...prevSettings.font, ...(updates.font || {}) },
                layout: { ...prevSettings.layout, ...(updates.layout || {}) },
                ui: { ...prevSettings.ui, ...(updates.ui || {}) },
                reading: { ...prevSettings.reading, ...(updates.reading || {}) },
                notifications: { ...prevSettings.notifications, ...(updates.notifications || {}) },
            };

            try {
                localStorage.setItem('app-settings', JSON.stringify(updated));
                applySettingsToDOM(updated);
            } catch (error) {
                console.error("Failed to save settings to localStorage", error);
            }
            return updated;
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

    return { settings, setSettings, updateSettings, allCategories: ALL_CATEGORIES, isInitialized };
};