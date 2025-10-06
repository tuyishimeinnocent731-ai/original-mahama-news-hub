
import React, { useState } from 'react';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import ProfileSettings from '../components/settings/ProfileSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import AccessibilitySettings from '../components/settings/AccessibilitySettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SubscriptionSettings from '../components/settings/SubscriptionSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import PreferencesSettings from '../components/settings/PreferencesSettings';

import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { PaletteIcon } from '../components/icons/PaletteIcon';
import { AccessibilityIcon } from '../components/icons/AccessibilityIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { BellIcon } from '../components/icons/BellIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { ListBulletIcon } from '../components/icons/ListBulletIcon';
import { ShieldExclamationIcon } from '../components/icons/ShieldExclamationIcon';


type SettingsTab = 'profile' | 'appearance' | 'accessibility' | 'preferences' | 'notifications' | 'subscription' | 'privacy' | 'security';

interface SettingsPageProps {
    user: User | null;
    onUpgradeClick: () => void;
    clearSearchHistory: () => void;
    toggleTwoFactor: (enabled: boolean) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpgradeClick, clearSearchHistory, toggleTwoFactor }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const { updateProfile } = useAuth();
    const { addToast } = useToast();

    if (!user) {
        return <div className="text-center p-10">Please log in to view settings.</div>;
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <UserCircleIcon className="w-5 h-5" /> },
        { id: 'appearance', label: 'Appearance', icon: <PaletteIcon className="w-5 h-5" /> },
        { id: 'accessibility', label: 'Accessibility', icon: <AccessibilityIcon className="w-5 h-5" /> },
        { id: 'preferences', label: 'Preferences', icon: <ListBulletIcon className="w-5 h-5" /> },
        { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
        { id: 'subscription', label: 'Subscription', icon: <StarIcon className="w-5 h-5" /> },
        { id: 'privacy', label: 'Privacy', icon: <ShieldCheckIcon className="w-5 h-5" /> },
        { id: 'security', label: 'Security', icon: <ShieldExclamationIcon className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings user={user} updateProfile={updateProfile} addToast={addToast} />;
            case 'appearance':
                return <AppearanceSettings />;
            case 'accessibility':
                return <AccessibilitySettings user={user} onUpgradeClick={onUpgradeClick} />;
            case 'preferences':
                return <PreferencesSettings />;
            case 'notifications':
                return <NotificationSettings />;
            case 'subscription':
                return <SubscriptionSettings user={user} onUpgradeClick={onUpgradeClick} />;
            case 'privacy':
                return <PrivacySettings user={user} clearSearchHistory={clearSearchHistory} addToast={addToast} />;
            case 'security':
                return <SecuritySettings user={user} toggleTwoFactor={toggleTwoFactor} addToast={addToast} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <nav className="flex flex-col space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="md:w-3/4 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
