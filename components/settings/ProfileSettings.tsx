import React, { useState } from 'react';
import { User } from '../../types';
import * as userService from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';

interface ProfileSettingsProps {
    user: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio || '');
    const [avatar, setAvatar] = useState(user.avatar);
    const [socials, setSocials] = useState(user.socials || { twitter: '', linkedin: '', github: '' });
    const { addToast } = useToast();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSocials(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.updateProfile({ name, bio, avatar, socials });
            addToast('Profile updated successfully!', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to update profile.', 'error');
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Profile Information</h3>
            <p className="text-muted-foreground mb-6">Update your account's profile information and email address.</p>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <img src={avatar} alt="User Avatar" className="h-24 w-24 rounded-full object-cover" />
                    <div>
                        <label htmlFor="avatar-upload" className="cursor-pointer px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-secondary">
                            Change Avatar
                        </label>
                        <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                        <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                    <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
                    <textarea id="bio" name="bio" rows={3} value={bio} onChange={e => setBio(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" placeholder="Tell us a little about yourself..."></textarea>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
                    <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 block w-full px-3 py-2 bg-secondary border border-border rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
                </div>

                <div className="border-t border-border pt-6">
                     <h4 className="text-lg font-semibold mb-1">Social Links</h4>
                     <p className="text-sm text-muted-foreground mb-4">Add your social media profiles to your account.</p>
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="twitter" className="block text-sm font-medium">Twitter</label>
                            <input type="text" name="twitter" id="twitter" value={socials.twitter} onChange={handleSocialChange} placeholder="https://twitter.com/username" className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="linkedin" className="block text-sm font-medium">LinkedIn</label>
                            <input type="text" name="linkedin" id="linkedin" value={socials.linkedin} onChange={handleSocialChange} placeholder="https://linkedin.com/in/username" className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                        </div>
                     </div>
                </div>

                <div className="text-right pt-4">
                    <button type="submit" className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;