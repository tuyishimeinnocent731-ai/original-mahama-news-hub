import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { User } from '../types';
import { NAV_LINKS } from '../constants';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SearchIcon } from './icons/SearchIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LoginIcon } from './icons/LoginIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { MenuIcon } from './icons/MenuIcon';
import MobileMenu from './MobileMenu';

interface HeaderProps {
    onSearchClick: () => void;
    onLoginClick: () => void;
    onSettingsClick: () => void;
    onPremiumClick: () => void;
    user: User | null;
    logout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchClick, onLoginClick, onSettingsClick, onPremiumClick, user, logout }) => {
    const { settings, updateSettings } = useSettings();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleTheme = () => {
        // Simple toggle between light and dark for the button click
        const currentThemeIsDark = document.documentElement.classList.contains('dark');
        updateSettings({ theme: currentThemeIsDark ? 'light' : 'dark' });
    };

    return (
        <header className="bg-blue-800 dark:bg-gray-900 text-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <a href="/" className="text-2xl font-bold text-yellow-400">Mahama News TV</a>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex lg:space-x-8">
                        {NAV_LINKS.map(link => (
                            <a key={link.name} href={link.href} className="text-base font-medium hover:text-yellow-300 transition-colors">
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Right side icons */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700">
                             {document.documentElement.classList.contains('dark') ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <button onClick={onSearchClick} aria-label="Search" className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700">
                            <SearchIcon />
                        </button>
                        <button onClick={onSettingsClick} aria-label="Settings" className="hidden sm:block p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700">
                            <SettingsIcon />
                        </button>
                         {user ? (
                            <div className="flex items-center space-x-2">
                                <span className="hidden sm:block text-sm">{user.email}</span>
                                <button onClick={logout} aria-label="Logout" className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700">
                                    <LogoutIcon />
                                </button>
                            </div>
                        ) : (
                            <button onClick={onLoginClick} aria-label="Login" className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700">
                                <LoginIcon />
                            </button>
                        )}
                        <button onClick={onPremiumClick} className="hidden sm:block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                            Go Premium
                        </button>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu" className="p-2 rounded-md hover:bg-blue-700 dark:hover:bg-gray-700">
                                <MenuIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </header>
    );
};

export default Header;
