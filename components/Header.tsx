import React, { useState } from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { LoginIcon } from './icons/LoginIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { MenuIcon } from './icons/MenuIcon';
import { NAV_LINKS } from '../constants';
import { NavLink as NavLinkType } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { TranslateIcon } from './icons/TranslateIcon';
import SearchOverlay from './SearchOverlay';

interface HeaderProps {
  onSearch: (query: string) => void;
  onNavClick: (category: string) => void;
  onAuthClick: () => void;
  onMobileMenuClick: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const NavLink: React.FC<{ link: NavLinkType, onNavClick: (category: string) => void }> = ({ link, onNavClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <a
                href={link.href}
                onClick={(e) => {e.preventDefault(); onNavClick(link.name);}}
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
                {link.name}
                {link.sublinks && (
                    <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                )}
            </a>
            {link.sublinks && isOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {link.sublinks.map(sublink => (
                            <a
                                key={sublink.name}
                                href={sublink.href}
                                onClick={(e) => {e.preventDefault(); onNavClick(sublink.name); setIsOpen(false);}}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                role="menuitem"
                            >
                                {sublink.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ onSearch, onNavClick, onAuthClick, onMobileMenuClick, isLoggedIn, onLogout }) => {
  const [isSearchOpen, setSearchOpen] = useState(false);
  
  const handleSearchSubmit = (query: string) => {
    onSearch(query);
    setSearchOpen(false);
  };

  return (
    <>
    <header className="bg-blue-900 dark:bg-gray-900 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="#" onClick={(e) => {e.preventDefault(); onNavClick('home');}} className="flex-shrink-0 text-white text-2xl font-bold tracking-wider">
              Mahama News TV
            </a>
            <nav className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-1">
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.name} link={link} onNavClick={onNavClick} />
                ))}
              </div>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setSearchOpen(true)} aria-label="Open search" className="p-2 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <SearchIcon />
            </button>
             <button onClick={() => alert('Translation feature coming soon!')} aria-label="Select language" className="p-2 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <TranslateIcon />
            </button>
             <a href="#/settings" aria-label="Open settings" className="p-2 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <SettingsIcon />
            </a>
            {isLoggedIn ? (
                <button onClick={onLogout} aria-label="Logout" className="p-2 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <LogoutIcon />
                </button>
            ) : (
                <button onClick={onAuthClick} aria-label="Login" className="p-2 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <LoginIcon />
                </button>
            )}
             <div className="md:hidden">
                <button onClick={onMobileMenuClick} aria-label="Open menu" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                    <MenuIcon />
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    <SearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearchSubmit}
    />
    </>
  );
};

export default Header;
