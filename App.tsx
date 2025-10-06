
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import * as newsService from './services/newsService';
import { Article, Ad } from './types';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import AuthModal from './components/AuthModal';
import { useToast } from './contexts/ToastContext';
import SearchOverlay from './components/SearchOverlay';
import CommandPalette from './components/CommandPalette';
import ArticleView from './components/ArticleView';
import PremiumModal from './components/PremiumModal';
import SettingsPage from './pages/SettingsPage';
import BackToTopButton from './components/BackToTopButton';
import ArticleCard from './components/ArticleCard';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import InFeedAd from './components/InFeedAd';
import SavedArticlesPage from './pages/SavedArticlesPage';
import MyAdsPage from './pages/MyAdsPage';

type View = 'home' | 'article' | 'search-results' | 'settings' | 'saved-articles' | 'premium' | 'my-ads';

const App: React.FC = () => {
    const { 
        user, isLoggedIn, authLoading, login, logout, subscribe, 
        updateProfile, createAd, isArticleSaved, toggleSaveArticle 
    } = useAuth();
    useSettings(); // Initialize settings
    const { addToast } = useToast();

    const [view, setView] = useState<View>('home');
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('World');
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [isPremiumModalOpen, setPremiumModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<Article[]>([]);

    const fetchArticles = useCallback(async (category: string) => {
        setIsLoading(true);
        try {
            const fetchedArticles = await newsService.getArticles(category);
            setArticles(fetchedArticles);
        } catch (error) {
            addToast('Failed to load articles.', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchArticles(selectedCategory);
    }, [selectedCategory, fetchArticles]);
    
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setView('home');
        window.scrollTo(0, 0);
    };

    const handleArticleClick = async (article: Article) => {
        setSelectedArticle(article);
        setView('article');
        setRelatedArticles([]);
        window.scrollTo(0, 0);
        const related = await newsService.getRelatedArticles(article.id, article.category);
        setRelatedArticles(related);
    };

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setSearchOpen(false);
        const results = await newsService.searchArticles(query);
        setSearchResults(results);
        setView('search-results');
        setIsLoading(false);
    };

    const handleLogin = (email: string) => {
        login(email);
        setAuthModalOpen(false);
        addToast('Login successful!', 'success');
    };

    const handleRegister = (email: string) => {
        // In a real app, this would be a separate flow
        login(email);
        setAuthModalOpen(false);
        addToast('Registration successful! Welcome!', 'success');
    };
    
    const handleSubscribe = (plan: 'standard' | 'premium' | 'pro') => {
        subscribe(plan);
        setPremiumModalOpen(false);
        addToast(`Successfully subscribed to ${plan} plan!`, 'success');
    };
    
    const handleCreateAd = (ad: Omit<Ad, 'id'>) => {
        createAd(ad);
        addToast('Advertisement created successfully!', 'success');
    };
    
    const handleBack = () => {
        setSelectedArticle(null);
        setView('home');
    };
    
    const renderMainContent = () => {
        if (isLoading && view === 'home') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
                </div>
            );
        }

        switch (view) {
            case 'article':
                return selectedArticle && (
                    <ArticleView 
                        article={selectedArticle}
                        user={user}
                        onBack={handleBack}
                        onUpgradeClick={() => setPremiumModalOpen(true)}
                        isArticleSaved={isArticleSaved}
                        onToggleSave={toggleSaveArticle}
                        relatedArticles={relatedArticles}
                        onArticleClick={handleArticleClick}
                    />
                );
            case 'search-results':
                return (
                     <div>
                        <h1 className="text-3xl font-bold mb-6">Search Results</h1>
                        {searchResults.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchResults.map(article => <ArticleCard key={article.id} article={article} onArticleClick={handleArticleClick} />)}
                            </div>
                        ) : (
                            <p>No articles found for your search.</p>
                        )}
                    </div>
                );
            case 'settings':
                return <SettingsPage user={user} onUpgradeClick={() => setPremiumModalOpen(true)} />;
            case 'saved-articles':
                // This would need more implementation to fetch full article objects
                const savedArticlesFull = articles.filter(a => user?.savedArticles.includes(a.id));
                 return <SavedArticlesPage savedArticles={savedArticlesFull} onArticleClick={handleArticleClick} />;
            case 'my-ads':
                return <MyAdsPage user={user} onBack={() => setView('home')} onCreateAd={handleCreateAd} />;
            case 'home':
            default:
                return (
                    <div>
                         <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-yellow-500">{selectedCategory}</h1>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article, index) => (
                                <React.Fragment key={article.id}>
                                    <ArticleCard article={article} onArticleClick={handleArticleClick} />
                                    {index === 2 && <InFeedAd />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col font-sans">
            <Header
                onSearchClick={() => setSearchOpen(true)}
                onSettingsClick={() => setView('settings')}
                onLoginClick={() => setAuthModalOpen(true)}
                onCommandPaletteClick={() => setCommandPaletteOpen(true)}
                onCategorySelect={handleCategorySelect}
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={() => { logout(); addToast("You've been logged out.", "info"); }}
                onArticleClick={handleArticleClick}
                onHomeClick={() => setView('home')}
                onSavedClick={() => setView('saved-articles')}
                onPremiumClick={() => setPremiumModalOpen(true)}
                onMyAdsClick={() => setView('my-ads')}
                authLoading={authLoading}
            />
            <main className="container mx-auto px-4 py-8 flex-grow">
                {renderMainContent()}
            </main>
            <Footer />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onLogin={handleLogin}
                onRegister={handleRegister}
            />
            <SearchOverlay 
                isOpen={isSearchOpen}
                onClose={() => setSearchOpen(false)}
                onSearch={handleSearch}
            />
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                onOpenSettings={() => setView('settings')}
                onOpenPremium={() => setPremiumModalOpen(true)}
                onOpenSearch={() => { setSearchOpen(true); }}
            />
            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setPremiumModalOpen(false)}
                onSubscribe={handleSubscribe}
                currentPlan={user?.subscription || 'free'}
            />
            <BackToTopButton />
        </div>
    );
};

export default App;
