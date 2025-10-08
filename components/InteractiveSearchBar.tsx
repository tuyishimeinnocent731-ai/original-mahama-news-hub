import React, { useState, useEffect, useCallback } from 'react';
import { Article, User } from '../types';
import * as newsService from '../services/newsService';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { CloseIcon } from './icons/CloseIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ClockIcon } from './icons/ClockIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';

interface InteractiveSearchBarProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    onArticleSelect: (article: Article) => void;
    user: User | null;
    clearSearchHistory: () => void;
}

const InteractiveSearchBar: React.FC<InteractiveSearchBarProps> = (props) => {
    const { isOpen, onClose, onSearch, onArticleSelect, user, clearSearchHistory } = props;
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { isListening, transcript, startListening, isSupported } = useVoiceSearch();

    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setSuggestions([]);
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);
            const results = await newsService.getSearchSuggestions(query);
            setSuggestions(results);
            setIsLoading(false);
        };
        
        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };
    
    const handleSuggestionClick = (article: Article) => {
        onClose();
        onArticleSelect(article);
    }
    
    const handleRecentSearchClick = (term: string) => {
        onClose();
        onSearch(term);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start p-4 pt-[10vh] sm:pt-[15vh] search-modal-backdrop bg-background/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-2xl search-modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSearch} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for articles, topics or news..."
                        className="w-full pl-12 pr-12 py-4 text-lg bg-card border border-border rounded-lg shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent"
                        autoFocus
                    />
                    {isSupported && (
                        <button type="button" onClick={startListening} className="absolute inset-y-0 right-0 pr-4 flex items-center" aria-label="Search by voice">
                            <MicrophoneIcon className={isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'} />
                        </button>
                    )}
                </form>

                <div className="bg-card border border-border rounded-b-lg shadow-2xl mt-1 overflow-hidden">
                    {query.length < 2 ? (
                        user && user.searchHistory.length > 0 && (
                             <div className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>Recent Searches</span>
                                    </h3>
                                    <button onClick={clearSearchHistory} className="text-xs text-muted-foreground hover:text-foreground hover:underline">Clear</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {user.searchHistory.map(term => (
                                        <button key={term} onClick={() => handleRecentSearchClick(term)} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-muted transition-colors">
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    ) : (
                        <ul>
                            {isLoading && <li className="px-4 py-3 text-center text-muted-foreground">Searching...</li>}
                            {!isLoading && suggestions.length === 0 && query && <li className="px-4 py-3 text-center text-muted-foreground">No results for "{query}"</li>}
                            {suggestions.map(article => (
                                <li key={article.id}>
                                    <button onClick={() => handleSuggestionClick(article)} className="w-full text-left flex items-center px-4 py-3 hover:bg-secondary transition-colors">
                                        <NewspaperIcon className="w-5 h-5 mr-3 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">{article.title}</p>
                                            <p className="text-xs text-muted-foreground">{article.category}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <button onClick={onClose} className="absolute top-6 right-6 text-foreground/70 hover:text-foreground" aria-label="Close search">
                <CloseIcon />
            </button>
        </div>
    );
};

export default InteractiveSearchBar;