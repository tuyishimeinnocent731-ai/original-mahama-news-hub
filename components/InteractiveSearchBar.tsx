import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Article, User } from '../types';
import * as newsService from '../services/newsService';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { CloseIcon } from './icons/CloseIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ClockIcon } from './icons/ClockIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { ALL_CATEGORIES } from '../constants';

interface InteractiveSearchBarProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string, filters: { category?: string; author?: string }) => void;
    onArticleSelect: (article: Article) => void;
    user: User | null;
    clearSearchHistory: () => void;
    topStories: Article[];
    allArticles: Article[];
}

const InteractiveSearchBar: React.FC<InteractiveSearchBarProps> = (props) => {
    const { isOpen, onClose, onSearch, onArticleSelect, user, clearSearchHistory, topStories, allArticles } = props;
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { isListening, transcript, startListening, isSupported } = useVoiceSearch();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');

    const authors = useMemo(() => {
        if (!allArticles) return [];
        const authorSet = new Set(allArticles.map(a => a.author).filter(Boolean));
        return Array.from(authorSet).sort();
    }, [allArticles]);

    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setSuggestions([]);
            setSelectedCategory('');
            setSelectedAuthor('');
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
        if (query.trim() || selectedCategory || selectedAuthor) {
            onSearch(query.trim(), { category: selectedCategory, author: selectedAuthor });
        }
    };
    
    const handleSuggestionClick = (article: Article) => {
        onClose();
        onArticleSelect(article);
    }
    
    const handleRecentSearchClick = (term: string) => {
        onClose();
        onSearch(term, {});
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start p-4 pt-[10vh] sm:pt-[15vh] search-modal-backdrop bg-background/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-3xl search-modal-content" onClick={e => e.stopPropagation()}>
                <div className="bg-card border border-border rounded-t-lg shadow-2xl">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for articles, topics or news..."
                            className="w-full pl-12 pr-12 py-4 text-lg bg-transparent focus:outline-none"
                            autoFocus
                        />
                        {isSupported && (
                            <button type="button" onClick={startListening} className="absolute inset-y-0 right-0 pr-4 flex items-center" aria-label="Search by voice">
                                <MicrophoneIcon className={isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'} />
                            </button>
                        )}
                    </form>
                    <div className="p-4 border-t border-border flex flex-col sm:flex-row gap-4">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="w-full sm:w-1/2 p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent text-sm"
                        >
                            <option value="">All Categories</option>
                            {ALL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <select
                            value={selectedAuthor}
                            onChange={e => setSelectedAuthor(e.target.value)}
                            className="w-full sm:w-1/2 p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent text-sm"
                        >
                            <option value="">All Authors</option>
                            {authors.map(author => <option key={author} value={author}>{author}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-card border-x border-b border-border rounded-b-lg shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
                    {query.length < 2 ? (
                        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                           {user && user.searchHistory.length > 0 && (
                                <div className="md:col-span-1">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>Recent</span>
                                        </h3>
                                        <button onClick={clearSearchHistory} className="text-xs text-muted-foreground hover:text-foreground hover:underline">Clear</button>
                                    </div>
                                    <div className="flex flex-col items-start gap-2">
                                        {user.searchHistory.map(term => (
                                            <button key={term} onClick={() => handleRecentSearchClick(term)} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-muted transition-colors">
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                             {topStories.length > 0 && (
                                <div className={user && user.searchHistory.length > 0 ? "md:col-span-2" : "md:col-span-3"}>
                                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center space-x-2 mb-3">
                                        <TrendingUpIcon className="w-4 h-4" />
                                        <span>Trending Now</span>
                                    </h3>
                                    <div className="space-y-2">
                                        {topStories.slice(0, 4).map(article => (
                                            <button key={article.id} onClick={() => handleSuggestionClick(article)} className="w-full text-left flex items-center p-2 rounded-lg hover:bg-secondary transition-colors">
                                                <img src={article.urlToImage} alt={article.title} className="w-16 h-10 object-cover rounded-md mr-3 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-sm line-clamp-2">{article.title}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ul>
                            {isLoading && <li className="px-4 py-3 text-center text-muted-foreground">Searching...</li>}
                            {!isLoading && suggestions.length === 0 && query && <li className="px-4 py-3 text-center text-muted-foreground">No results for "{query}"</li>}
                            {suggestions.map(article => (
                                <li key={article.id}>
                                    <button onClick={() => handleSuggestionClick(article)} className="w-full text-left flex items-center px-4 py-3 hover:bg-secondary transition-colors">
                                        <img src={article.urlToImage} alt={article.title} className="w-20 h-16 object-cover rounded-lg mr-4 flex-shrink-0" />
                                        <div className="overflow-hidden">
                                            <span className="text-xs font-bold text-accent uppercase">{article.category}</span>
                                            <p className="font-semibold text-card-foreground truncate">{article.title}</p>
                                            <p className="text-sm text-muted-foreground truncate">{article.description}</p>
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