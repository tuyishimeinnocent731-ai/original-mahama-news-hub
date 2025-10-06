import React, { useState } from 'react';
import { useSettings, Settings } from '../hooks/useSettings';
import { User, SubscriptionPlan } from '../types';
import { SUBSCRIPTION_PLANS } from '../constants';
import { UserIcon } from '../components/icons/UserIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';

interface SettingsPageProps {
    user: User;
    settings: Settings;
    onUpdateProfile: (profileData: Partial<Pick<User, 'name' | 'avatar'>>) => void;
    onUpdateSettings: (newSettings: Partial<Settings>) => void;
    onUpdateSubscription: (plan: SubscriptionPlan) => void;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, settings, onUpdateProfile, onUpdateSettings, onUpdateSubscription, addToast }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const { allCategories } = useSettings();

    const [profileName, setProfileName] = useState(user.name);
    const [subscribingPlan, setSubscribingPlan] = useState<SubscriptionPlan | null>(null);

    const handleProfileSave = () => {
        onUpdateProfile({ name: profileName });
        addToast('Profile updated successfully!', 'success');
    };

    const handleCategoryToggle = (category: string) => {
        const currentCategories = settings.preferredCategories;
        const newCategories = currentCategories.includes(category)
            ? currentCategories.filter(c => c !== category)
            : [...currentCategories, category];
        onUpdateSettings({ preferredCategories: newCategories });
    };
    
    const handleNotificationToggle = (key: 'email' | 'push' | 'breakingNews') => {
        onUpdateSettings({
            notifications: {
                ...settings.notifications,
                [key]: !settings.notifications[key]
            }
        });
    };
    
    const handleSubscribeClick = (planId: SubscriptionPlan) => {
        setSubscribingPlan(planId);
        // Simulate network delay for better UX
        setTimeout(() => {
            onUpdateSubscription(planId);
            setSubscribingPlan(null);
            // The toast is fired from App.tsx after the state is updated.
        }, 1000);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <UserIcon /> },
        { id: 'preferences', label: 'Preferences', icon: <SettingsIcon /> },
        { id: 'subscription', label: 'Subscription', icon: <StarIcon /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Public Profile</h2>
                        <div className="flex items-center space-x-6 mb-8">
                            <img src={user.avatar} alt="User Avatar" className="w-24 h-24 rounded-full" />
                            <div>
                                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">Change Avatar</button>
                                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <input type="text" id="name" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="mt-1 block w-full md:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input type="email" id="email" value={user.email} disabled className="mt-1 block w-full md:w-1/2 bg-gray-200 border border-gray-300 text-gray-500 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t dark:border-gray-700">
                             <button onClick={handleProfileSave} className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600">Save Changes</button>
                        </div>
                    </div>
                );
            case 'preferences':
                 return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Content Preferences</h2>
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Theme</h3>
                                <div className="flex space-x-2">
                                    {(['light', 'dark', 'system'] as const).map(theme => (
                                        <button key={theme} onClick={() => onUpdateSettings({ theme })} className={`px-4 py-2 rounded-md text-sm ${settings.theme === theme ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Article Layout</h3>
                                <div className="flex space-x-2">
                                    {(['normal', 'compact'] as const).map(mode => (
                                        <button key={mode} onClick={() => onUpdateSettings({ layoutMode: mode })} className={`px-4 py-2 rounded-md text-sm ${settings.layoutMode === mode ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Font Size</h3>
                                <div className="flex space-x-2">
                                    {(['sm', 'base', 'lg'] as const).map(size => (
                                        <button key={size} onClick={() => onUpdateSettings({ fontSize: `text-${size}` as any })} className={`px-4 py-2 rounded-md text-sm ${settings.fontSize.includes(size) ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            {size === 'sm' ? 'Small' : size === 'base' ? 'Normal' : 'Large'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Favorite Categories</h3>
                                <div className="flex flex-wrap gap-2">
                                    {allCategories.map(category => (
                                        <button key={category} onClick={() => handleCategoryToggle(category)} className={`px-3 py-1.5 rounded-full text-xs transition-colors ${settings.preferredCategories.includes(category) ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Notifications</h3>
                                <div className="space-y-3">
                                    {Object.entries(settings.notifications).map(([key, value]) => (
                                         <label key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                            <span className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                            <button onClick={() => handleNotificationToggle(key as any)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'subscription':
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-6">My Subscription</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {SUBSCRIPTION_PLANS.map((plan) => (
                                <div key={plan.id} className={`border rounded-lg p-6 flex flex-col ${user.subscription === plan.id ? 'border-yellow-500 border-2' : 'border-gray-200 dark:border-gray-700'}`}>
                                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                    <p className="text-3xl font-bold mb-4">{plan.price}</p>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                 <svg className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                 <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button 
                                        onClick={() => handleSubscribeClick(plan.id)} 
                                        disabled={user.subscription === plan.id || subscribingPlan !== null} 
                                        className="w-full h-11 flex items-center justify-center py-2 rounded-lg font-semibold disabled:cursor-not-allowed transition-colors bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                                    >
                                        {subscribingPlan === plan.id ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : user.subscription === plan.id ? (
                                            <>
                                                <CheckCircleIcon className="w-5 h-5 mr-2" />
                                                Current Plan
                                            </>
                                        ) : (
                                            'Switch to this Plan'
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-8">Account Settings</h1>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                <aside className="lg:w-1/4">
                    <nav className="space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center space-x-3 text-left p-3 rounded-md transition-colors ${activeTab === tab.id ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            >
                                {tab.icon}
                                <span className="font-semibold">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="lg:w-3/4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;