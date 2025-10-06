
import React, { useState } from 'react';
import { NAV_LINKS } from '../constants';
import { User, SubscriptionPlan, NavLink } from '../types';
import { useSettings } from '../hooks/useSettings';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LoginIcon } from './icons/LoginIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { SearchIcon } from './icons/SearchIcon';
import { MenuIcon } from './icons/MenuIcon';
import { CommandIcon } from './icons/CommandIcon';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  user: User | null;
  subscriptionPlan: SubscriptionPlan;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onSettingsClick: () => void;
  onUpgradeClick: () => void;
  onSearchClick: () => void;
  onCommandPaletteClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, subscriptionPlan, onLoginClick, onLogoutClick, onSettingsClick, onUpgradeClick, onSearchClick, onCommandPaletteClick }) => {
  const { settings, updateSettings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };
  
  const NavItem: React.FC<{link: NavLink}> = ({ link }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (link.sublinks) {
        return (
            <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
                <button className="text-white hover:text-yellow-300 transition-colors duration-200 flex items-center">
                    {link.name}
                    <svg className={`w-4 h-4 ml-1 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20">
                        {link.sublinks.map(sublink => (
                            <a key={sublink.name} href={sublink.href} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{sublink.name}</a>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return <a href={link.href} className="text-white hover:text-yellow-300 transition-colors duration-200">{link.name}</a>
  }

  return (
    <header className="bg-blue-800 dark:bg-gray-900 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex justify-between items-center py-2 border-b border-blue-700 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-yellow-400">
                <a href="/">Gemini News</a>
            </h1>
            <div className="flex items-center space-x-3">
                <button onClick={onSearchClick} className="text-white hover:text-yellow-300" aria-label="Search">
                    <SearchIcon />
                </button>
                 <button onClick={onCommandPaletteClick} className="text-white hover:text-yellow-300 hidden md:block" aria-label="Open command palette">
                    <CommandIcon />
                </button>
                <button onClick={toggleTheme} className="text-white hover:text-yellow-300" aria-label="Toggle theme">
                    {settings.theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
                {user ? (
                    <div className="relative group">
                        <button className="flex items-center space-x-2 text-white hover:text-yellow-300">
                            <span className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center font-bold">{user.email.charAt(0).toUpperCase()}</span>
                            <span className="hidden md:inline">{user.email}</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                            <button onClick={onSettingsClick} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <SettingsIcon /> <span>Settings</span>
                            </button>
                            <button onClick={onLogoutClick} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <LogoutIcon /> <span>Logout</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={onLoginClick} className="text-white hover:text-yellow-300 flex items-center space-x-2" aria-label="Login">
                        <LoginIcon />
                        <span className="hidden md:inline">Login</span>
                    </button>
                )}
                 <div className="lg:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-white hover:text-yellow-300" aria-label="Open menu">
                        <MenuIcon />
                    </button>
                </div>
            </div>
        </div>
        
        {/* Bottom bar with navigation */}
        <div className="hidden lg:flex justify-between items-center py-3">
            <nav className="flex space-x-6 font-semibold">
                {NAV_LINKS.map(link => <NavItem key={link.name} link={link} />)}
            </nav>
            {subscriptionPlan === 'free' && (
                <button onClick={onUpgradeClick} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Upgrade to Premium
                </button>
            )}
        </div>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
