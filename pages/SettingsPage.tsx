import React from 'react';
import { useSettings, Settings } from '../hooks/useSettings';

const SettingsPage: React.FC = () => {
    const { settings, updateSettings, allCategories } = useSettings();

    const handleSettingChange = (key: keyof Settings, value: any) => {
        updateSettings({ [key]: value });
    };

    const handleCategoryToggle = (category: string) => {
        const currentCategories = settings.preferredCategories;
        const newCategories = currentCategories.includes(category)
            ? currentCategories.filter(c => c !== category)
            : [...currentCategories, category];
        updateSettings({ preferredCategories: newCategories });
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-8">
                
                {/* Theme Setting */}
                <div>
                    <h2 className="text-xl font-semibold mb-3">Theme</h2>
                    <div className="flex space-x-2">
                        {(['light', 'dark', 'system'] as const).map(theme => (
                            <button key={theme} onClick={() => handleSettingChange('theme', theme)} className={`px-4 py-2 rounded-md text-sm ${settings.theme === theme ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Layout Mode */}
                <div>
                    <h2 className="text-xl font-semibold mb-3">Article Layout</h2>
                    <div className="flex space-x-2">
                        {(['normal', 'compact'] as const).map(mode => (
                            <button key={mode} onClick={() => handleSettingChange('layoutMode', mode)} className={`px-4 py-2 rounded-md text-sm ${settings.layoutMode === mode ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div>
                    <h2 className="text-xl font-semibold mb-3">Font Size</h2>
                     <div className="flex space-x-2">
                        {(['sm', 'base', 'lg'] as const).map(size => (
                            <button key={size} onClick={() => handleSettingChange('fontSize', size)} className={`px-4 py-2 rounded-md text-sm ${settings.fontSize === size ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {size === 'sm' ? 'Small' : size === 'base' ? 'Normal' : 'Large'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferred Categories */}
                <div>
                    <h2 className="text-xl font-semibold mb-3">Preferred Categories</h2>
                    <div className="flex flex-wrap gap-2">
                        {allCategories.map(category => (
                            <button 
                                key={category} 
                                onClick={() => handleCategoryToggle(category)} 
                                className={`px-3 py-1.5 rounded-full text-xs ${settings.preferredCategories.includes(category) ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;
