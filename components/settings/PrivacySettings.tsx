
import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import ToggleSwitch from '../ToggleSwitch';

const PrivacySettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();

    const handlePrivacyChange = (key: 'dataSharing' | 'adPersonalization', value: boolean) => {
        updateSettings({ [key]: value });
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Privacy & Data</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Control how your data is used to improve our services and personalize your experience.</p>
            <div className="space-y-4 max-w-md">
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="dataSharing" className="font-medium text-gray-700 dark:text-gray-300">Data Sharing</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Allow us to use your data to improve our services.</p>
                        </div>
                        <ToggleSwitch id="dataSharing" checked={settings.dataSharing} onChange={(e) => handlePrivacyChange('dataSharing', e.target.checked)} />
                    </div>
                </div>
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="adPersonalization" className="font-medium text-gray-700 dark:text-gray-300">Ad Personalization</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Allow us to show you more relevant ads.</p>
                        </div>
                        <ToggleSwitch id="adPersonalization" checked={settings.adPersonalization} onChange={(e) => handlePrivacyChange('adPersonalization', e.target.checked)} />
                    </div>
                </div>
                 <div className="pt-4">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Download Your Data</button>
                    <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                    <button className="text-sm text-red-600 dark:text-red-400 hover:underline">Delete Your Account</button>
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
