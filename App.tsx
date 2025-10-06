import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import SearchOverlay from './components/SearchOverlay';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import ArticleView from './components/ArticleView';
import CommandPalette from './components/CommandPalette';
import BackToTopButton from './components/BackToTopButton';
import ArticleCard from './components/ArticleCard';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import Aside from './components/Aside';
import SettingsPage from './pages/SettingsPage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import PremiumPage from './pages/PremiumPage';

import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import * as newsService from './services/newsService';
import { Article, SubscriptionPlan } from './types';
import { ToastProvider, useToast } from './contexts/ToastContext';
import InFeedAd from './components/InFeedAd';

type View = 'home' | 'article' | 'settings' | 'saved' | 'premium' | 'search';

const AppContainer: React.FC = () => {
    const { user, login, logout, register, loading: authLoading, isLoggedIn, updateSubscription, saveArticle, unsaveArticle, isArticleSaved, updateProfile } = useAuth();
    const { settings, updateSettings } = useSettings();
    const { addToast } = useToast();

    const [currentView, setCurrentView] = useState<View>('home');
    const [articles, setArticles] = useState<Article[]>([]);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState('World');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

    const fetchArticles = useCallback(async (category: string) => {
        setIsLoading(true);
        try {
            const fetchedArticles = await newsService.getArticles(category);
            setArticles(fetchedArticles);
            const fetchedRelated = await newsService.getRelatedArticles(fetchedArticles[0]?.id || '');
            setRelatedArticles(fetchedRelated);
        } catch (error) {
            console.error("Failed to fetch articles", error);
            addToast("Failed to load news. Please try again.", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    const performSearch = useCallback(async (query: string) => {
        setIsLoading(true);
        setCurrentView('search');
        setSearchQuery(query);
        try {
            const searchResults = await newsService.searchArticles(query);
            setArticles(searchResults);
        } catch (error) {
            console.error("Search failed", error);
            addToast("Search failed. Please try again.", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        if (currentView === 'home') {
            fetchArticles(currentCategory);
        }
    }, [currentCategory, currentView, fetchArticles]);

    const handleArticleClick = (article: Article) => {
        setSelectedArticle(article);
        setCurrentView('article');
        window.scrollTo(0, 0);
    };

    const handleCategorySelect = (category: string) => {
        setCurrentCategory(category);
        setCurrentView('home');
    };

    const handleSearch = (query: string) => {
        setSearchOpen(false);
        performSearch(query);
    };
    
    const handleLogin = (email: string) => {
        login(email);
        setAuthModalOpen(false);
        addToast(`Welcome back, ${email.split('@')[0]}!`, 'success');
    };
    
    const handleRegister = (email: string) => {
        register(email);
        setAuthModalOpen(false);
        addToast('Account created successfully! Welcome!', 'success');
    };

    const handleLogout = () => {
        logout();
        addToast("You've been logged out.", 'info');
    };
    
    const handleToggleSave = (article: Article) => {
        if (!isLoggedIn) {
            setAuthModalOpen(true);
            return;
        }
        if (isArticleSaved(article.id)) {
            unsaveArticle(article.id);
            addToast("Article removed from saved.", 'info');
        } else {
            saveArticle(article);
            addToast("Article saved!", 'success');
        }
    };
    
    const handleUpdateSubscription = (plan: SubscriptionPlan) => {
        updateSubscription(plan);
        addToast(`Subscription updated to ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`, 'success');
        setCurrentView('settings');
    };
    
    const handleHomeClick = () => {
        setCurrentView('home');
        if (currentCategory !== 'World') {
            setCurrentCategory('World');
        } else {
            // Re-fetch if already on home
            fetchArticles('World');
        }
    }

    const renderMainContent = () => {
        if (currentView === 'article' && selectedArticle) {
            return <ArticleView 
                        article={selectedArticle}
                        user={user}
                        onBack={() => setCurrentView('home')}
                        onUpgradeClick={() => setCurrentView('premium')}
                        isArticleSaved={isArticleSaved}
                        onToggleSave={handleToggleSave}
                   />;
        }
        if(currentView === 'settings' && user) {
            return <SettingsPage 
                        user={user}
                        settings={settings}
                        onUpdateProfile={updateProfile}
                        onUpdateSettings={updateSettings}
                        onUpdateSubscription={handleUpdateSubscription}
                        addToast={addToast}
                        onArticleClick={handleArticleClick}
                    />;
        }
        if (currentView === 'saved' && user) {
            return <SavedArticlesPage savedArticles={user.savedArticles} onArticleClick={handleArticleClick} />;
        }
        if (currentView === 'premium') {
            return <PremiumPage />;
        }
        
        const title = currentView === 'search' ? `Search Results for "${searchQuery}"` : `Top Stories in ${currentCategory}`;
        const showNoResults = currentView === 'search' && !isLoading && articles.length === 0;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
                <div className="md:col-span-2 xl:col-span-3">
                    <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-yellow-500">{title}</h1>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} layoutMode={settings.layoutMode} />)}
                        </div>
                    ) : showNoResults ? (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <h2 className="text-xl font-semibold">No Results Found</h2>
                            <p className="text-gray-500 mt-2">Try searching for something else.</p>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 ${settings.layoutMode === 'compact' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                            {articles.map((article, index) => (
                                <React.Fragment key={article.id}>
                                    <ArticleCard 
                                        article={article} 
                                        onArticleClick={handleArticleClick} 
                                        layoutMode={settings.layoutMode}
                                    />
                                    {(index + 1) % 4 === 0 && settings.showSponsored && <InFeedAd />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
                <div className="md:col-span-1 xl:col-span-1">
                    <Aside title="Trending Stories" articles={relatedArticles} onArticleClick={handleArticleClick} isLoading={isLoading} />
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen font-sans transition-colors duration-300 ${settings.fontSize}`}>
            <Header
                onSearchClick={() => setSearchOpen(true)}
                onSettingsClick={() => isLoggedIn ? setCurrentView('settings') : setAuthModalOpen(true)}
                onLoginClick={() => setAuthModalOpen(true)}
                onCommandPaletteClick={() => setCommandPaletteOpen(true)}
                onCategorySelect={handleCategorySelect}
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={handleLogout}
                onArticleClick={handleArticleClick}
                onHomeClick={handleHomeClick}
                onSavedClick={() => setCurrentView('saved')}
                onPremiumClick={() => setCurrentView('premium')}
                authLoading={authLoading}
            />

            <main className="container mx-auto px-4 py-8">
                {renderMainContent()}
            </main>

            <Footer />

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} onSearch={handleSearch} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
            {/* The single AuthModal handles both login and registration */}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setAuthModalOpen(false)} 
                onLogin={handleLogin} 
                onRegister={handleRegister} 
            />
            <CommandPalette 
                isOpen={isCommandPaletteOpen} 
                onClose={() => setCommandPaletteOpen(false)}
                onOpenSettings={() => { setCommandPaletteOpen(false); isLoggedIn ? setCurrentView('settings') : setAuthModalOpen(true); }}
                onOpenPremium={() => { setCommandPaletteOpen(false); setCurrentView('premium'); }}
                onOpenSearch={() => { setCommandPaletteOpen(false); setSearchOpen(true); }}
            />
            <BackToTopButton />
        </div>
    );
}

const App: React.FC = () => (
    <ToastProvider>
        <AppContainer />
    </ToastProvider>
);

export default App;