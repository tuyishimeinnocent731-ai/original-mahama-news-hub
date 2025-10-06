import React from 'react';
import Modal from './Modal';
import { useSettings, Settings } from '../hooks/useSettings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
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
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="space-y-6">
                {/* Theme Setting */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                    <div className="mt-2 flex space-x-2">
                        {(['light', 'dark', 'system'] as const).map(theme => (
                            <button key={theme} onClick={() => handleSettingChange('theme', theme)} className={`px-4 py-2 rounded-md text-sm ${settings.theme === theme ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Layout Mode */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Article Layout</label>
                    <div className="mt-2 flex space-x-2">
                        {(['normal', 'compact'] as const).map(mode => (
                            <button key={mode} onClick={() => handleSettingChange('layoutMode', mode)} className={`px-4 py-2 rounded-md text-sm ${settings.layoutMode === mode ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</label>
                     <div className="mt-2 flex space-x-2">
                        {(['sm', 'base', 'lg'] as const).map(size => (
                            <button key={size} onClick={() => handleSettingChange('fontSize', size)} className={`px-4 py-2 rounded-md text-sm ${settings.fontSize === size ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {size === 'sm' ? 'Small' : size === 'base' ? 'Normal' : 'Large'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferred Categories */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Categories</label>
                    <div className="mt-2 flex flex-wrap gap-2">
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
                
                 <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                        Done
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
