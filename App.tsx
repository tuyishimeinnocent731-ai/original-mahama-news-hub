import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import LoadingSpinner from './components/LoadingSpinner';
import SearchOverlay from './components/SearchOverlay';
import MobileMenu from './components/MobileMenu';
import CommandPalette from './components/CommandPalette';
import BackToTopButton from './components/BackToTopButton';
import AuthModal from './components/AuthModal';
import PremiumModal from './components/PremiumModal';
import SettingsPage from './pages/SettingsPage';
import ArticleView from './components/ArticleView';
import SavedArticlesPage from './pages/SavedArticlesPage';
import MyAdsPage from './pages/MyAdsPage';
import InFeedAd from './components/InFeedAd';
import TopStoriesBanner from './components/TopStoriesBanner';
import TopStoriesDrawer from './components/TopStoriesDrawer';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import AdminPage from './pages/AdminPage';
import Aside from './components/Aside';

import * as newsService from './services/newsService';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useToast } from './contexts/ToastContext';
import { Article } from './types';

type View = 'home' | 'article' | 'settings' | 'saved' | 'my-ads' | 'admin';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [topStories, setTopStories] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('World');
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [view, setView] = useState<View>('home');
  
  // Modals and Overlays state
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isPremiumModalOpen, setPremiumModalOpen] = useState(false);
  const [isTopStoriesDrawerOpen, setTopStoriesDrawerOpen] = useState(false);

  const auth = useAuth();
  useSettings(); // Initialize settings hook
  const { addToast } = useToast();

  const fetchArticles = useCallback(async (category: string, isSearch: boolean = false) => {
    setIsLoading(true);
    setView('home');
    setCurrentArticle(null);
    try {
      let fetchedArticles;
      if (isSearch) {
        fetchedArticles = await newsService.searchArticles(category);
        auth.addSearchHistory(category);
      } else {
        fetchedArticles = await newsService.getArticles(category);
      }
      setArticles(fetchedArticles);
      setCurrentCategory(category);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
      window.scrollTo(0, 0);
    }
  }, [auth]);

  const fetchAllArticles = useCallback(async () => {
    const all = await newsService.getAllArticles();
    setAllArticles(all);
  }, []);

  useEffect(() => {
    fetchArticles('World');
    newsService.getTopStories().then(setTopStories);
    fetchAllArticles();
  }, [fetchArticles, fetchAllArticles]);

  const handleArticleClick = (article: Article) => {
    setCurrentArticle(article);
    setView('article');
    window.scrollTo(0, 0);
  };
  
  const handleBackToHome = () => {
    setView('home');
    setCurrentArticle(null);
  }

  const handleSearch = (query: string) => {
    setSearchOpen(false);
    fetchArticles(query, true);
  };
  
  const handleLoginSuccess = (email: string, password?: string) => {
    if (auth.login(email, password)) {
      setAuthModalOpen(false);
    }
  };
  
  const handleRegisterSuccess = (email: string) => {
    if (auth.register(email)) {
      setAuthModalOpen(false);
    }
  };
  
  const handleCategorySelect = (category: string) => {
      fetchArticles(category);
  }

  const handleAddArticle = (articleData: Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>) => {
    newsService.addArticle(articleData);
    fetchAllArticles(); // Refresh the list of all articles
    addToast('Article uploaded successfully!', 'success');
  };

  const handleDeleteArticle = (articleId: string) => {
    newsService.deleteArticle(articleId);
    fetchAllArticles(); // Refresh the list of all articles
    setArticles(prev => prev.filter(a => a.id !== articleId)); // Also update current view
    addToast('Article deleted successfully.', 'success');
  };

  const customAds = auth.user?.subscription === 'pro' ? auth.user.userAds : [];

  const renderMainContent = () => {
    switch(view) {
      case 'article':
        return currentArticle && (
          <ArticleView 
            article={currentArticle} 
            user={auth.user}
            onBack={handleBackToHome} 
            onArticleClick={handleArticleClick}
            onUpgradeClick={() => setPremiumModalOpen(true)}
            onLoginClick={() => setAuthModalOpen(true)}
            customAds={customAds}
          />
        );
      case 'settings':
        return auth.user && <SettingsPage user={auth.user} {...auth} onUpgradeClick={() => setPremiumModalOpen(true)} onMyAdsClick={() => setView('my-ads')} />;
      case 'saved':
        const savedArticles = allArticles.filter(a => auth.isArticleSaved(a.id));
        return <SavedArticlesPage savedArticles={savedArticles} onArticleClick={handleArticleClick} />;
      case 'my-ads':
        return <MyAdsPage user={auth.user} onBack={handleBackToHome} onCreateAd={auth.createAd} />
      case 'admin':
        return auth.user?.role === 'admin' && (
            <AdminPage 
                user={auth.user}
                allArticles={allArticles}
                onAddArticle={handleAddArticle}
                onDeleteArticle={handleDeleteArticle}
                getAllUsers={auth.getAllUsers}
                toggleAdminRole={auth.toggleAdminRole}
            />
        );
      case 'home':
      default:
        return (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8">
                    <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-yellow-500">{currentCategory}</h1>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {articles.map((article, index) => (
                            <React.Fragment key={article.id}>
                            <ArticleCard article={article} onArticleClick={handleArticleClick} />
                            {index === 1 && <InFeedAd />}
                            </React.Fragment>
                        ))}
                        </div>
                    )}
                </div>
                 <div className="md:col-span-4">
                    <Aside
                        title="Top Stories"
                        articles={topStories}
                        onArticleClick={handleArticleClick}
                        isLoading={topStories.length === 0}
                        customAds={customAds}
                    />
                </div>
            </div>
        );
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
        <TopStoriesBanner articles={topStories} onArticleClick={handleArticleClick} />
        <Header 
            user={auth.user}
            isLoggedIn={auth.isLoggedIn}
            onLoginClick={() => setAuthModalOpen(true)}
            onLogout={auth.logout}
            onSearchClick={() => setSearchOpen(true)}
            onCommandPaletteClick={() => setCommandPaletteOpen(true)}
            onTopStoriesClick={() => setMobileMenuOpen(true)} // Changed to open mobile menu on smaller screens
            onCategorySelect={handleCategorySelect}
            onArticleClick={handleArticleClick}
            onSettingsClick={() => setView('settings')}
            onSavedClick={() => setView('saved')}
            onPremiumClick={() => setPremiumModalOpen(true)}
            onMyAdsClick={() => setView('my-ads')}
            onAdminClick={() => setView('admin')}
        />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {renderMainContent()}
        </main>
        <Footer />
        <SearchOverlay isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} onSearch={handleSearch} user={auth.user} clearSearchHistory={auth.clearSearchHistory} />
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onCategorySelect={handleCategorySelect} />
        <CommandPalette 
            isOpen={isCommandPaletteOpen} 
            onClose={() => setCommandPaletteOpen(false)}
            onOpenSettings={() => { setView('settings'); }}
            onOpenPremium={() => { setPremiumModalOpen(true); }}
            onOpenSearch={() => { setSearchOpen(true); }}
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          onLogin={handleLoginSuccess}
          onRegister={handleRegisterSuccess}
        />
        <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setPremiumModalOpen(false)} />
        <TopStoriesDrawer 
            isOpen={isTopStoriesDrawerOpen}
            onClose={() => setTopStoriesDrawerOpen(false)}
            articles={topStories}
            onArticleClick={handleArticleClick}
        />
        <BackToTopButton />
    </div>
  );
};

export default App;
