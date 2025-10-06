import React, { useState } from 'react';
import { User } from '../../types';

interface ProfileSettingsProps {
    user: User;
    updateProfile: (profileData: Partial<Pick<User, 'name' | 'bio'>>) => void;
    addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, updateProfile, addToast }) => {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio || '');

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile({ name, bio });
        addToast('Profile updated successfully!', 'success');
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Profile Information</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Update your account's profile information and email address.</p>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <img src={user.avatar} alt="User Avatar" className="h-24 w-24 rounded-full" />
                    <div>
                        <label htmlFor="avatar-upload" className="cursor-pointer px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                            Change Avatar
                        </label>
                        <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" />
                        <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                    <textarea id="bio" name="bio" rows={3} value={bio} onChange={e => setBio(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" placeholder="Tell us a little about yourself..."></textarea>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
                </div>
                <div className="text-right pt-4">
                    <button type="submit" className="px-5 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;