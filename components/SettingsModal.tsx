import React, { useState } from 'react';
import Modal from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [region, setRegion] = useState('world');
  const [notifications, setNotifications] = useState(false);
  
  const handleSave = () => {
    // In a real app, you'd save these to localStorage or an API
    console.log({ region, notifications });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <label htmlFor="region" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Preferred News Region</label>
          <select 
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
          >
            <option value="world">World</option>
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="eu">Europe</option>
          </select>
        </div>
        <div className="flex items-center">
          <input 
            id="notifications-checkbox" 
            type="checkbox" 
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="notifications-checkbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Enable Notifications</label>
        </div>
        <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-600 rounded-b">
            <button onClick={onClose} type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
            <button onClick={handleSave} type="button" className="ml-3 text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Save Settings</button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
