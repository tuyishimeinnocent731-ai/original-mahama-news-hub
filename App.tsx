import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import Aside from './components/Aside';
import ArticleView from './components/ArticleView';
import AuthModal from './components/AuthModal';
import PremiumModal from './components/PremiumModal';
import SearchOverlay from './components/SearchOverlay';
import CommandPalette from './components/CommandPalette';
import BackToTopButton from './components/BackToTopButton';
import SavedArticlesPage from './pages/SavedArticlesPage';
import SettingsPage from './pages/SettingsPage';
import { Article, GroundingChunk } from './types';
import * as newsService from './services/newsService';
import { useSettings } from './hooks/useSettings';
import { useAuth } from './hooks/useAuth';
import { ToastProvider, useToast } from './contexts/ToastContext';

const AppContent: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { user, login, logout, register, isLoggedIn, updateSubscription, saveArticle, unsaveArticle, isArticleSaved, updateProfile, loading: authLoading } = useAuth();
    const { addToast } = useToast();

    const [articles, setArticles] = useState<Article[]>([]);
    const [topStories, setTopStories] = useState<Article[]>([]);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRelatedLoading, setIsRelatedLoading] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [searchSources, setSearchSources] = useState<GroundingChunk[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentView, setCurrentView] = useState('home'); // 'home', 'saved', 'settings'

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isPremiumModalOpen, setPremiumModalOpen] = useState(false);
    const [isSearchOverlayOpen, setSearchOverlayOpen] = useState(false);
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

    const fetchArticles = useCallback(async (category: string) => {
        setIsLoading(true);
        setSelectedArticle(null);
        setCurrentView('home');
        try {
            const fetchedArticles = await newsService.getArticlesByCategory(category);
            setArticles(fetchedArticles);
        } catch (error) {
            console.error(`Failed to fetch articles for ${category}:`, error);
            addToast(`Failed to load articles for ${category}.`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        newsService.getTopStories()
            .then(setTopStories)
            .catch(error => {
                console.error('Failed to fetch top stories:', error);
                addToast('Failed to load top stories.', 'error');
            });
    }, [addToast]);

    useEffect(() => {
        if (currentView === 'home' && !selectedArticle) {
            fetchArticles(selectedCategory);
        }
    }, [selectedCategory, fetchArticles, currentView, selectedArticle]);

    useEffect(() => {
        if (selectedArticle) {
            setIsRelatedLoading(true);
            newsService.getRelatedArticles(selectedArticle.category, selectedArticle.id)
                .then(setRelatedArticles)
                .catch(error => {
                    console.error('Failed to fetch related articles:', error);
                    addToast('Could not load related stories.', 'error');
                    setRelatedArticles([]);
                })
                .finally(() => setIsRelatedLoading(false));
        }
    }, [selectedArticle, addToast]);

    const handleArticleClick = (article: Article) => {
        setSelectedArticle(article);
        setCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleHomeClick = () => {
        setSelectedArticle(null);
        setCurrentView('home');
        setSelectedCategory('all');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    const handleSettingsClick = () => {
        setSelectedArticle(null);
        setCurrentView('settings');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategorySelect = (category: string) => {
        setSearchQuery('');
        setSearchSources([]);
        setSelectedCategory(category.toLowerCase());
        handleHomeClick();
    };

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setSearchOverlayOpen(false);
        setSearchQuery(`Search results for: "${query}"`);
        setSelectedArticle(null);
        setCurrentView('home');
        setSelectedCategory('');
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
        addToast(`Welcome back!`, 'success');
    };

    const handleRegister = (email: string) => {
        register(email);
        setAuthModalOpen(false);
        addToast(`Successfully registered!`, 'success');
    };
    
    const handleLogout = () => {
        logout();
        addToast('You have been logged out.', 'info');
    };

    const handleUpdateSubscription = (plan: 'free' | 'standard' | 'premium') => {
        updateSubscription(plan);
        setPremiumModalOpen(false);
        addToast(`You've successfully subscribed to the ${plan} plan!`, 'success');
    };

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    
    const renderMainContent = () => {
        if (currentView === 'settings' && user) {
            return (
                 <SettingsPage 
                    user={user} 
                    settings={settings} 
                    onUpdateProfile={updateProfile}
                    onUpdateSettings={updateSettings}
                    onUpdateSubscription={handleUpdateSubscription}
                    addToast={addToast}
                />
            );
        }
        
        if (selectedArticle) {
            return (
                <ArticleView
                    article={selectedArticle}
                    isPremium={user?.subscription !== 'free'}
                    onUpgradeClick={() => setPremiumModalOpen(true)}
                    isLoggedIn={isLoggedIn}
                    isSaved={isArticleSaved(selectedArticle.id)}
                    onSaveToggle={() => {
                        if (isArticleSaved(selectedArticle.id)) {
                            unsaveArticle(selectedArticle.id);
                            addToast('Article removed from your list.', 'info');
                        } else {
                            saveArticle(selectedArticle);
                            addToast('Article saved for offline reading!', 'success');
                        }
                    }}
                />
            );
        }

        if (currentView === 'saved') {
            return <SavedArticlesPage savedArticles={user?.savedArticles || []} onArticleClick={handleArticleClick} />;
        }

        const pageTitle = searchQuery || (selectedCategory ? `${capitalize(selectedCategory)} News` : 'Latest News');
        return (
            <>
                <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-yellow-500">{pageTitle}</h1>
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
            </>
        );
    }


    return (
        <div className={`font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col ${settings.fontSize}`}>
            <Header
                onSearchClick={() => setSearchOverlayOpen(true)}
                onSettingsClick={handleSettingsClick}
                onLoginClick={() => setAuthModalOpen(true)}
                onCommandPaletteClick={() => setCommandPaletteOpen(true)}
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={handleLogout}
                onCategorySelect={handleCategorySelect}
                onArticleClick={handleArticleClick}
                onHomeClick={handleHomeClick}
                onSavedClick={() => {
                    setSelectedArticle(null);
                    setCurrentView('saved');
                }}
                onPremiumClick={() => setPremiumModalOpen(true)}
                authLoading={authLoading}
            />

            <main className="flex-grow container mx-auto p-4 lg:p-6">
                 {currentView === 'settings' ? (
                    renderMainContent()
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-3">
                            {renderMainContent()}
                        </div>
                        <div className="md:col-span-1">
                            {selectedArticle ? (
                                <Aside
                                    title="Related Stories"
                                    articles={relatedArticles}
                                    onArticleClick={handleArticleClick}
                                    isLoading={isRelatedLoading}
                                />
                            ) : (
                                <Aside 
                                    title="Top Stories" 
                                    articles={topStories} 
                                    onArticleClick={handleArticleClick} 
                                    isLoading={topStories.length === 0}
                                />
                            )}
                        </div>
                    </div>
                 )}
            </main>

            <Footer />
            <BackToTopButton />

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} onRegister={handleRegister} />
            <PremiumModal 
                isOpen={isPremiumModalOpen} 
                onClose={() => setPremiumModalOpen(false)} 
                onSubscribe={handleUpdateSubscription}
                currentPlan={user?.subscription || 'free'}
            />
            <SearchOverlay isOpen={isSearchOverlayOpen} onClose={() => setSearchOverlayOpen(false)} onSearch={handleSearch} />
            <CommandPalette 
                isOpen={isCommandPaletteOpen} 
                onClose={() => setCommandPaletteOpen(false)}
                onOpenSettings={handleSettingsClick}
                onOpenPremium={() => setPremiumModalOpen(true)}
                onOpenSearch={() => setSearchOverlayOpen(true)}
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