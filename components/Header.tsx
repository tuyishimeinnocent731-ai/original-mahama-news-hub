import React, { useState } from 'react';
import { NAV_LINKS } from '../constants';
import { NavLink as NavLinkType, Article } from '../types';
import * as newsService from '../services/newsService';
import { SearchIcon } from './icons/SearchIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LoginIcon } from './icons/LoginIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { CommandIcon } from './icons/CommandIcon';
import { MenuIcon } from './icons/MenuIcon';
import MobileMenu from './MobileMenu';
import FeaturedArticleCard from './FeaturedArticleCard';
import { ChevronDownIcon } from './icons/ChevronDownIcon';


interface HeaderProps {
    onSearchClick: () => void;
    onSettingsClick: () => void;
    onLoginClick: () => void;
    onCommandPaletteClick: () => void;
    onCategorySelect: (category: string) => void;
    isLoggedIn: boolean;
    userEmail: string | null;
    onLogout: () => void;
}

const NavLink: React.FC<{ link: NavLinkType, onCategorySelect: (category: string) => void }> = ({ link, onCategorySelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const featuredArticle = link.sublinks ? newsService.getFeaturedArticleForCategory(link.name) : null;

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button onClick={() => onCategorySelect(link.name)} className="text-white hover:text-yellow-300 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                {link.name}
                {link.sublinks && (
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                )}
            </button>
            {link.sublinks && isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-screen max-w-md rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                    <div className="grid grid-cols-2 gap-4 p-4">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">{link.name}</h3>
                             <div className="flex flex-col space-y-1" role="menu" aria-orientation="vertical">
                                {link.sublinks.map(sublink => (
                                    <button key={sublink.name} onClick={() => onCategorySelect(sublink.name)} className="text-left px-2 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" role="menuitem">
                                        {sublink.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                           {featuredArticle && <FeaturedArticleCard article={featuredArticle} onArticleClick={() => { /* In-menu click could be handled differently if needed */ }} />}
                        </div>
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
    onCategorySelect,
    isLoggedIn,
    userEmail,
    onLogout,
}) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleHomeClick = () => {
        onCategorySelect('all');
    }

    return (
        <header className="bg-blue-800 dark:bg-gray-900 shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button className="lg:hidden text-white mr-4" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                            <MenuIcon />
                        </button>
                        <button onClick={handleHomeClick} className="text-2xl font-bold text-yellow-400">Mahama News Hub</button>
                    </div>
                    <nav className="hidden lg:flex items-center space-x-1">
                        {NAV_LINKS.map(link => <NavLink key={link.name} link={link} onCategorySelect={onCategorySelect} />)}
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
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onCategorySelect={onCategorySelect} />
        </header>
    );
};

export default Header;