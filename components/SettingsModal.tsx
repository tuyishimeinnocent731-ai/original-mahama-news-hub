import React from 'react';
import Modal from './Modal';
import { useSettings, Settings } from '../hooks/useSettings';
import { User } from '../types';
import ToggleSwitch from './ToggleSwitch';
import { LockIcon } from './icons/LockIcon';
import { AccessibilityIcon } from './icons/AccessibilityIcon';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUpgradeClick: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onUpgradeClick }) => {
    const { settings, updateSettings, allCategories } = useSettings();
    const isPremium = user?.subscription === 'standard' || user?.subscription === 'premium';

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

    const handleDyslexiaFontToggle = () => {
        if (isPremium) {
            handleSettingChange('dyslexiaFont', !settings.dyslexiaFont)
        } else {
            onUpgradeClick();
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="space-y-6">
                {/* Theme Setting */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h3>
                    <div className="mt-4 space-y-4">
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
                    </div>
                </div>

                {/* Accessibility Settings */}
                <div className="pt-6 border-t dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center"><AccessibilityIcon className="mr-2"/> Accessibility</h3>
                    <div className="mt-4 space-y-3">
                       <div className="flex items-center justify-between">
                            <label htmlFor="highContrast" className="text-sm font-medium text-gray-700 dark:text-gray-300">High Contrast Mode</label>
                            <ToggleSwitch id="highContrast" checked={settings.highContrast} onChange={(e) => handleSettingChange('highContrast', e.target.checked)} />
                       </div>
                       <div className="flex items-center justify-between">
                            <label htmlFor="reduceMotion" className="text-sm font-medium text-gray-700 dark:text-gray-300">Reduce Motion</label>
                            <ToggleSwitch id="reduceMotion" checked={settings.reduceMotion} onChange={(e) => handleSettingChange('reduceMotion', e.target.checked)} />
                       </div>
                       <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="dyslexiaFont" className={`text-sm font-medium ${isPremium ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>Dyslexia-Friendly Font</label>
                                {!isPremium && <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded-full">Premium</span>}
                            </div>
                            <div className="flex items-center space-x-2">
                                {!isPremium && <LockIcon className="w-4 h-4 text-gray-400 dark:text-gray-500"/>}
                                <ToggleSwitch id="dyslexiaFont" checked={settings.dyslexiaFont} onChange={handleDyslexiaFontToggle} disabled={!isPremium} />
                            </div>
                       </div>
                    </div>
                </div>

                {/* Preferred Categories */}
                <div className="pt-6 border-t dark:border-gray-700">
                    <label className="block text-lg font-medium text-gray-900 dark:text-white">Preferred Categories</label>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {allCategories.map(category => (
                            <button 
                                key={category} 
                                onClick={() => handleCategoryToggle(category)} 
                                className={`px-3 py-1.5 rounded-full text-xs font-medium ${settings.preferredCategories.includes(category) ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
                
                 <div className="flex justify-end pt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                        Done
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;