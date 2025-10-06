import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Settings, Theme } from '../hooks/useSettings';
import { NEWS_CATEGORIES } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setTheme: (theme: Theme) => void;
  setPreferredCategories: (categories: string[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setTheme, setPreferredCategories }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(settings.theme);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(settings.preferredCategories);

  useEffect(() => {
    setCurrentTheme(settings.theme);
    setSelectedCategories(settings.preferredCategories);
  }, [settings, isOpen]);
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
        prev.includes(category) 
            ? prev.filter(c => c !== category) 
            : [...prev, category]
    );
  };

  const handleSave = () => {
    setTheme(currentTheme);
    setPreferredCategories(selectedCategories);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-8">
        {/* APPERANCE SETTINGS */}
        <div className="border-b dark:border-gray-600 pb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h4>
          <label htmlFor="theme" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Theme</label>
          <div className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button onClick={() => setCurrentTheme('light')} className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${currentTheme === 'light' ? 'bg-white text-gray-800 shadow' : 'text-gray-500 dark:text-gray-300'}`}>Light</button>
            <button onClick={() => setCurrentTheme('dark')} className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${currentTheme === 'dark' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 dark:text-gray-300'}`}>Dark</button>
            <button onClick={() => setCurrentTheme('system')} className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${currentTheme === 'system' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow' : 'text-gray-500 dark:text-gray-300'}`}>System</button>
          </div>
        </div>

        {/* CONTENT SETTINGS */}
        <div className="border-b dark:border-gray-600 pb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Preferences</h4>
          <label className="block mb-3 text-sm font-medium text-gray-900 dark:text-gray-300">Favorite Categories</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NEWS_CATEGORIES.map(category => (
                <button 
                    key={category} 
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${selectedCategories.includes(category) ? 'bg-yellow-500 border-yellow-500 text-white' : 'bg-transparent border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:border-yellow-400'}`}
                >
                    {category}
                </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Select categories to personalize your news feed.</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end pt-4">
            <button onClick={onClose} type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
            <button onClick={handleSave} type="button" className="ml-3 text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Save Settings</button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;