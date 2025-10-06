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
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { PaletteIcon } from '../components/icons/PaletteIcon';
import { AccessibilityIcon } from '../components/icons/AccessibilityIcon';
import { BellIcon } from '../components/icons/BellIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { StarIcon } from '../components/icons/StarIcon';

interface SettingsPageProps {
    user: User | null;
    onBack: () => void;
    updateProfile: (profileData: Partial<Pick<User, 'name' | 'avatar' | 'bio'>>) => void;
    onUpgradeClick: () => void;
}

type SettingsTab = 'profile' | 'appearance' | 'accessibility' | 'notifications' | 'privacy' | 'subscription';

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBack, updateProfile, onUpgradeClick }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const { addToast } = useToast();

    if (!user) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold">Please log in to view settings.</h1>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md">Go Back</button>
            </div>
        );
    }
    
    const navItems = [
        { id: 'profile', label: 'Profile', icon: <UserCircleIcon className="w-5 h-5" /> },
        { id: 'appearance', label: 'Appearance', icon: <PaletteIcon className="w-5 h-5" /> },
        { id: 'accessibility', label: 'Accessibility', icon: <AccessibilityIcon className="w-5 h-5" /> },
        { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
        { id: 'privacy', label: 'Privacy', icon: <ShieldCheckIcon className="w-5 h-5" /> },
        { id: 'subscription', label: 'Subscription', icon: <StarIcon className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings user={user} updateProfile={updateProfile} addToast={addToast} />;
            case 'appearance':
                return <AppearanceSettings />;
            case 'accessibility':
                return <AccessibilitySettings user={user} onUpgradeClick={onUpgradeClick} />;
            case 'notifications':
                return <NotificationSettings />;
            case 'privacy':
                return <PrivacySettings addToast={addToast} />;
            case 'subscription':
                return <SubscriptionSettings user={user} onUpgradeClick={onUpgradeClick} />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
             <button onClick={onBack} className="flex items-center space-x-2 text-yellow-500 hover:underline mb-6 font-semibold">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to News</span>
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row min-h-[calc(100vh-200px)]">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 bg-gray-50 dark:bg-gray-800/50 p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Settings</h2>
                        <nav className="flex flex-row md:flex-col gap-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as SettingsTab)}
                                    className={`flex items-center w-full text-left space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === item.id 
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' 
                                            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="hidden md:inline">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>
                    {/* Main Content */}
                    <main className="flex-1 p-6 sm:p-8">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
