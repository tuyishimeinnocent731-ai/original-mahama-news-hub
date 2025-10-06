import React from 'react';
import { useSettings, Settings } from '../../hooks/useSettings';

const AppearanceSettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();

    const handleSettingChange = (key: keyof Settings, value: any) => {
        updateSettings({ [key]: value });
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Appearance</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Customize the look and feel of the application.</p>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Select your preferred color scheme.</p>
                    <div className="mt-2 flex space-x-2">
                        {(['light', 'dark', 'system'] as const).map(theme => (
                            <button key={theme} onClick={() => handleSettingChange('theme', theme)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${settings.theme === theme ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Article Layout</label>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Choose how articles are displayed on the homepage.</p>
                    <div className="mt-2 flex space-x-2">
                        {(['normal', 'compact'] as const).map(mode => (
                            <button key={mode} onClick={() => handleSettingChange('layoutMode', mode)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${settings.layoutMode === mode ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</label>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Adjust the global font size for better readability.</p>
                    <div className="mt-2 flex space-x-2">
                        {(['sm', 'base', 'lg'] as const).map(size => (
                            <button key={size} onClick={() => handleSettingChange('fontSize', size)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${settings.fontSize === size ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                {size === 'sm' ? 'Small' : size === 'base' ? 'Normal' : 'Large'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
