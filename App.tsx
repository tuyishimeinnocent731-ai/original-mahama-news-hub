import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import ArticleView from './components/ArticleView';
import Aside from './components/Aside';
import SearchOverlay from './components/SearchOverlay';
import SettingsPage from './pages/SettingsPage';
import CommandPalette from './components/CommandPalette';
import AuthModal from './components/AuthModal';
import PremiumModal from './components/PremiumModal';
import BackToTopButton from './components/BackToTopButton';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import SavedArticlesPage from './pages/SavedArticlesPage';
import InFeedAd from './components/InFeedAd';
import ReadingProgressBar from './components/ReadingProgressBar';
import MyAdsPage from './pages/MyAdsPage';

import * as newsService from './services/newsService';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useToast } from './contexts/ToastContext';
import { useKeyPress } from './hooks/useKeyPress';

import { Article } from './types';

type View = 'home' | 'article' | 'search' | 'saved' | 'settings' | 'my-ads';

function App() {
  const [view, setView] = useState<View>('home');
  const [articles, setArticles] = useState<Article[]>([]);
  const [asideArticles, setAsideArticles] = useState<Article[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('World');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isPremiumOpen, setPremiumOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const { user, login, logout, register, loading: authLoading, isLoggedIn, updateSubscription, saveArticle, unsaveArticle, isArticleSaved, updateProfile, createAd } = useAuth();
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
      const [fetchedArticles, topStories] = await Promise.all([
        newsService.getArticles(category),
        newsService.getTopStories()
      ]);
      setArticles(fetchedArticles);
      setAsideArticles(topStories);
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
    if(user?.subscription === 'free') {
        addToast('Upgrade to save articles for offline reading.', 'warning');
        setPremiumOpen(true);
        return;
    }
    if (isArticleSaved(article.id)) {
        unsaveArticle(article.id);
        addToast('Article removed from saved list.', 'info');
    } else {
        saveArticle(article);
        addToast('Article saved for offline reading!', 'success');
    }
  };

  const handleSubscribe = (plan: 'free' | 'standard' | 'premium' | 'pro') => {
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
          <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
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
            <div className="md:col-span-1">
              <Aside title="Related Stories" articles={relatedArticles} onArticleClick={handleArticleClick} userAds={user?.userAds} />
            </div>
          </div>
        ) : null;
      case 'saved':
        return (
          <div className="container mx-auto px-4 py-8">
            <SavedArticlesPage savedArticles={user?.savedArticles || []} onArticleClick={handleArticleClick} />
          </div>
        );
      case 'settings':
        return (
          <SettingsPage 
            user={user}
            onBack={() => setView('home')}
            updateProfile={updateProfile}
            onUpgradeClick={() => setPremiumOpen(true)}
          />
        );
      case 'my-ads':
        return (
            <MyAdsPage
                user={user}
                onBack={() => setView('home')}
                onCreateAd={(ad) => {
                    createAd(ad);
                    addToast('Advertisement created successfully!', 'success');
                }}
            />
        );
      case 'home':
      default:
        return (
          <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-yellow-500 capitalize">{currentCategory}</h1>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => <ArticleCardSkeleton key={i} layoutMode={settings.layoutMode} />)}
                </div>
              ) : (
                <div className={`grid grid-cols-1 ${settings.layoutMode === 'compact' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                  {articles.map((article, index) => (
                    <React.Fragment key={article.id}>
                      <ArticleCard article={article} onArticleClick={handleArticleClick} layoutMode={settings.layoutMode} />
                      {index === 2 && !isLoggedIn && <InFeedAd />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
             <div className="md:col-span-1">
                <Aside title="Top Stories" articles={asideArticles} onArticleClick={handleArticleClick} isLoading={isLoading} userAds={user?.userAds} />
            </div>
          </div>
        );
    }
  }, [view, selectedArticle, user, isArticleSaved, handleToggleSaveArticle, relatedArticles, handleArticleClick, articles, asideArticles, currentCategory, isLoading, settings.layoutMode, isLoggedIn, updateProfile, createAd, addToast]);
  
  return (
    <div className={`bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans text-base`}>
      <ReadingProgressBar />
      <Header
        onSearchClick={() => setSearchOpen(true)}
        onSettingsClick={() => setView('settings')}
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
        onMyAdsClick={() => setView('my-ads')}
      />
      
      <main className="flex-grow">
        {mainContent}
      </main>

      {view !== 'settings' && <Footer />}
      <BackToTopButton />

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} onSearch={handleSearch} />
      <AuthModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} onRegister={handleRegister} />
      {<PremiumModal isOpen={isPremiumOpen} onClose={() => setPremiumOpen(false)} onSubscribe={handleSubscribe} currentPlan={user?.subscription || 'free'} />}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)}
        onOpenSettings={() => setView('settings')}
        onOpenPremium={() => setPremiumOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />
    </div>
  );
}

export default App;