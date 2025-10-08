import React, { useState, useEffect } from 'react';
import { NavLink, User, Article } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { MenuIcon } from './icons/MenuIcon';
import UserMenu from './UserMenu';
import { getArticlesForMegaMenu } from '../services/newsService';
import { CommandIcon } from './icons/CommandIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { BellIcon } from './icons/BellIcon';

interface HeaderProps {
    user: User | null;
    isLoggedIn: boolean;
    navLinks: NavLink[];
    unreadNotifications: number;
    onLoginClick: () => void;
    onLogout: () => void;
    onSearchClick: () => void;
    onCommandPaletteClick: () => void;
    onMobileMenuClick: () => void;
    onTopStoriesClick: () => void;
    onLiveAssistantClick: () => void;
    onSettingsClick: () => void;
    onSavedClick: () => void;
    onNotificationsClick: () => void;
    onPremiumClick: () => void;
    onAdminClick: () => void;
    onSubAdminClick: () => void;
    onCategorySelect: (category: string) => void;
    onArticleClick: (article: Article) => void;
    siteName: string;
}

const Header: React.FC<HeaderProps> = (props) => {
    const { navLinks, onCategorySelect, onArticleClick } = props;
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
        
        const observer = new MutationObserver(handler);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        mediaQuery.addEventListener('change', handler);
        return () => {
            mediaQuery.removeEventListener('change', handler);
            observer.disconnect();
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', newIsDark);
    };
    
    const isPremium = props.user?.subscription === 'premium' || props.user?.subscription === 'pro';

    return (
        <header className={`bg-primary text-primary-foreground shadow-md sticky top-0 z-30 transition-colors duration-300 ${isScrolled ? 'header-scrolled' : ''}`}>
            <div className="container mx-auto px-4">
                <div className={`flex justify-between items-center py-3 border-b border-primary-foreground/20 transition-colors duration-300 ${isScrolled ? 'border-transparent' : ''}`}>
                    <button onClick={() => onCategorySelect('World')} className="text-xl font-bold text-accent">
                        {props.siteName}
                    </button>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                         {props.isLoggedIn && isPremium && (
                             <button onClick={props.onLiveAssistantClick} className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-md bg-accent/20 text-accent font-semibold hover:bg-accent/30 transition-colors text-sm" aria-label="Talk to AI">
                                <MicrophoneIcon />
                                <span>Talk to AI</span>
                            </button>
                        )}
                        <button onClick={props.onSearchClick} className="p-2 rounded-full hover:bg-primary-foreground/10" aria-label="Search">
                            <SearchIcon />
                        </button>
                         <button onClick={props.onCommandPaletteClick} className="hidden md:flex items-center space-x-2 p-2 rounded-md hover:bg-primary-foreground/10 text-sm" aria-label="Open command palette">
                            <CommandIcon />
                            <span className="hidden lg:inline">Cmd+K</span>
                        </button>
                        {props.isLoggedIn && (
                            <button onClick={props.onNotificationsClick} className="relative p-2 rounded-full hover:bg-primary-foreground/10" aria-label="Notifications">
                                <BellIcon />
                                {props.unreadNotifications > 0 && (
                                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-primary"></span>
                                )}
                            </button>
                        )}
                        <button onClick={toggleTheme} className="hidden lg:block p-2 rounded-full hover:bg-primary-foreground/10" aria-label="Toggle theme">
                            {isDark ? <SunIcon /> : <MoonIcon />}
                        </button>
                        
                        {/* Mobile Icons */}
                        <button onClick={props.onTopStoriesClick} className="lg:hidden p-2 rounded-full hover:bg-primary-foreground/10" aria-label="Open top stories">
                            <TrendingUpIcon />
                        </button>
                        <button onClick={props.onMobileMenuClick} className="lg:hidden p-2 rounded-full hover:bg-primary-foreground/10" aria-label="Open mobile menu">
                            <MenuIcon />
                        </button>

                        {props.isLoggedIn && props.user ? (
                            <UserMenu 
                                user={props.user} 
                                onLogout={props.onLogout} 
                                onSettingsClick={props.onSettingsClick}
                                onSavedClick={props.onSavedClick}
                                onPremiumClick={props.onPremiumClick}
                                onAdminClick={props.onAdminClick}
                                onSubAdminClick={props.onSubAdminClick}
                            />
                        ) : (
                            <button onClick={props.onLoginClick} className="hidden sm:block px-4 py-2 text-sm font-semibold bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors">
                                Login
                            </button>
                        )}
                    </div>
                </div>
                <nav className="hidden lg:flex justify-center items-center py-2 space-x-6">
                    {navLinks.map(link => (
                        <div key={link.id} className="group relative">
                             <button onClick={() => onCategorySelect(link.name)} className="px-3 py-2 text-sm font-semibold hover:text-accent transition-colors nav-link-underline">
                                {link.name}
                            </button>
                            {link.sublinks && link.sublinks.length > 0 && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block w-screen max-w-3xl">
                                    <div className="mega-menu-backdrop bg-popover/80 rounded-lg shadow-2xl p-6 grid grid-cols-3 gap-6">
                                       {link.name === 'World' ? (
                                           <>
                                                <div className="col-span-1">
                                                    <h3 className="font-bold text-popover-foreground mb-4 border-b-2 border-accent pb-2">{link.name}</h3>
                                                    <ul className="space-y-2">
                                                        {link.sublinks.map(sublink => (
                                                            <li key={sublink.id}>
                                                                <button onClick={() => onCategorySelect(sublink.name)} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                                                    {sublink.name}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                                    {getArticlesForMegaMenu(link.name, 2).map(article => (
                                                        <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer group/article">
                                                            <div className="overflow-hidden rounded-md">
                                                            <img src={article.urlToImage} alt={article.title} className="w-full h-32 object-cover mb-2 transition-transform duration-300 group-hover/article:scale-105" />
                                                            </div>
                                                            <h4 className="text-sm font-semibold text-popover-foreground line-clamp-2 mt-2 group-hover/article:text-accent transition-colors">{article.title}</h4>
                                                            <p className="text-xs text-muted-foreground mt-1">{new Date(article.publishedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                           </>
                                       ) : (
                                           <>
                                                <div className="col-span-1">
                                                    <h3 className="font-bold text-popover-foreground mb-4 border-b-2 border-accent pb-2">{link.name}</h3>
                                                    <ul className="space-y-2">
                                                        {link.sublinks.map(sublink => (
                                                            <li key={sublink.id}>
                                                                <button onClick={() => onCategorySelect(sublink.name)} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                                                    {sublink.name}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                                    {getArticlesForMegaMenu(link.name, 2).map(article => (
                                                        <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer group/article">
                                                            <div className="overflow-hidden rounded-md">
                                                            <img src={article.urlToImage} alt={article.title} className="w-full h-32 object-cover mb-2 transition-transform duration-300 group-hover/article:scale-105" />
                                                            </div>
                                                            <h4 className="text-sm font-semibold text-popover-foreground line-clamp-2 mt-2 group-hover/article:text-accent transition-colors">{article.title}</h4>
                                                            <p className="text-xs text-muted-foreground mt-1">{new Date(article.publishedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                           </>
                                       )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                     <button onClick={props.onTopStoriesClick} className="flex items-center px-3 py-2 text-sm font-semibold text-accent hover:text-accent/90 transition-colors">
                        <TrendingUpIcon className="w-5 h-5 mr-1" />
                        Top Stories
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;