
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useKeyPress } from '../hooks/useKeyPress';
import { SearchIcon } from './icons/SearchIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface Command {
    id: string;
    name: string;
    action: () => void;
    icon: React.ReactNode;
    keywords?: string[];
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    setSettingsOpen: (open: boolean) => void;
    setPremiumOpen: (open: boolean) => void;
    setSearchOpen: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setSettingsOpen, setPremiumOpen, setSearchOpen }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const cmdKPressed = useKeyPress('k', { metaKey: true });

    const commands: Command[] = useMemo(() => [
        {
            id: 'search',
            name: 'Search Articles',
            action: () => {
                onClose();
                setSearchOpen(true);
            },
            icon: <SearchIcon />,
            keywords: ['find', 'topic']
        },
        {
            id: 'settings',
            name: 'Open Settings',
            action: () => {
                onClose();
                setSettingsOpen(true);
            },
            icon: <SettingsIcon />,
            keywords: ['preferences', 'theme', 'account']
        },
        {
            id: 'upgrade',
            name: 'Upgrade Plan',
            action: () => {
                onClose();
                setPremiumOpen(true);
            },
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h1V3a1 1 0 011-1zm1 10a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
            keywords: ['premium', 'subscribe', 'pro']
        }
    ], [onClose, setSettingsOpen, setPremiumOpen, setSearchOpen]);

    const filteredCommands = useMemo(() => {
        if (!query) return commands;
        return commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            (cmd.keywords && cmd.keywords.some(k => k.toLowerCase().includes(query.toLowerCase())))
        );
    }, [query, commands]);

    useEffect(() => {
        if (cmdKPressed) {
            // The hook will trigger the state change in App.tsx to open this palette
        }
    }, [cmdKPressed]);

     useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [filteredCommands, selectedIndex, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden" 
                onClick={e => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="p-2 border-b dark:border-gray-700">
                    <input 
                        type="text"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                        className="w-full bg-transparent p-2 text-lg focus:outline-none"
                    />
                </div>
                <ul className="py-2 max-h-80 overflow-y-auto">
                    {filteredCommands.length > 0 ? filteredCommands.map((cmd, index) => (
                        <li 
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`flex items-center space-x-3 px-4 py-2 cursor-pointer ${selectedIndex === index ? 'bg-yellow-100 dark:bg-gray-700' : ''}`}
                        >
                            <span className="text-gray-500 dark:text-gray-400">{cmd.icon}</span>
                            <span>{cmd.name}</span>
                        </li>
                    )) : (
                        <li className="text-center text-gray-500 py-4">No commands found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CommandPalette;
