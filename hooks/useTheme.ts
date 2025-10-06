
import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * @deprecated This hook is for basic theme management. For comprehensive settings, please use `useSettings`.
 */
export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>('system');

    const applyTheme = useCallback((themeToApply: Theme) => {
        const root = window.document.documentElement;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        root.classList.remove('light', 'dark');

        if (themeToApply === 'system') {
            root.classList.add(systemPrefersDark ? 'dark' : 'light');
        } else {
            root.classList.add(themeToApply);
        }
    }, []);

    useEffect(() => {
        try {
            const storedTheme = localStorage.getItem('theme') as Theme | null;
            const initialTheme = storedTheme || 'system';
            setTheme(initialTheme);
            applyTheme(initialTheme);
        } catch (error) {
            console.error("Failed to parse theme from localStorage", error);
            applyTheme('system');
        }
    }, [applyTheme]);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, applyTheme]);


    const updateTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    return { theme, setTheme: updateTheme };
};
