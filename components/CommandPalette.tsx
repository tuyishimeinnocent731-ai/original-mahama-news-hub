import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useKeyPress } from '../hooks/useKeyPress';
import { SearchIcon } from './icons/SearchIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { StarIcon } from './icons/StarIcon';

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
    onOpenSettings: () => void;
    onOpenPremium: () => void;
    onOpenSearch: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenSettings, onOpenPremium, onOpenSearch }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const cmdKPressed = useKeyPress('k', { metaKey: true });

    const commands: Command[] = useMemo(() => [
        {
            id: 'search',
            name: 'Search Articles',
            action: () => {
                onClose();
                onOpenSearch();
            },
            icon: <SearchIcon />,
            keywords: ['find', 'topic']
        },
        {
            id: 'settings',
            name: 'Open Settings',
            action: () => {
                onClose();
                onOpenSettings();
            },
            icon: <SettingsIcon />,
            keywords: ['preferences', 'theme', 'account', 'profile']
        },
        {
            id: 'upgrade',
            name: 'Upgrade Plan',
            action: () => {
                onClose();
                onOpenPremium();
            },
            icon: <StarIcon />,
            keywords: ['premium', 'subscribe', 'pro']
        }
    ], [onClose, onOpenSettings, onOpenPremium, onOpenSearch]);

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
                <div className="p-2 border-b dark:border-gray-700 flex items-center space-x-2">
                    <SearchIcon/>
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
                            className={`flex items-center space-x-3 px-4 py-3 cursor-pointer ${selectedIndex === index ? 'bg-yellow-100 dark:bg-gray-700' : ''}`}
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
