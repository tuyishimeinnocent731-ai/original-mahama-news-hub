import React, { useState, useEffect } from 'react';
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
    onAdminClick: () => void;
    onCategorySelect: (category: string) => void;
    onArticleClick: (article: Article) => void;
    siteName: string;
}

const Header: React.FC<HeaderProps> = (props) => {
    const { settings, updateSettings } = useSettings();
    const { onCategorySelect, onArticleClick } = props;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(document.documentElement.classList.contains('dark'));
        const handler = () => setIsDark(document.documentElement.classList.contains('dark'));
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const toggleTheme = () => {
        const newIsDark = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', newIsDark);
        // This is a simplified toggle for the icon, useSettings handles the actual theme logic
    };

    return (
        <header className={`bg-primary text-primary-foreground shadow-md sticky top-0 z-30 transition-colors duration-300 ${isScrolled ? 'header-scrolled' : ''}`}>
            <div className="container mx-auto px-4">
                <div className={`flex justify-between items-center py-3 border-b border-primary/80 transition-colors duration-300 ${isScrolled ? 'border-transparent' : ''}`}>
                    <button onClick={() => onCategorySelect('World')} className="text-xl font-bold text-accent">
                        {props.siteName}
                    </button>
                    <div className="flex items-center space-x-3">
                        <button onClick={props.onSearchClick} className="p-2 rounded-full hover:bg-primary/80" aria-label="Search">
                            <SearchIcon />
                        </button>
                         <button onClick={props.onCommandPaletteClick} className="hidden md:flex items-center space-x-2 p-2 rounded-md hover:bg-primary/80 text-sm" aria-label="Open command palette">
                            <CommandIcon />
                            <span className="hidden lg:inline">Cmd+K</span>
                        </button>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-primary/80" aria-label="Toggle theme">
                            {isDark ? <SunIcon /> : <MoonIcon />}
                        </button>
                        {props.isLoggedIn && props.user ? (
                            <UserMenu 
                                user={props.user} 
                                onLogout={props.onLogout} 
                                onSettingsClick={props.onSettingsClick}
                                onSavedClick={props.onSavedClick}
                                onPremiumClick={props.onPremiumClick}
                                onAdminClick={props.onAdminClick}
                            />
                        ) : (
                            <button onClick={props.onLoginClick} className="hidden sm:block px-4 py-2 text-sm font-semibold bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors">
                                Login
                            </button>
                        )}
                        <button onClick={props.onTopStoriesClick} className="lg:hidden p-2 rounded-full hover:bg-primary/80" aria-label="Open mobile menu">
                            <MenuIcon />
                        </button>
                    </div>
                </div>
                <nav className="hidden lg:flex justify-center items-center py-2 space-x-6">
                    {NAV_LINKS.map(link => (
                        <div key={link.name} className="group relative">
                             <button onClick={() => onCategorySelect(link.name)} className="px-3 py-2 text-sm font-semibold hover:text-accent transition-colors nav-link-underline">
                                {link.name}
                            </button>
                            {link.sublinks && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block w-screen max-w-4xl">
                                    <div className="mega-menu-backdrop bg-popover/80 rounded-lg shadow-2xl p-6 grid grid-cols-4 gap-6">
                                        <div className="col-span-1">
                                            <h3 className="font-bold text-popover-foreground mb-4">{link.name}</h3>
                                            <ul className="space-y-2">
                                                {link.sublinks.map(sublink => (
                                                    <li key={sublink.name}>
                                                        <button onClick={() => onCategorySelect(sublink.name)} className="text-sm text-muted-foreground hover:text-accent">
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
                                                    <h4 className="text-xs font-semibold text-popover-foreground line-clamp-2 group-hover/article:text-accent">{article.title}</h4>
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
                     <button onClick={() => props.onTopStoriesClick} className="flex items-center px-3 py-2 text-sm font-semibold text-accent hover:text-accent/90 transition-colors">
                        <TrendingUpIcon className="w-5 h-5 mr-1" />
                        Top Stories
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
