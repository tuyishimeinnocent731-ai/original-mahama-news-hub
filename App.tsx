
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import ArticleView from './components/ArticleView';
import Aside from './components/Aside';
import SearchOverlay from './components/SearchOverlay';
import SettingsModal from './components/SettingsModal';
import CommandPalette from './components/CommandPalette';
import AuthModal from './components/AuthModal';
import PremiumModal from './components/PremiumModal';
import BackToTopButton from './components/BackToTopButton';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import SavedArticlesPage from './pages/SavedArticlesPage';
import InFeedAd from './components/InFeedAd';
import ReadingProgressBar from './components/ReadingProgressBar';

import * as newsService from './services/newsService';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useToast } from './contexts/ToastContext';
import { useKeyPress } from './hooks/useKeyPress';

import { Article } from './types';

type View = 'home' | 'article' | 'search' | 'saved' | 'premium' | 'settings';

function App() {
  const [view, setView] = useState<View>('home');
  const [articles, setArticles] = useState<Article[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('World');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isPremiumOpen, setPremiumOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const { user, login, logout, register, loading: authLoading, isLoggedIn, updateSubscription, saveArticle, unsaveArticle, isArticleSaved } = useAuth();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const cmdKPressed = useKeyPress('k', { metaKey: true });
  useEffect(() => {
    if (cmdKPressed) {
      setCommandPaletteOpen(p => !p);
    }
  }, [cmdKPressed]);

  const fetchArticles = useCallback(async (category: string) => {
    setIsLoading(true);
    try {
      const fetchedArticles = await newsService.getArticles(category);
      setArticles(fetchedArticles);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      addToast('Could not load articles. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const fetchRelatedArticles = useCallback(async (articleId: string, category: string) => {
    const fetchedRelated = await newsService.getRelatedArticles(articleId, category);
    setRelatedArticles(fetchedRelated);
  }, []);

  useEffect(() => {
    if (view === 'home' || view === 'search') {
        fetchArticles(currentCategory);
    }
  }, [currentCategory, view, fetchArticles]);

  const handleCategorySelect = (category: string) => {
    setCurrentCategory(category);
    setView('home');
    setSelectedArticle(null);
  };
  
  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    fetchRelatedArticles(article.id, article.category);
    setView('article');
    window.scrollTo(0, 0);
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchOpen(false);
    setView('home');
    const searchResults = await newsService.searchArticles(query);
    setArticles(searchResults);
    setCurrentCategory(`Results for "${query}"`);
    setIsLoading(false);
    addToast(`${searchResults.length} articles found for "${query}"`, 'info');
  };

  const handleLogin = (email: string) => {
    login(email);
    setLoginOpen(false);
    addToast(`Welcome back, ${email.split('@')[0]}!`, 'success');
  };

  const handleRegister = (email: string) => {
    register(email);
    setLoginOpen(false);
    addToast(`Account created successfully! Welcome, ${email.split('@')[0]}!`, 'success');
  };

  const handleLogout = () => {
    logout();
    addToast('You have been logged out.', 'info');
    setView('home');
  };

  const handleToggleSaveArticle = (article: Article) => {
    if (!isLoggedIn) {
        addToast('Please log in to save articles.', 'warning');
        setLoginOpen(true);
        return;
    }
    if (isArticleSaved(article.id)) {
        unsaveArticle(article.id);
        addToast('Article removed from saved list.', 'info');
    } else {
        saveArticle(article);
        addToast('Article saved!', 'success');
    }
  };

  const handleSubscribe = (plan: 'free' | 'standard' | 'premium') => {
    if (!user) {
        addToast('Please log in to subscribe.', 'warning');
        setLoginOpen(true);
        return;
    }
    updateSubscription(plan);
    setPremiumOpen(false);
    addToast(`Successfully subscribed to the ${plan} plan!`, 'success');
  }

  const handleHomeClick = () => {
    setView('home');
    setCurrentCategory('World');
    setSelectedArticle(null);
  }

  const mainContent = useMemo(() => {
    switch (view) {
      case 'article':
        return selectedArticle ? (
          <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ArticleView
                article={selectedArticle}
                user={user}
                onBack={() => setView('home')}
                onUpgradeClick={() => setPremiumOpen(true)}
                isArticleSaved={isArticleSaved}
                onToggleSave={handleToggleSaveArticle}
                relatedArticles={relatedArticles}
                onArticleClick={handleArticleClick}
              />
            </div>
            <div className="lg:col-span-1">
              <Aside title="Related Stories" articles={relatedArticles} onArticleClick={handleArticleClick} />
            </div>
          </div>
        ) : null;
      case 'saved':
        return (
          <div className="container mx-auto px-4 py-8">
            <SavedArticlesPage savedArticles={user?.savedArticles || []} onArticleClick={handleArticleClick} />
          </div>
        );
      case 'home':
      default:
        return (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-yellow-500 capitalize">{currentCategory}</h1>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} layoutMode={settings.layoutMode} />)}
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${settings.layoutMode === 'compact' ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {articles.map((article, index) => (
                  <React.Fragment key={article.id}>
                    <ArticleCard article={article} onArticleClick={handleArticleClick} layoutMode={settings.layoutMode} />
                    {index === 2 && !isLoggedIn && <InFeedAd />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        );
    }
  }, [view, selectedArticle, user, isArticleSaved, handleToggleSaveArticle, relatedArticles, handleArticleClick, articles, currentCategory, isLoading, settings.layoutMode, isLoggedIn]);
  
  return (
    <div className={`bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans text-base`}>
      <ReadingProgressBar />
      <Header
        onSearchClick={() => setSearchOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onLoginClick={() => setLoginOpen(true)}
        onCommandPaletteClick={() => setCommandPaletteOpen(true)}
        onCategorySelect={handleCategorySelect}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        onArticleClick={handleArticleClick}
        onHomeClick={handleHomeClick}
        onSavedClick={() => setView('saved')}
        onPremiumClick={() => setPremiumOpen(true)}
        authLoading={authLoading}
      />
      
      <main className="flex-grow">
        {mainContent}
      </main>

      <Footer />
      <BackToTopButton />

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} onSearch={handleSearch} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
      <AuthModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} onRegister={handleRegister} />
      {<PremiumModal isOpen={isPremiumOpen} onClose={() => setPremiumOpen(false)} onSubscribe={handleSubscribe} currentPlan={user?.subscription || 'free'} />}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPremium={() => setPremiumOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />
    </div>
  );
}

export default App;
