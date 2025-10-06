import React, { useState } from 'react';
import { useSettings, Settings } from '../hooks/useSettings';

type SettingsTab = 'profile' | 'appearance' | 'content' | 'account' | 'notifications';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, allCategories } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const handleUpdate = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    updateSettings({ [key]: value });
  };
  
  const handleCategoryToggle = (category: string) => {
    const preferredCategories = settings.preferredCategories.includes(category)
      ? settings.preferredCategories.filter(c => c !== category)
      : [...settings.preferredCategories, category];
    updateSettings({ preferredCategories });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
            <div className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input type="text" id="name" defaultValue="Demo User" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"/>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" id="email" defaultValue="user@example.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"/>
                </div>
            </div>
        );
      case 'appearance':
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Theme</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred interface theme.</p>
                    <div className="mt-4 flex space-x-4">
                        {(['light', 'dark', 'system'] as const).map(theme => (
                            <button key={theme} onClick={() => handleUpdate('theme', theme)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${settings.theme === theme ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-medium">Font Size</h3>
                     <div className="mt-4 flex space-x-4">
                        {(['sm', 'base', 'lg'] as const).map(size => (
                            <button key={size} onClick={() => handleUpdate('fontSize', size)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${settings.fontSize === size ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {size === 'sm' ? 'Small' : size === 'base' ? 'Medium' : 'Large'}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-medium">Content Density</h3>
                     <div className="mt-4 flex space-x-4">
                        {(['normal', 'compact'] as const).map(mode => (
                            <button key={mode} onClick={() => handleUpdate('layoutMode', mode)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${settings.layoutMode === mode ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
        case 'content':
        return (
            <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-medium mb-3">Preferred Categories</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose the topics you are most interested in to personalize your feed.</p>
                    <div className="flex flex-wrap gap-2">
                        {allCategories.map(category => (
                        <button
                            key={category}
                            onClick={() => handleCategoryToggle(category)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            settings.preferredCategories.includes(category)
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                        >
                            {category}
                        </button>
                        ))}
                    </div>
                </div>
            </div>
        );
      default:
        return <p>Coming soon...</p>;
    }
  };

  const tabs: { id: SettingsTab; label: string }[] = [
      { id: 'profile', label: 'Profile' },
      { id: 'appearance', label: 'Appearance' },
      { id: 'content', label: 'Content' },
      { id: 'account', label: 'Account' },
      { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[60vh]">
            <aside className="md:w-64 p-4 border-b md:border-r dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 px-2 hidden md:block">Settings</h2>
                <nav className="flex flex-row md:flex-col md:space-y-1 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 whitespace-nowrap">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 w-full text-left px-3 py-2 rounded-md text-sm font-medium mr-2 md:mr-0 ${activeTab === tab.id ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 p-6 md:p-8">
                 <h1 className="text-3xl font-bold mb-6 capitalize">{activeTab} Settings</h1>
                 {renderContent()}
            </main>
        </div>
    </div>
  );
};

export default SettingsPage;