




import React, { useState } from 'react';
import { User } from '../../types';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { LockIcon } from '../icons/LockIcon';
import { DeviceMobileIcon } from '../icons/DeviceMobileIcon';
import { DesktopComputerIcon } from '../icons/DesktopComputerIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';
import { GlobeAltIcon } from '../icons/GlobeAltIcon';
import ToggleSwitch from '../ToggleSwitch';
import Modal from '../Modal';

interface SecuritySettingsProps {
    user: User;
    toggleTwoFactor: (enabled: boolean) => void;
    addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const TwoFactorModal: React.FC<{onClose: () => void}> = ({ onClose }) => (
    <Modal isOpen={true} onClose={onClose} title="Set Up Two-Factor Authentication">
        <div className="p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">Scan this QR code with your authenticator app</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Use an app like Google Authenticator or Authy to scan the code.
            </p>
            <div className="bg-white p-4 inline-block rounded-lg">
                {/* Mock QR Code */}
                <svg width="160" height="160" viewBox="0 0 100 100" className="mx-auto">
                    <path fill="#000" d="M0 0h20v20H0z M80 0h20v20H80z M0 80h20v20H0z M25 0h10v10H25z M45 0h10v10H45z M65 0h10v10H65z M0 25h10v10H0z M0 45h10v10H0z M0 65h10v10H0z M90 25h10v10H90z M90 45h10v10H90z M90 65h10v10H90z M25 90h10v10H25z M45 90h10v10H45z M65 90h10v10H65z M25 25h50v50H25z M30 30v40h40V30H30z"/>
                </svg>
            </div>
             <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                <h4 className="font-semibold mb-2">Or enter this code manually:</h4>
                <p className="font-mono tracking-widest text-lg">ABCD EFGH IJKL MNOP</p>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-md text-sm text-left">
                <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Recovery Codes</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Save these codes in a safe place. They can be used to regain access to your account if you lose your device.</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 font-mono text-sm">
                    <span>1. 1234-5678</span>
                    <span>2. 9876-5432</span>
                    <span>3. ABCD-EFGH</span>
                    <span>4. IJKL-MNOP</span>
                </div>
            </div>
            <button onClick={onClose} className="mt-6 w-full px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600">
                Done
            </button>
        </div>
    </Modal>
);

const PasswordInputField: React.FC<{id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ id, label, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="relative mt-1">
                <input 
                    type={showPassword ? 'text' : 'password'} 
                    id={id} 
                    value={value} 
                    onChange={onChange}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
};

const loginHistory = [
    { device: 'Chrome on Windows', location: 'New York, US', time: 'June 20, 2024 at 8:15 PM', icon: <DesktopComputerIcon className="w-6 h-6"/>, current: true },
    { device: 'iPhone App', location: 'New York, US', time: 'June 18, 2024 at 10:30 AM', icon: <DeviceMobileIcon className="w-6 h-6"/> },
    { device: 'Safari on macOS', location: 'Boston, US', time: 'June 15, 2024 at 5:00 PM', icon: <DesktopComputerIcon className="w-6 h-6"/> },
];


const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user, toggleTwoFactor, addToast, changePassword }) => {
    const [is2FAModalOpen, set2FAModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required.');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        setIsChangingPassword(true);
        
        const success = await changePassword(currentPassword, newPassword);
        if (success) {
            addToast('Password changed successfully!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        
        setIsChangingPassword(false);
    };

    const handle2FAToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const enabled = e.target.checked;
        if (enabled) {
            set2FAModalOpen(true);
        }
        toggleTwoFactor(enabled);
        if (!enabled) {
            addToast('Two-Factor Authentication disabled.', 'info');
        }
    };

    const handle2FAModalClose = () => {
        set2FAModalOpen(false);
        addToast('Two-Factor Authentication enabled!', 'success');
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Sign In & Security</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your password, two-factor authentication, and signed-in devices.</p>
            
            <div className="space-y-8">
                <form onSubmit={handlePasswordSubmit} className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                        <LockIcon className="w-5 h-5 text-gray-500" />
                        <h4 className="font-semibold text-lg">Change Password</h4>
                    </div>
                    <div className="space-y-4">
                        <PasswordInputField id="current-password" label="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                        <PasswordInputField id="new-password" label="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        <PasswordInputField id="confirm-password" label="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                        <div className="text-right pt-2">
                             <button type="submit" disabled={isChangingPassword} className="px-5 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold disabled:bg-yellow-300 disabled:cursor-not-allowed">
                                {isChangingPassword ? 'Saving...' : 'Save Password'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <ShieldCheckIcon className="w-5 h-5 text-gray-500" />
                                <h4 className="font-semibold">Two-Factor Authentication</h4>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">Add an extra layer of security to your account.</p>
                        </div>
                        <ToggleSwitch id="2fa" checked={user.twoFactorEnabled} onChange={handle2FAToggle} />
                    </div>
                </div>
                
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                        <h4 className="text-lg font-semibold">Login History</h4>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Review recent sign-ins to your account.</p>
                    <ul className="space-y-3">
                        {loginHistory.map((item, index) => (
                             <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                                <div className="flex items-center space-x-3">
                                    {item.icon}
                                    <div>
                                        <p className="font-semibold">{item.device}</p>
                                        <p className="text-xs text-gray-500">{item.location} - {item.time}</p>
                                    </div>
                                </div>
                                {item.current ? (
                                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2 sm:mt-0">Current session</span>
                                ) : (
                                    <button className="text-sm text-red-600 hover:underline mt-2 sm:mt-0 self-start sm:self-center">Not you? Secure account</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {is2FAModalOpen && <TwoFactorModal onClose={handle2FAModalClose} />}
        </div>
    );
};

export default SecuritySettings;