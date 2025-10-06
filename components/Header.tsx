import React from 'react';
// FIX: Moved Article import from newsService to types, as it's defined in types.ts
import { NavLink, User, Article } from '../types';
import { NAV_LINKS } from '../constants';
import { SearchIcon } from './icons/SearchIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { MenuIcon } from './icons/MenuIcon';
import { useSettings } from '../hooks/useSettings';
import UserMenu from './UserMenu';
import FeaturedArticleCard from './FeaturedArticleCard';
import { getFeaturedArticleForCategory, getArticlesForMegaMenu } from '../services/newsService';
import { CommandIcon } from './icons/CommandIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface HeaderProps {
    user: User | null;
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onLogout: () => void;
    onSearchClick: () => void;
    onCommandPaletteClick: () => void;
    onTopStoriesClick: () => void;
    onSettingsClick: () => void;
    onSavedClick: () => void;
    onPremiumClick: () => void;
    onMyAdsClick: () => void;
    onAdminClick: () => void;
    onCategorySelect: (category: string) => void;
    onArticleClick: (article: Article) => void;
}

const Header: React.FC<HeaderProps> = (props) => {
    const { settings, updateSettings } = useSettings();
    const { onCategorySelect, onArticleClick } = props;

    const toggleTheme = () => {
        const newTheme = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
    };

    return (
        <header className="bg-blue-800 dark:bg-gray-900 text-white shadow-md sticky top-0 z-30">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3 border-b border-blue-700 dark:border-gray-700">
                    <button onClick={() => onCategorySelect('World')} className="text-xl font-bold text-yellow-400">
                        Mahama News Hub
                    </button>
                    <div className="flex items-center space-x-3">
                        <button onClick={props.onSearchClick} className="p-2 rounded-full hover:bg-blue-700" aria-label="Search">
                            <SearchIcon />
                        </button>
                         <button onClick={props.onCommandPaletteClick} className="hidden md:flex items-center space-x-2 p-2 rounded-md hover:bg-blue-700 text-sm" aria-label="Open command palette">
                            <CommandIcon />
                            <span className="hidden lg:inline">Cmd+K</span>
                        </button>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-blue-700" aria-label="Toggle theme">
                            {settings.theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>
                        {props.isLoggedIn && props.user ? (
                            <UserMenu 
                                user={props.user} 
                                onLogout={props.onLogout} 
                                onSettingsClick={props.onSettingsClick}
                                onSavedClick={props.onSavedClick}
                                onPremiumClick={props.onPremiumClick}
                                onMyAdsClick={props.onMyAdsClick}
                                onAdminClick={props.onAdminClick}
                            />
                        ) : (
                            <button onClick={props.onLoginClick} className="hidden sm:block px-4 py-2 text-sm font-semibold bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors">
                                Login
                            </button>
                        )}
                        <button onClick={props.onTopStoriesClick} className="lg:hidden p-2 rounded-full hover:bg-blue-700" aria-label="Open mobile menu">
                            <MenuIcon />
                        </button>
                    </div>
                </div>
                <nav className="hidden lg:flex justify-center items-center py-2 space-x-6">
                    {NAV_LINKS.map(link => (
                        <div key={link.name} className="group relative">
                             <button onClick={() => onCategorySelect(link.name)} className="px-3 py-2 text-sm font-semibold hover:text-yellow-300 transition-colors">
                                {link.name}
                            </button>
                            {link.sublinks && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block w-screen max-w-4xl">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 grid grid-cols-4 gap-6">
                                        <div className="col-span-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">{link.name}</h3>
                                            <ul className="space-y-2">
                                                {link.sublinks.map(sublink => (
                                                    <li key={sublink.name}>
                                                        <button onClick={() => onCategorySelect(sublink.name)} className="text-sm text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400">
                                                            {sublink.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="col-span-2 grid grid-cols-2 gap-4">
                                            {getArticlesForMegaMenu(link.name, 2).map(article => (
                                                <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer group/article">
                                                    <img src={article.urlToImage} alt={article.title} className="w-full h-24 object-cover rounded-md mb-2" />
                                                    <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-300 line-clamp-2 group-hover/article:text-yellow-600 dark:group-hover/article:text-yellow-400">{article.title}</h4>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-span-1">
                                            {getFeaturedArticleForCategory(link.name) && (
                                                <FeaturedArticleCard 
                                                    article={getFeaturedArticleForCategory(link.name)!} 
                                                    onArticleClick={onArticleClick}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                     <button onClick={props.onTopStoriesClick} className="flex items-center px-3 py-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">
                        <TrendingUpIcon className="w-5 h-5 mr-1" />
                        Top Stories
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;