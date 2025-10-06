import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
    theme: Theme;
    preferredCategories: string[];
}

const SETTINGS_KEY = 'appSettings';

const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    preferredCategories: []
  });

  useEffect(() => {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const applyTheme = () => {
        if (settings.theme === 'dark' || (settings.theme === 'system' && getSystemTheme() === 'dark')) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };
    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);

    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  const setTheme = useCallback((theme: Theme) => {
    updateSettings({ theme });
  }, [settings]);

  const setPreferredCategories = useCallback((categories: string[]) => {
    updateSettings({ preferredCategories: categories });
  }, [settings]);


  return { settings, setTheme, setPreferredCategories };
};