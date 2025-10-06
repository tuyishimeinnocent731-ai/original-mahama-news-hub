
import React from 'react';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { LockIcon } from '../icons/LockIcon';
import { DeviceMobileIcon } from '../icons/DeviceMobileIcon';
import { DesktopComputerIcon } from '../icons/DesktopComputerIcon';

const SecuritySettings: React.FC = () => {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Sign In & Security</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your password, two-factor authentication, and signed-in devices.</p>
            
            <div className="space-y-6">
                {/* Change Password */}
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <LockIcon className="w-5 h-5 text-gray-500" />
                        <h4 className="font-semibold">Change Password</h4>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">It's a good idea to use a strong password that you're not using elsewhere.</p>
                    <button className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                        Change Password
                    </button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                         <ShieldCheckIcon className="w-5 h-5 text-gray-500" />
                        <h4 className="font-semibold">Two-Factor Authentication</h4>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Add an extra layer of security to your account. <span className="text-green-600 dark:text-green-400 font-semibold">Enabled</span></p>
                    <button className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                        Manage 2FA
                    </button>
                </div>
                
                {/* Signed-in Devices */}
                <div>
                    <h4 className="text-lg font-semibold mb-2">Signed-in Devices</h4>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                            <div className="flex items-center space-x-3">
                                <DesktopComputerIcon className="w-6 h-6"/>
                                <div>
                                    <p className="font-semibold">Chrome on Windows</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">Current session</p>
                                </div>
                            </div>
                            <button className="text-sm text-red-600 hover:underline">Sign out</button>
                        </li>
                        <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
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
        </div>
    );
};

export default SecuritySettings;
