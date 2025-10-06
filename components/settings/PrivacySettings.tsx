import React from 'react';
import { useToast } from '../../contexts/ToastContext';

interface PrivacySettingsProps {
    addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}


const PrivacySettings: React.FC<PrivacySettingsProps> = ({ addToast }) => {

    const handleDownloadData = () => {
        addToast("We've received your request. Your data will be sent to your email shortly.", "info");
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
            addToast("Your account has been scheduled for deletion.", "success");
            // In a real app, you would redirect or log the user out here.
        }
    };
    
    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Privacy</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your data and account privacy settings.</p>
            <div className="space-y-6">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-semibold text-lg mb-2">Download Your Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        You can request an export of your personal data, including your saved articles and preferences.
                    </p>
                    <button onClick={handleDownloadData} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                        Request Data Export
                    </button>
                </div>
                <div className="p-4 border border-red-300 dark:border-red-500/50 rounded-lg">
                    <h4 className="font-semibold text-lg text-red-700 dark:text-red-400 mb-2">Delete Your Account</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
