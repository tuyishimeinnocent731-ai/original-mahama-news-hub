
import React, { useState } from 'react';
import { User } from '../../types';
import * as userService from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import ToggleSwitch from '../ToggleSwitch';
import { DeviceMobileIcon } from '../icons/DeviceMobileIcon';
import { DesktopComputerIcon } from '../icons/DesktopComputerIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { GlobeAltIcon } from '../icons/GlobeAltIcon';

interface SecuritySettingsProps {
    user: User;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { addToast } = useToast();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            addToast("New passwords do not match.", 'error');
            return;
        }
        try {
            const result = await userService.changePassword(currentPassword, newPassword);
            addToast(result.message, 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            addToast(error.message, 'error');
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-2xl font-bold mb-2">Sign In & Security</h3>
                <p className="text-muted-foreground mb-6">Manage your password and account security settings.</p>
                
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                     <div>
                        <label htmlFor="current-password" className="block text-sm font-medium">Current Password</label>
                        <input type="password" id="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="new-password" className="block text-sm font-medium">New Password</label>
                        <input type="password" id="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium">Confirm New Password</label>
                        <input type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                    <div className="text-right">
                        <button type="submit" className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold">
                            Change Password
                        </button>
                    </div>
                </form>
            </div>

            <div className="border-t pt-8">
                <h3 className="text-xl font-bold mb-2">Two-Factor Authentication</h3>
                <p className="text-muted-foreground mb-6 max-w-prose">Add an extra layer of security to your account. When you sign in, you'll need to provide a code that's sent to your device.</p>
                <div className="p-4 border border-border rounded-lg flex items-center justify-between max-w-md">
                    <div>
                        <label htmlFor="2fa" className="font-medium">Enable 2FA</label>
                        <p className="text-xs text-muted-foreground">Status: <span className="font-semibold text-destructive">Disabled</span></p>
                    </div>
                    <ToggleSwitch id="2fa" checked={user.two_factor_enabled || false} onChange={() => addToast('2FA is not yet implemented.', 'info')} />
                </div>
            </div>

             <div className="border-t pt-8">
                <h3 className="text-xl font-bold mb-2">Login Sessions</h3>
                <p className="text-muted-foreground mb-6">These are the devices that have logged into your account. Revoke any sessions that you do not recognize.</p>
                <div className="space-y-3">
                    {/* This would be dynamically rendered from backend data */}
                    <div className="p-3 border border-border rounded-lg flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <DesktopComputerIcon className="w-8 h-8 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Chrome on macOS</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><GlobeAltIcon className="w-4 h-4" /> 123.45.67.89</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-green-600">Active now</p>
                            <button className="text-xs text-destructive hover:underline">Revoke</button>
                        </div>
                    </div>
                     <div className="p-3 border border-border rounded-lg flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <DeviceMobileIcon className="w-8 h-8 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Safari on iOS</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><ClockIcon className="w-4 h-4" /> 2 days ago</p>
                            </div>
                        </div>
                        <button className="text-xs text-destructive hover:underline">Revoke</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
