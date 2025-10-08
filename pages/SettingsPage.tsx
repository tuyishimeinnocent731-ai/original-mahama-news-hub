
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
import BillingSettings from '../components/settings/BillingSettings';
import LayoutSettings from '../components/settings/LayoutSettings';
import DataSyncSettings from '../components/settings/DataSyncSettings';
import ReadingSettings from '../components/settings/ReadingSettings';
import MyAdsSettings from '../components/settings/MyAdsSettings';
import ActivityLogSettings from '../components/settings/ActivityLogSettings';
import { useToast } from '../contexts/ToastContext';

import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { PaletteIcon } from '../components/icons/PaletteIcon';
import { AccessibilityIcon } from '../components/icons/AccessibilityIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { BellIcon } from '../components/icons/BellIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { LinkIcon } from '../components/icons/LinkIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { BillingIcon } from '../components/icons/BillingIcon';
import { LayoutIcon } from '../components/icons/LayoutIcon';
import { DataSyncIcon } from '../components/icons/DataSyncIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { ActivityIcon } from '../components/icons/ActivityIcon';


type SettingsTab = 'profile' | 'appearance' | 'layout' | 'reading' | 'accessibility' | 'security' | 'notifications' | 'subscription' | 'billing' | 'privacy' | 'integrations' | 'dataSync' | 'myAds' | 'activityLog';

interface SettingsPageProps {
    user: User;
    onUpgradeClick: () => void;
    onManageAdsClick: () => void;
    clearSearchHistory: () => void;
    updateProfile: (profileData: Partial<Pick<User, 'name' | 'bio' | 'avatar' | 'socials'>>) => void;
    toggleTwoFactor: (enabled: boolean) => void;
    // FIX: Updated changePassword to accept current and new password. Removed redundant validatePassword.
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    toggleIntegration: (integrationId: IntegrationId) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const { addToast } = useToast();

    const menuItems = [
        { id: 'profile', label: 'Profile & Account', icon: <UserCircleIcon className="w-5 h-5" /> },
        { id: 'appearance', label: 'Appearance', icon: <PaletteIcon className="w-5 h-5" /> },
        { id: 'layout', label: 'Layout & Content', icon: <LayoutIcon className="w-5 h-5" /> },
        { id: 'reading', label: 'Reading Experience', icon: <BookOpenIcon className="w-5 h-5" /> },
        { id: 'accessibility', label: 'Accessibility', icon: <AccessibilityIcon className="w-5 h-5" /> },
        { id: 'security', label: 'Sign In & Security', icon: <ShieldCheckIcon className="w-5 h-5" /> },
        { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
        { id: 'subscription', label: 'Subscription', icon: <StarIcon className="w-5 h-5" /> },
        { id: 'billing', label: 'Billing', icon: <BillingIcon className="w-5 h-5" /> },
        { id: 'privacy', label: 'Privacy & Data', icon: <LockIcon className="w-5 h-5" /> },
        { id: 'integrations', label: 'Integrations', icon: <LinkIcon className="w-5 h-5" /> },
        { id: 'myAds', label: 'My Ads', icon: <MegaphoneIcon className="w-5 h-5" />, condition: props.user.subscription === 'pro' || props.user.role === 'admin' },
        { id: 'activityLog', label: 'Activity Log', icon: <ActivityIcon className="w-5 h-5" /> },
        { id: 'dataSync', label: 'Data & Sync', icon: <DataSyncIcon className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings user={props.user} updateProfile={props.updateProfile} addToast={addToast} />;
            case 'appearance':
                return <AppearanceSettings />;
            case 'layout':
                return <LayoutSettings />;
            case 'reading':
                return <ReadingSettings user={props.user} onUpgradeClick={props.onUpgradeClick} />;
            case 'accessibility':
                return <AccessibilitySettings user={props.user} onUpgradeClick={props.onUpgradeClick} />;
            case 'security':
                // FIX: Removed validatePassword prop as it's handled by changePassword.
                return <SecuritySettings user={props.user} toggleTwoFactor={props.toggleTwoFactor} addToast={addToast} changePassword={props.changePassword} />;
            case 'notifications':
                return <NotificationSettings />;
            case 'subscription':
                return <SubscriptionSettings user={props.user} onUpgradeClick={props.onUpgradeClick} />;
            case 'billing':
                return <BillingSettings user={props.user} />;
            case 'privacy':
                return <PrivacySettings user={props.user} clearSearchHistory={props.clearSearchHistory} addToast={addToast} />;
            case 'integrations':
                return <IntegrationsSettings user={props.user} toggleIntegration={props.toggleIntegration} addToast={addToast} />;
            case 'myAds':
                return <MyAdsSettings user={props.user} onManageAdsClick={props.onManageAdsClick} />;
            case 'activityLog':
                return <ActivityLogSettings user={props.user} />;
            case 'dataSync':
                return <DataSyncSettings user={props.user} />;
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
                        {menuItems.filter(item => item.condition !== false).map(item => (
                             <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as SettingsTab)}
                                className={`flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors w-full text-left ${
                                    activeTab === item.id 
                                    ? 'bg-accent/20 text-accent' 
                                    : 'hover:bg-secondary'
                                }`}
                            >
                               {item.icon}
                               <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1">
                    <div className="bg-card text-card-foreground rounded-lg shadow-xl p-6 sm:p-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
