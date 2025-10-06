import React from 'react';
import { useSettings } from '../../hooks/useSettings';

const PreferencesSettings: React.FC = () => {
    const { settings, updateSettings, allCategories } = useSettings();

    const handleCategoryToggle = (category: string) => {
        const currentPreferences = settings.preferredCategories || [];
        const newPreferences = currentPreferences.includes(category)
            ? currentPreferences.filter(c => c !== category)
            : [...currentPreferences, category];
        updateSettings({ preferredCategories: newPreferences });
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Content Preferences</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                Select your favorite topics. We'll show you more stories from these categories on the homepage.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allCategories.map(category => {
                    const isSelected = settings.preferredCategories.includes(category);
                    return (
                        <button
                            key={category}
                            onClick={() => handleCategoryToggle(category)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors duration-200 ${
                                isSelected 
                                ? 'bg-yellow-500 border-yellow-500 text-white' 
                                : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PreferencesSettings;