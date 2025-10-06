import React, { useState } from 'react';
import { User, IntegrationId } from '../types';
import ProfileSettings from '../components/settings/ProfileSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import AccessibilitySettings from '../components/settings/AccessibilitySettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SubscriptionSettings from '../components/settings/SubscriptionSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import IntegrationsSettings from '../components/settings/IntegrationsSettings';
import { useToast } from '../contexts/ToastContext';

import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { PaletteIcon } from '../components/icons/PaletteIcon';
import { AccessibilityIcon } from '../components/icons/AccessibilityIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { BellIcon } from '../components/icons/BellIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { LinkIcon } from '../components/icons/LinkIcon';
import { LockIcon } from '../components/icons/LockIcon';


type SettingsTab = 'profile' | 'appearance' | 'accessibility' | 'security' | 'notifications' | 'subscription' | 'privacy' | 'integrations';

interface SettingsPageProps {
    user: User;
    onUpgradeClick: () => void;
    clearSearchHistory: () => void;
    updateProfile: (profileData: Partial<Pick<User, 'name' | 'bio'>>) => void;
    toggleTwoFactor: (enabled: boolean) => void;
    validatePassword: (password: string) => Promise<boolean>;
    changePassword: (newPassword: string) => Promise<boolean>;
    toggleIntegration: (integrationId: IntegrationId) => void;
    onMyAdsClick: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const { addToast } = useToast();

    const menuItems = [
        { id: 'profile', label: 'Profile & Account', icon: <UserCircleIcon className="w-5 h-5" /> },
        { id: 'appearance', label: 'Appearance', icon: <PaletteIcon className="w-5 h-5" /> },
        { id: 'accessibility', label: 'Accessibility', icon: <AccessibilityIcon className="w-5 h-5" /> },
        { id: 'security', label: 'Sign In & Security', icon: <ShieldCheckIcon className="w-5 h-5" /> },
        { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
        { id: 'subscription', label: 'Subscription', icon: <StarIcon className="w-5 h-5" /> },
        { id: 'privacy', label: 'Privacy & Data', icon: <LockIcon className="w-5 h-5" /> },
        { id: 'integrations', label: 'Integrations', icon: <LinkIcon className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings user={props.user} updateProfile={props.updateProfile} addToast={addToast} />;
            case 'appearance':
                return <AppearanceSettings />;
            case 'accessibility':
                return <AccessibilitySettings user={props.user} onUpgradeClick={props.onUpgradeClick} />;
            case 'security':
                return <SecuritySettings user={props.user} toggleTwoFactor={props.toggleTwoFactor} addToast={addToast} validatePassword={props.validatePassword} changePassword={props.changePassword} />;
            case 'notifications':
                return <NotificationSettings />;
            case 'subscription':
                return <SubscriptionSettings user={props.user} onUpgradeClick={props.onUpgradeClick} />;
            case 'privacy':
                return <PrivacySettings user={props.user} clearSearchHistory={props.clearSearchHistory} addToast={addToast} />;
            case 'integrations':
                return <IntegrationsSettings user={props.user} toggleIntegration={props.toggleIntegration} addToast={addToast} />;
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                <aside className="md:w-1/4 lg:w-1/5">
                    <nav className="flex flex-col space-y-2">
                        {menuItems.map(item => (
                             <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as SettingsTab)}
                                className={`flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors w-full text-left ${
                                    activeTab === item.id 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                               {item.icon}
                               <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
