import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { CloseIcon } from './icons/CloseIcon';
import { User } from '../types';
import { ClockIcon } from './icons/ClockIcon';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    user: User | null;
    clearSearchHistory: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSearch, user, clearSearchHistory }) => {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(e.key === 'Escape') {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [onClose]);

    if(!isOpen) return null;
    
    const hasHistory = user && user.searchHistory.length > 0;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center p-4 pt-20" role="dialog" aria-modal="true">
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white" aria-label="Close search">
                <CloseIcon />
            </button>
            <div className="w-full max-w-xl">
                 <h2 className="text-3xl font-bold text-white text-center mb-8">Search for News</h2>
                 <SearchBar onSearch={onSearch} />
                 
                 {hasHistory && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
                                <ClockIcon className="w-4 h-4" />
                                <span>Recent Searches</span>
                            </h3>
                             <button onClick={clearSearchHistory} className="text-xs text-gray-400 hover:text-white hover:underline">Clear</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {user.searchHistory.map(term => (
                                <button
                                    key={term}
                                    onClick={() => onSearch(term)}
                                    className="px-3 py-1.5 bg-gray-700/80 text-gray-200 rounded-full text-sm hover:bg-gray-600 transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                 )}
            </div>
        </div>
    )
}

export default SearchOverlay;