import React from 'react';
// FIX: The 'Settings' type is not exported from 'useSettings'. It should be imported from 'types'.
import { useSettings } from '../../hooks/useSettings';
import { User, Settings } from '../../types';
import ToggleSwitch from '../ToggleSwitch';
import { LockIcon } from '../icons/LockIcon';

interface AccessibilitySettingsProps {
    user: User | null;
    onUpgradeClick: () => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ user, onUpgradeClick }) => {
    const { settings, updateSettings } = useSettings();
    const isPremium = user?.subscription === 'premium' || user?.subscription === 'pro';

    const handleSettingChange = (key: keyof Settings, value: any) => {
        updateSettings({ [key]: value });
    };

    const handleDyslexiaFontToggle = () => {
        if (isPremium) {
            handleSettingChange('dyslexiaFont', !settings.dyslexiaFont);
        } else {
            onUpgradeClick();
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Accessibility</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Customize the interface to suit your needs.</p>
            <div className="space-y-4 max-w-md">
                <div className="p-4 border dark:border-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                        <label htmlFor="highContrast" className="font-medium text-gray-700 dark:text-gray-300">High Contrast Mode</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Increases text and background contrast.</p>
                    </div>
                    <ToggleSwitch id="highContrast" checked={settings.highContrast} onChange={(e) => handleSettingChange('highContrast', e.target.checked)} />
                </div>
                <div className="p-4 border dark:border-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                        <label htmlFor="reduceMotion" className="font-medium text-gray-700 dark:text-gray-300">Reduce Motion</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Disables animations and transitions.</p>
                    </div>
                    <ToggleSwitch id="reduceMotion" checked={settings.reduceMotion} onChange={(e) => handleSettingChange('reduceMotion', e.target.checked)} />
                </div>
                <div className={`p-4 border ${isPremium ? 'dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700'} rounded-lg flex items-center justify-between`}>
                    <div>
                        <div className="flex items-center space-x-2">
                             <label htmlFor="dyslexiaFont" className={`font-medium ${isPremium ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>Dyslexia-Friendly Font</label>
                            {!isPremium && <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded-full">Premium</span>}
                        </div>
                        <p className={`text-xs ${isPremium ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>Uses Atkinson Hyperlegible font.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isPremium && <LockIcon className="w-4 h-4 text-gray-400 dark:text-gray-500"/>}
                        <ToggleSwitch id="dyslexiaFont" checked={settings.dyslexiaFont} onChange={handleDyslexiaFontToggle} disabled={!isPremium} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessibilitySettings;
