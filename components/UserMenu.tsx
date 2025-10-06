import React, { useState, useEffect, useRef } from 'react';
import { UserIcon } from './icons/UserIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface UserMenuProps {
    userEmail: string;
    onLogout: () => void;
    onSettingsClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ userEmail, onLogout, onSettingsClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSettings = () => {
        onSettingsClick();
        setIsOpen(false);
    };

    const handleLogout = () => {
        onLogout();
        setIsOpen(false);
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-700 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
                aria-label="User menu"
                aria-haspopup="true"
            >
                <UserIcon className="h-6 w-6" />
            </button>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20" role="menu" aria-orientation="vertical">
                    <div className="py-1" role="none">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                             <p className="text-sm text-gray-700 dark:text-gray-300">Signed in as</p>
                             <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userEmail}</p>
                        </div>
                        <button onClick={handleSettings} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                            <SettingsIcon />
                            <span className="ml-3">Settings</span>
                        </button>
                        <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                            <LogoutIcon />
                            <span className="ml-3">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
