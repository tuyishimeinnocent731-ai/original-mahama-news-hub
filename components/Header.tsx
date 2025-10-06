import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '../constants';
import { NavLink as NavLinkType, Article, User } from '../types';
import * as newsService from '../services/newsService';
import { SearchIcon } from './icons/SearchIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LoginIcon } from './icons/LoginIcon';
import { CommandIcon } from './icons/CommandIcon';
import { MenuIcon } from './icons/MenuIcon';
import MobileMenu from './MobileMenu';
import FeaturedArticleCard from './FeaturedArticleCard';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './icons/SocialIcons';
import UserMenu from './UserMenu';


interface HeaderProps {
    onSearchClick: () => void;
    onSettingsClick: () => void;
    onLoginClick: () => void;
    onCommandPaletteClick: () => void;
    onCategorySelect: (category: string) => void;
    isLoggedIn: boolean;
    user: User | null;
    onLogout: () => void;
    onArticleClick: (article: Article) => void;
    onHomeClick: () => void;
    onSavedClick: () => void;
    onPremiumClick: () => void;
}

const NavLink: React.FC<{ link: NavLinkType, onCategorySelect: (category: string) => void, onArticleClick: (article: Article) => void }> = ({ link, onCategorySelect, onArticleClick }) => {
    const featuredArticle = link.sublinks ? newsService.getFeaturedArticleForCategory(link.name) : null;

    return (
        <div className="relative group h-full flex items-center">
            <button onClick={() => onCategorySelect(link.name)} className="text-white hover:text-yellow-300 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                {link.name}
                {link.sublinks && (
                    <ChevronDownIcon className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" />
                )}
            </button>
            {link.sublinks && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-screen max-w-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                    <div className="rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
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
                               {featuredArticle && <FeaturedArticleCard article={featuredArticle} onArticleClick={onArticleClick} />}
                            </div>
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
    user,
    onLogout,
    onArticleClick,
    onHomeClick,
    onSavedClick,
    onPremiumClick
}) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
    }, []);

    return (
        <header className="bg-blue-800 dark:bg-gray-900 shadow-md sticky top-0 z-40">
             {/* Top Bar */}
            <div className="bg-blue-900 dark:bg-gray-900/50 hidden lg:block">
                <div className="container mx-auto px-4 h-10 flex items-center justify-between text-xs text-blue-200">
                    <div>
                        <span>{currentDate}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <a href="#" className="hover:text-white transition-colors" aria-label="Facebook"><FacebookIcon className="w-5 h-5"/></a>
                        <a href="#" className="hover:text-white transition-colors" aria-label="Twitter"><TwitterIcon className="w-5 h-5"/></a>
                        <a href="#" className="hover:text-white transition-colors" aria-label="Instagram"><InstagramIcon className="w-5 h-5"/></a>
                    </div>
                </div>
            </div>
            
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button className="lg:hidden text-white mr-4" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                            <MenuIcon />
                        </button>
                        <button onClick={onHomeClick} className="text-2xl font-bold text-yellow-400">Mahama News Hub</button>
                    </div>
                    <nav className="hidden lg:flex items-center space-x-1 h-full">
                        {NAV_LINKS.map(link => <NavLink key={link.name} link={link} onCategorySelect={onCategorySelect} onArticleClick={onArticleClick} />)}
                    </nav>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button onClick={onSearchClick} className="text-white hover:text-yellow-300" aria-label="Search"><SearchIcon /></button>
                        <button onClick={onCommandPaletteClick} className="text-white hover:text-yellow-300 hidden md:block" aria-label="Open command palette"><CommandIcon /></button>
                        <button onClick={onSettingsClick} className="text-white hover:text-yellow-300" aria-label="Settings"><SettingsIcon /></button>
                        
                        <div className="w-px h-6 bg-blue-700 dark:bg-gray-700 hidden sm:block"></div>

                        {isLoggedIn && user ? (
                            <UserMenu 
                                user={user}
                                onLogout={onLogout}
                                onSettingsClick={onSettingsClick}
                                onSavedClick={onSavedClick}
                                onPremiumClick={onPremiumClick}
                            />
                        ) : (
                             <button onClick={onLoginClick} className="flex items-center space-x-2 text-white hover:text-yellow-300" aria-label="Login">
                                 <LoginIcon />
                                 <span className="hidden lg:inline text-sm font-medium">Login</span>
                             </button>
                        )}
                    </div>
                </div>
            </div>
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onCategorySelect={onCategorySelect} />
        </header>
    );
};

export default Header;