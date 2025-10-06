import React from 'react';
import SearchBar from './SearchBar';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LoginIcon } from './icons/LoginIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
    onSearch: (query: string) => void;
    onLogoClick: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onLogoClick, theme, toggleTheme, isLoggedIn, onLoginClick, onLogoutClick, onSettingsClick }) => {
    return (
        <header className="bg-gray-900 text-white sticky top-0 z-50">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <button onClick={onLogoClick} className="flex-shrink-0 flex items-center space-x-3" aria-label="Home">
                           <div className="bg-gray-800 p-2 rounded-md">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto text-yellow-400">
                               <path d="M4 20V4H8L12 12L16 4H20V20H17V8L13 16H11L7 8V20H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                             </svg>
                           </div>
                           <div className="flex flex-col items-start leading-none">
                            <span className="text-xl font-bold tracking-wider">MAHAMA</span>
                            <span className="text-xs font-semibold tracking-widest text-gray-300">NEWS TV</span>
                           </div>
                        </button>
                    </div>
                    <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
                        <SearchBar onSearch={onSearch} />
                    </div>
                     <div className="flex items-center space-x-4 ml-4">
                        <button onClick={toggleTheme} aria-label="Toggle dark mode" className="p-2 rounded-full hover:bg-gray-700">
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <button onClick={onSettingsClick} aria-label="Settings" className="p-2 rounded-full hover:bg-gray-700">
                            <SettingsIcon />
                        </button>
                         {isLoggedIn ? (
                            <button onClick={onLogoutClick} aria-label="Logout" className="p-2 rounded-full hover:bg-gray-700">
                                <LogoutIcon />
                            </button>
                         ) : (
                            <button onClick={onLoginClick} aria-label="Login" className="p-2 rounded-full hover:bg-gray-700">
                                <LoginIcon />
                            </button>
                         )}
                    </div>
                </div>
                <nav className="bg-gray-800 -mx-4 sm:-mx-6 lg:-mx-8">
                    <div className="max-w-screen-xl mx-auto px-2 sm:px-6 lg:px-8">
                        <div className="relative flex items-center justify-between h-10">
                            <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto">
                                <a href="#" onClick={(e) => { e.preventDefault(); onLogoClick(); }} className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-yellow-400">Home</a>
                                <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">World</a>
                                <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Politics</a>
                                <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Business</a>
                                <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Economy</a>
                                <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Technology</a>
                                <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Sport</a>
                                <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">History</a>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;