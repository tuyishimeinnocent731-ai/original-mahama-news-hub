import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import Aside from './components/Aside';
import ArticleViewModal from './components/ArticleViewModal';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import PremiumModal from './components/PremiumModal';
import SearchOverlay from './components/SearchOverlay';
import CommandPalette from './components/CommandPalette';
import BackToTopButton from './components/BackToTopButton';
import { Article, GroundingChunk } from './types';
import * as newsService from './services/newsService';
import { useSettings } from './hooks/useSettings';
import { useAuth } from './hooks/useAuth';
import { ToastProvider, useToast } from './contexts/ToastContext';

const AppContent: React.FC = () => {
    const { settings } = useSettings();
    const { user, login, logout, register, isLoggedIn } = useAuth();
    const { addToast } = useToast();

    const [articles, setArticles] = useState<Article[]>([]);
    const [topStories, setTopStories] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [searchSources, setSearchSources] = useState<GroundingChunk[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [isArticleModalOpen, setArticleModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isPremiumModalOpen, setPremiumModalOpen] = useState(false);
    const [isSearchOverlayOpen, setSearchOverlayOpen] = useState(false);
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedArticles, fetchedTopStories] = await Promise.all([
                newsService.getArticlesByCategory('all'),
                newsService.getTopStories(),
            ]);
            setArticles(fetchedArticles);
            setTopStories(fetchedTopStories);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
            addToast('Failed to load news. Please try again later.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleArticleClick = (article: Article) => {
        setSelectedArticle(article);
        setArticleModalOpen(true);
    };

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setSearchOverlayOpen(false);
        setSearchQuery(`Search results for: "${query}"`);
        try {
            const { articles: searchedArticles, sources } = await newsService.searchArticles(query);
            setArticles(searchedArticles);
            setSearchSources(sources);
            if (searchedArticles.length === 0) {
                addToast('No articles found for your search.', 'info');
            }
        } catch (error) {
            console.error('Failed to search articles:', error);
            addToast('Search failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogin = (email: string) => {
        login(email);
        setAuthModalOpen(false);
        addToast(`Welcome back, ${email}!`, 'success');
    };

    const handleRegister = (email: string) => {
        register(email);
        setAuthModalOpen(false);
        addToast(`Successfully registered, ${email}!`, 'success');
    };
    
    const handleLogout = () => {
        logout();
        addToast('You have been logged out.', 'info');
    };

    return (
        <div className={`font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col ${settings.fontSize}`}>
            <Header
                onSearchClick={() => setSearchOverlayOpen(true)}
                onSettingsClick={() => setSettingsModalOpen(true)}
                onLoginClick={() => setAuthModalOpen(true)}
                onCommandPaletteClick={() => setCommandPaletteOpen(true)}
                isLoggedIn={isLoggedIn}
                userEmail={user?.email || null}
                onLogout={handleLogout}
            />

            <main className="flex-grow container mx-auto p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-yellow-500">{searchQuery || 'Latest News'}</h1>
                        {searchSources.length > 0 && (
                            <div className="mb-6 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
                                <h3 className="font-semibold mb-2">Sources from Google Search:</h3>
                                <ul className="list-disc list-inside text-sm">
                                    {searchSources.map((source, index) => (
                                        source.web?.uri && <li key={index}><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{source.web.title || source.web.uri}</a></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${settings.layoutMode === 'normal' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
                            {isLoading ? (
                                Array.from({ length: 9 }).map((_, index) => <ArticleCardSkeleton key={index} layoutMode={settings.layoutMode} />)
                            ) : (
                                articles.map(article => (
                                    <ArticleCard key={article.id} article={article} onArticleClick={handleArticleClick} layoutMode={settings.layoutMode} />
                                ))
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        {isLoading ? <div></div> : <Aside topStories={topStories} onArticleClick={handleArticleClick} />}
                    </div>
                </div>
            </main>

            <Footer />
            <BackToTopButton />

            <ArticleViewModal
                article={selectedArticle}
                isOpen={isArticleModalOpen}
                onClose={() => setArticleModalOpen(false)}
                isPremium={false} // Replace with actual subscription status
                onUpgradeClick={() => setPremiumModalOpen(true)}
            />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} onRegister={handleRegister} />
            <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setPremiumModalOpen(false)} />
            <SearchOverlay isOpen={isSearchOverlayOpen} onClose={() => setSearchOverlayOpen(false)} onSearch={handleSearch} />
            <CommandPalette 
                isOpen={isCommandPaletteOpen} 
                onClose={() => setCommandPaletteOpen(false)}
                setSettingsOpen={setSettingsModalOpen}
                setPremiumOpen={setPremiumModalOpen}
                setSearchOpen={setSearchOverlayOpen}
            />
        </div>
    );
};


const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
);


export default App;
