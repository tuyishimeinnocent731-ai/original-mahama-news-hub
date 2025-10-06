
import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { SunIcon } from '../icons/SunIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { DesktopComputerIcon } from '../icons/DesktopComputerIcon';
import { Settings } from '../../types';
import ToggleSwitch from '../ToggleSwitch';

type Theme = Settings['theme'];
type FontSize = Settings['fontSize'];

const AppearanceSettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();

    const handleThemeChange = (theme: Theme) => {
        updateSettings({ theme });
    };

    const handleFontSizeChange = (size: FontSize) => {
        updateSettings({ fontSize: size });
    };

    const themeOptions = [
        { value: 'light', label: 'Light', icon: <SunIcon /> },
        { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
        { value: 'system', label: 'System', icon: <DesktopComputerIcon /> },
    ];

    const fontSizeOptions: {value: FontSize, label: string}[] = [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
    ];

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Appearance</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Customize the look and feel of the application.</p>
            
            <div className="space-y-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-4 max-w-md">
                        {themeOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => handleThemeChange(option.value as Theme)}
                                className={`p-4 border rounded-lg text-center transition-colors ${settings.theme === option.value ? 'border-yellow-500 ring-2 ring-yellow-500' : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400'}`}
                            >
                                <div className="mx-auto w-6 h-6 mb-2">{option.icon}</div>
                                <span className="text-sm font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg max-w-xs">
                        {fontSizeOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => handleFontSizeChange(option.value)}
                                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${settings.fontSize === option.value ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;