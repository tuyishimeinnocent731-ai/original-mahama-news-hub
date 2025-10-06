
import React, { useState } from 'react';
import { User } from '../../types';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { LockIcon } from '../icons/LockIcon';
import { DeviceMobileIcon } from '../icons/DeviceMobileIcon';
import { DesktopComputerIcon } from '../icons/DesktopComputerIcon';
import ToggleSwitch from '../ToggleSwitch';
import Modal from '../Modal';

interface SecuritySettingsProps {
    user: User;
    toggleTwoFactor: (enabled: boolean) => void;
    addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
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

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user, toggleTwoFactor, addToast }) => {
    const [is2FAModalOpen, set2FAModalOpen] = useState(false);

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
            
            <div className="space-y-6">
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                        <LockIcon className="w-5 h-5 text-gray-500" />
                        <h4 className="font-semibold">Change Password</h4>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last changed on Jan 1, 2024</p>
                    <button className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                        Change Password
                    </button>
                </div>

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
                    <h4 className="text-lg font-semibold mb-2">Signed-in Devices</h4>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            <div className="flex items-center space-x-3">
                                <DesktopComputerIcon className="w-6 h-6"/>
                                <div>
                                    <p className="font-semibold">Chrome on Windows</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">Current session</p>
                                </div>
                            </div>
                            <button className="text-sm text-red-600 hover:underline">Sign out</button>
                        </li>
                        <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            <div className="flex items-center space-x-3">
                                <DeviceMobileIcon className="w-6 h-6"/>
                                <div>
                                    <p className="font-semibold">iPhone App</p>
                                    <p className="text-xs text-gray-500">New York, US - 2 days ago</p>
                                </div>
                            </div>
                             <button className="text-sm text-red-600 hover:underline">Sign out</button>
                        </li>
                    </ul>
                </div>
            </div>
            {is2FAModalOpen && <TwoFactorModal onClose={handle2FAModalClose} />}
        </div>
    );
};

export default SecuritySettings;
