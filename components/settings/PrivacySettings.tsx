

import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import ToggleSwitch from '../ToggleSwitch';
import { User } from '../../types';
import * as userService from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';

interface PrivacySettingsProps {
    user: User;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ user }) => {
    const { settings, updateSettings } = useSettings();
    const { addToast } = useToast();

    const handlePrivacyChange = (key: 'dataSharing' | 'adPersonalization', value: boolean) => {
        updateSettings({ [key]: value });
    };

    const handleClearHistory = async () => {
        if (window.confirm('Are you sure you want to clear your search history? This action cannot be undone.')) {
            try {
                await userService.clearSearchHistory();
                addToast('Search history cleared!', 'success');
                // You might need to refetch the user or update the state here
            } catch (error: any) {
                addToast(error.message, 'error');
            }
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Privacy & Data</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Control how your data is used to improve our services and personalize your experience.</p>
            <div className="space-y-4">
                <div className="p-4 border dark:border-gray-700 rounded-lg max-w-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="dataSharing" className="font-medium text-gray-700 dark:text-gray-300">Data Sharing</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Allow us to use your data to improve our services.</p>
                        </div>
                        <ToggleSwitch id="dataSharing" checked={settings.dataSharing} onChange={(e) => handlePrivacyChange('dataSharing', e.target.checked)} />
                    </div>
                </div>
                <div className="p-4 border dark:border-gray-700 rounded-lg max-w-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="adPersonalization" className="font-medium text-gray-700 dark:text-gray-300">Ad Personalization</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Allow us to show you more relevant ads.</p>
                        </div>
                        <ToggleSwitch id="adPersonalization" checked={settings.adPersonalization} onChange={(e) => handlePrivacyChange('adPersonalization', e.target.checked)} />
                    </div>
                </div>

                <div className="p-4 border dark:border-gray-700 rounded-lg max-w-md">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Manage Your Data</h4>
                    <div className="flex items-center space-x-4">
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Download Your Data</button>
                        <button 
                            onClick={handleClearHistory} 
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                            disabled={user.searchHistory.length === 0}
                        >
                            Clear Search History ({user.searchHistory.length})
                        </button>
                    </div>
                </div>

                 <div className="pt-4 max-w-md">
                    <button className="w-full text-left px-4 py-3 border border-red-500/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold">
                        Delete Your Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;