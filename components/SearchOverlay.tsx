import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { CloseIcon } from './icons/CloseIcon';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSearch }) => {

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

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center p-4 pt-20" role="dialog" aria-modal="true">
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white" aria-label="Close search">
                <CloseIcon />
            </button>
            <div className="w-full max-w-xl">
                 <h2 className="text-3xl font-bold text-white text-center mb-8">Search for News</h2>
                 <SearchBar onSearch={onSearch} />
            </div>
        </div>
    )
}

export default SearchOverlay;
