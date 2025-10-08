import React, { useState, useEffect, useRef } from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { StarIcon } from './icons/StarIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { User, SubscriptionPlan } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';

interface UserMenuProps {
    user: User;
    onLogout: () => void;
    onSettingsClick: () => void;
    onSavedClick: () => void;
    onPremiumClick: () => void;
    onAdminClick: () => void;
    onSubAdminClick: () => void;
}

const SubscriptionBadge: React.FC<{ plan: SubscriptionPlan }> = ({ plan }) => {
    const planStyles = {
        free: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
        standard: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        premium: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        pro: 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${planStyles[plan]}`}>
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </span>
    );
};


const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onSettingsClick, onSavedClick, onPremiumClick, onAdminClick, onSubAdminClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    }
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-700 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
                aria-label="User menu"
                aria-haspopup="true"
            >
                <img src={user.avatar} alt="User avatar" className="h-10 w-10 rounded-full" />
            </button>
            
            <div 
                className={`origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20 transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} 
                role="menu" 
                aria-orientation="vertical"
            >
                <div className="py-1" role="none">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => handleAction(onSavedClick)} className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                        <NewspaperIcon />
                        <span className="ml-3">My Articles ({user.savedArticles.length})</span>
                    </button>
                    <button onClick={() => handleAction(onPremiumClick)} className="w-full text-left flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                        <div className="flex items-center">
                            <StarIcon />
                            <span className="ml-3">Subscription</span>
                        </div>
                        <SubscriptionBadge plan={user.subscription} />
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                     {(user.role === 'admin' || user.role === 'sub-admin') && (
                        <button onClick={() => handleAction(onAdminClick)} className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                            <ShieldCheckIcon />
                            <span className="ml-3">{user.role === 'admin' ? 'Full Admin Panel' : 'Management Panel'}</span>
                        </button>
                    )}
                    {user.role === 'admin' && (
                        <button onClick={() => handleAction(onSubAdminClick)} className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                            <UserGroupIcon className="w-5 h-5"/>
                            <span className="ml-3">Sub-Admin Management</span>
                        </button>
                    )}
                    <button onClick={() => handleAction(onSettingsClick)} className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                        <SettingsIcon />
                        <span className="ml-3">Profile & Settings</span>
                    </button>
                    <button onClick={() => handleAction(onLogout)} className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                        <LogoutIcon />
                        <span className="ml-3">Logout</span>
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default UserMenu;