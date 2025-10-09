import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { NavLink, User } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { LoginIcon } from './icons/LoginIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { FilmIcon } from './icons/FilmIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';

const WorldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.8 14.286c.32.32.32.839 0 1.159l-.943.943a.803.803 0 01-1.137 0l-.943-.943a.803.803 0 010-1.159l.943-.943a.803.803 0 011.137 0l.943.943zm11.1-2.071c.32.32.32.839 0 1.159l-.943.943a.803.803 0 01-1.137 0l-.943-.943a.803.803 0 010-1.159l.943-.943a.803.803 0 011.137 0l.943.943zM12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>;
const PoliticsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>;
const BusinessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 001.414 0l2.414-2.414a1 1 0 01.707-.293H15v5m-6 0v-5h4v5m-4 0H9" /></svg>;
const EconomyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const TechIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>;
const SportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const EntertainmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h2.5M17.5 20H20" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const categoryIcons: { [key: string]: React.ReactNode } = {
    World: <WorldIcon />, Politics: <PoliticsIcon />, Business: <BusinessIcon />,
    Economy: <EconomyIcon />, Technology: <TechIcon />, Sport: <SportIcon />,
    Entertainment: <EntertainmentIcon />, History: <HistoryIcon />,
    "Video": <FilmIcon />, "Films & TV": <FilmIcon />, Arts: <PaintBrushIcon />
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  onCategorySelect: (category: string) => void;
  onSearch: (query: string) => void;
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onSettingsClick: () => void;
}

const MobileMenuItem: React.FC<{
    link: NavLink;
    onCategorySelect: (category: string) => void;
    onClose: () => void;
    delay: number;
}> = ({ link, onCategorySelect, onClose, delay }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSelect = (category: string) => {
        onCategorySelect(category);
        onClose();
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (link.sublinks && link.sublinks.length > 0) {
            setIsExpanded(!isExpanded);
        } else {
            handleSelect(link.name);
        }
    };

    return (
        <div className="py-2 border-b border-primary-foreground/10 mobile-menu-item" style={{ animationDelay: `${delay}ms` }}>
            <button
                onClick={handleToggle}
                className="w-full flex justify-between items-center text-lg text-primary-foreground hover:text-accent focus:outline-none transition-colors"
            >
                <span className="flex items-center space-x-3">
                    {categoryIcons[link.name] || <WorldIcon/>}
                    <span>{link.name}</span>
                </span>
                {link.sublinks && link.sublinks.length > 0 && (
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                )}
            </button>
            {link.sublinks && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 mt-2' : 'max-h-0'}`}>
                    <div className="pl-8 pt-2 flex flex-col items-start space-y-2">
                        {link.sublinks.map(sublink => (
                            <button
                                key={sublink.id}
                                onClick={() => handleSelect(sublink.name)}
                                className="text-left text-base text-primary-foreground hover:text-accent transition-colors"
                            >
                                {sublink.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const MobileMenu: React.FC<MobileMenuProps> = (props) => {
    const { isOpen, onClose, navLinks, onCategorySelect, onSearch, user, onLoginClick, onLogout, onSettingsClick } = props;
    const [searchQuery, setSearchQuery] = useState('');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (!isOpen) setSearchQuery('');
    }, [isOpen]);
    
     useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
        const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery);
            onClose();
        }
    };

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
    };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-50" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-primary shadow-xl flex flex-col animate-slide-in-left"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 p-4 border-b border-primary-foreground/20">
            <h2 className="text-xl font-bold text-accent">Menu</h2>
            <button onClick={onClose} aria-label="Close menu" className="text-primary-foreground p-2 rounded-full hover:bg-primary-foreground/10">
                <CloseIcon />
            </button>
        </div>
        
        <div className="px-4 mb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search news..."
                    className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-md py-2 pl-10 pr-4 text-primary-foreground placeholder-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
            </form>
        </div>

        <nav className="flex-grow overflow-y-auto px-4">
          {navLinks.map((link, index) => (
            <MobileMenuItem key={link.id} link={link} onCategorySelect={onCategorySelect} onClose={onClose} delay={index * 50} />
          ))}
        </nav>
        
        <div className="p-4 mt-auto border-t border-primary-foreground/20">
            {user ? (
                <div className="flex items-center justify-between">
                    <button onClick={() => { onSettingsClick(); onClose(); }} className="flex flex-col items-center space-y-1 text-primary-foreground hover:text-accent text-sm">
                        <SettingsIcon />
                        <span>Settings</span>
                    </button>
                    <button onClick={toggleTheme} className="flex flex-col items-center space-y-1 text-primary-foreground hover:text-accent text-sm p-2 rounded-full">
                         {isDark ? <SunIcon /> : <MoonIcon />}
                         <span>{isDark ? 'Light' : 'Dark'}</span>
                    </button>
                    <button onClick={() => { onLogout(); onClose(); }} className="flex flex-col items-center space-y-1 text-primary-foreground hover:text-accent text-sm">
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </div>
            ) : (
                 <div className="flex items-center justify-between">
                    <button onClick={() => { onLoginClick(); onClose(); }} className="w-full flex items-center justify-center space-x-2 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90">
                        <LoginIcon />
                        <span>Login / Register</span>
                    </button>
                     <button onClick={toggleTheme} className="p-3 ml-2 rounded-lg bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
                         {isDark ? <SunIcon /> : <MoonIcon />}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
