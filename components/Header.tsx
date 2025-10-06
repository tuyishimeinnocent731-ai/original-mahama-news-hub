import React, { useState } from 'react';
import { NAV_LINKS } from '../constants';
import { NavLink as NavLinkType } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LoginIcon } from './icons/LoginIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { CommandIcon } from './icons/CommandIcon';
import { MenuIcon } from './icons/MenuIcon';
import MobileMenu from './MobileMenu';

interface HeaderProps {
    onSearchClick: () => void;
    onSettingsClick: () => void;
    onLoginClick: () => void;
    onCommandPaletteClick: () => void;
    isLoggedIn: boolean;
    userEmail: string | null;
    onLogout: () => void;
}

const NavLink: React.FC<{ link: NavLinkType }> = ({ link }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <a href={link.href} className="text-white hover:text-yellow-300 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                {link.name}
                {link.sublinks && (
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                )}
            </a>
            {link.sublinks && isOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {link.sublinks.map(sublink => (
                            <a key={sublink.name} href={sublink.href} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                {sublink.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ 
    onSearchClick, 
    onSettingsClick, 
    onLoginClick,
    onCommandPaletteClick,
    isLoggedIn,
    userEmail,
    onLogout,
}) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-blue-800 dark:bg-gray-900 shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button className="lg:hidden text-white mr-4" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                            <MenuIcon />
                        </button>
                        <a href="/" className="text-2xl font-bold text-yellow-400">Mahama News Hub</a>
                    </div>
                    <nav className="hidden lg:flex items-center space-x-2">
                        {NAV_LINKS.map(link => <NavLink key={link.name} link={link} />)}
                    </nav>
                    <div className="flex items-center space-x-4">
                        <button onClick={onSearchClick} className="text-white hover:text-yellow-300" aria-label="Search"><SearchIcon /></button>
                        <button onClick={onCommandPaletteClick} className="text-white hover:text-yellow-300 hidden md:block" aria-label="Open command palette"><CommandIcon /></button>
                        <button onClick={onSettingsClick} className="text-white hover:text-yellow-300" aria-label="Settings"><SettingsIcon /></button>
                        {isLoggedIn ? (
                             <button onClick={onLogout} className="text-white hover:text-yellow-300" aria-label="Logout"><LogoutIcon /></button>
                        ) : (
                             <button onClick={onLoginClick} className="text-white hover:text-yellow-300" aria-label="Login"><LoginIcon /></button>
                        )}
                    </div>
                </div>
            </div>
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </header>
    );
};

export default Header;