
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSettings, Settings } from '../hooks/useSettings';
import { useToast } from '../contexts/ToastContext';

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { settings, updateSettings, allCategories } = useSettings();
  const { addToast } = useToast();

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    updateProfile({ [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Profile updated successfully!', 'success');
  };
  
  const handleSettingChange = (key: keyof Settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = settings.preferredCategories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    updateSettings({ preferredCategories: newCategories });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">Please log in to view settings.</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your public profile information.</p>
        </div>
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <img src={user.avatar} alt="User Avatar" className="h-20 w-20 rounded-full" />
              <div>
                <label htmlFor="avatar-upload" className="cursor-pointer px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                  Change
                </label>
                <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" />
                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" name="name" id="name" value={user.name} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
            </div>
            <div className="text-right">
              <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="my-12 border-t border-gray-200 dark:border-gray-700"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">Preferences</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your news reading experience.</p>
        </div>
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
          {/* Theme Setting from SettingsModal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
            <div className="mt-2 flex space-x-2">
                {(['light', 'dark', 'system'] as const).map(theme => (
                    <button key={theme} onClick={() => handleSettingChange('theme', theme)} className={`px-4 py-2 rounded-md text-sm ${settings.theme === theme ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                ))}
            </div>
          </div>

          {/* Font Size from SettingsModal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</label>
              <div className="mt-2 flex space-x-2">
                {(['sm', 'base', 'lg'] as const).map(size => (
                    <button key={size} onClick={() => handleSettingChange('fontSize', size)} className={`px-4 py-2 rounded-md text-sm ${settings.fontSize === size ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {size === 'sm' ? 'Small' : size === 'base' ? 'Normal' : 'Large'}
                    </button>
                ))}
            </div>
          </div>
          
          {/* Preferred Categories from SettingsModal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Categories</label>
            <div className="mt-2 flex flex-wrap gap-2">
                {allCategories.map(category => (
                    <button 
                        key={category} 
                        onClick={() => handleCategoryToggle(category)} 
                        className={`px-3 py-1.5 rounded-full text-xs ${settings.preferredCategories.includes(category) ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
