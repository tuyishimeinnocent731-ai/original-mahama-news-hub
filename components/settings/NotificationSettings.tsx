import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import ToggleSwitch from '../ToggleSwitch';

const NotificationSettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();

    const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
        updateSettings({ 
            notifications: {
                ...settings.notifications,
                [key]: value,
            }
        });
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Notifications</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage how you receive notifications from us.</p>
             <div className="space-y-4 max-w-md">
                <div className="p-4 border dark:border-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                        <label htmlFor="breakingNews" className="font-medium text-gray-700 dark:text-gray-300">Breaking News Alerts</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Get notified about major global events as they happen.</p>
                    </div>
                    <ToggleSwitch id="breakingNews" checked={settings.notifications.breakingNews} onChange={(e) => handleNotificationChange('breakingNews', e.target.checked)} />
                </div>
                 <div className="p-4 border dark:border-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                        <label htmlFor="weeklyDigest" className="font-medium text-gray-700 dark:text-gray-300">Weekly Digest</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Receive a summary of the week's top stories.</p>
                    </div>
                    <ToggleSwitch id="weeklyDigest" checked={settings.notifications.weeklyDigest} onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)} />
                </div>
                 <div className="p-4 border dark:border-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                        <label htmlFor="specialOffers" className="font-medium text-gray-700 dark:text-gray-300">Special Offers</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Get notified about special offers and promotions.</p>
                    </div>
                    <ToggleSwitch id="specialOffers" checked={settings.notifications.specialOffers} onChange={(e) => handleNotificationChange('specialOffers', e.target.checked)} />
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
