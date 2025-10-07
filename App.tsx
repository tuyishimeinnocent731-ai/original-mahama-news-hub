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
import InFeedAd from './components/InFeedAd';
import TopStoriesBanner from './components/TopStoriesBanner';
import TopStoriesDrawer from './components/TopStoriesDrawer';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import AdminPage from './pages/AdminPage';
import Aside from './components/Aside';
import { NewspaperIcon } from './components/icons/NewspaperIcon';
import PaymentModal from './components/PaymentModal';
import TopStoriesFAB from './components/TopStoriesFAB'; // New Import

import * as newsService from './services/newsService';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useToast } from './contexts/ToastContext';
import { Article, Ad, SubscriptionPlan, PaymentRecord } from './types';

type View = 'home' | 'article' | 'settings' | 'saved' | 'admin';

interface SiteSettings {
  siteName: string;
  maintenanceMode: boolean;
}

const MaintenanceBanner = () => (
    <div className="bg-destructive text-center p-2 text-destructive-foreground font-semibold text-sm animate-pulse">
        Site is currently in maintenance mode. Some features may be unavailable for non-admin users.
    </div>
);

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [topStories, setTopStories] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopStoriesLoading, setIsTopStoriesLoading] = useState(true);
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
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{plan: SubscriptionPlan, price: string} | null>(null);


  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
      siteName: 'Mahama News Hub',
      maintenanceMode: false
  });

  const auth = useAuth();
  useSettings(); // Initialize settings hook
  const { addToast } = useToast();

  const updateSiteSettings = (newSettings: Partial<SiteSettings>) => {
      const updatedSettings = { ...siteSettings, ...newSettings };
      setSiteSettings(updatedSettings);
      localStorage.setItem('site-settings', JSON.stringify(updatedSettings));
      addToast('Site settings updated!', 'success');
  };

  useEffect(() => {
      try {
        const storedSettings = localStorage.getItem('site-settings');
        if (storedSettings) {
            setSiteSettings(JSON.parse(storedSettings));
        }
      } catch(e) { console.error("Could not load site settings", e)}
  }, []);

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

  const fetchAllContent = useCallback(async () => {
    setIsLoading(true);
    setIsTopStoriesLoading(true);
    const all = await newsService.getAllArticles();
    setAllArticles(all);
    const stories = await newsService.getTopStories();
    setTopStories(stories);
    setIsTopStoriesLoading(false);
    
    // Fetch current category articles after all articles are loaded
    const currentCategoryArticles = await newsService.getArticles(currentCategory);
    setArticles(currentCategoryArticles);
    setIsLoading(false);

    const ads = await newsService.getAds();
    setAllAds(ads);
  }, [currentCategory]);


  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

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
  
  const handleRegisterSuccess = (email: string, password?: string) => {
    if (auth.register(email, password)) {
      setAuthModalOpen(false);
    }
  };
  
  const handleCategorySelect = (category: string) => {
      fetchArticles(category);
  }

  const handleOpenPaymentModal = (plan: SubscriptionPlan, price: string) => {
    if (!auth.user) {
        setAuthModalOpen(true);
        addToast('Please log in to subscribe.', 'info');
        return;
    }
    setSelectedPlan({ plan, price });
    setPremiumModalOpen(false);
    setPaymentModalOpen(true);
  };

  const handleSubscriptionUpgrade = (method: PaymentRecord['method']) => {
    if (selectedPlan) {
        auth.upgradeSubscription(selectedPlan.plan, selectedPlan.price, method);
        setPaymentModalOpen(false);
        setSelectedPlan(null);
    }
  };

  // --- Admin Handlers ---
  const handleAddArticle = (articleData: Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>) => {
    newsService.addArticle(articleData);
    fetchAllContent();
    addToast('Article uploaded successfully!', 'success');
  };

  const handleUpdateArticle = (articleId: string, articleData: Partial<Omit<Article, 'id'>>) => {
      newsService.updateArticle(articleId, articleData);
      fetchAllContent();
      addToast('Article updated successfully!', 'success');
  }

  const handleDeleteArticle = (articleId: string) => {
    newsService.deleteArticle(articleId);
    fetchAllContent();
    addToast('Article deleted successfully.', 'success');
  };

  const handleAddAd = (adData: Omit<Ad, 'id'>) => {
    newsService.addAd(adData);
    fetchAllContent();
    addToast('Advertisement created successfully!', 'success');
  };
  
  const handleUpdateAd = (adId: string, adData: Partial<Omit<Ad, 'id'>>) => {
      newsService.updateAd(adId, adData);
      fetchAllContent();
      addToast('Advertisement updated successfully!', 'success');
  };

  const handleDeleteAd = (adId: string) => {
    newsService.deleteAd(adId);
    fetchAllContent();
    addToast('Advertisement deleted successfully.', 'success');
  };

  const handleDeleteUser = (email: string): boolean => {
      return auth.deleteUser(email);
  };

  const inFeedAd = allAds.length > 0
    ? allAds[Math.floor(Math.random() * allAds.length)]
    : null;


  const renderMainContent = () => {
    if (siteSettings.maintenanceMode && auth.user?.role !== 'admin') {
         return (
            <div className="text-center py-20 bg-secondary rounded-lg col-span-full">
                <NewspaperIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Under Maintenance</h2>
                <p className="text-muted-foreground mt-2">
                    We are currently performing maintenance. Please check back later.
                </p>
            </div>
        );
    }

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
            customAds={allAds}
          />
        );
      case 'settings':
        return auth.user && <SettingsPage user={auth.user} {...auth} onUpgradeClick={() => setPremiumModalOpen(true)} />;
      case 'saved':
        const savedArticles = allArticles.filter(a => auth.isArticleSaved(a.id));
        return <SavedArticlesPage savedArticles={savedArticles} onArticleClick={handleArticleClick} />;
      case 'admin':
        return (auth.user?.role === 'admin' || auth.user?.role === 'sub-admin') && (
            <AdminPage 
                user={auth.user}
                allArticles={allArticles}
                allAds={allAds}
                onAddArticle={handleAddArticle}
                onUpdateArticle={handleUpdateArticle}
                onDeleteArticle={handleDeleteArticle}
                onAddAd={handleAddAd}
                onUpdateAd={handleUpdateAd}
                onDeleteAd={handleDeleteAd}
                getAllUsers={auth.getAllUsers}
                updateUserRole={auth.updateUserRole}
                deleteUser={handleDeleteUser}
                siteSettings={siteSettings}
                onUpdateSiteSettings={updateSiteSettings}
            />
        );
      case 'home':
      default:
        return (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8">
                    <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-accent">{currentCategory}</h1>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
                        </div>
                    ) : articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {articles.map((article, index) => (
                            <React.Fragment key={article.id}>
                                <ArticleCard article={article} onArticleClick={handleArticleClick} />
                                {index === 1 && inFeedAd && <InFeedAd ad={inFeedAd} />}
                            </React.Fragment>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-secondary rounded-lg col-span-full">
                            <NewspaperIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                            <h2 className="text-xl font-semibold">No Articles Published Yet</h2>
                            <p className="text-muted-foreground mt-2">
                                Admins are working on it. Please check back later for the latest news.
                            </p>
                        </div>
                    )}
                </div>
                 <div className="md:col-span-4">
                    <Aside
                        title="Top Stories"
                        articles={topStories}
                        onArticleClick={handleArticleClick}
                        isLoading={isTopStoriesLoading}
                        customAds={allAds}
                    />
                </div>
            </div>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans text-foreground">
        {siteSettings.maintenanceMode && <MaintenanceBanner />}
        <TopStoriesBanner articles={topStories} onArticleClick={handleArticleClick} />
        <Header 
            siteName={siteSettings.siteName}
            user={auth.user}
            isLoggedIn={auth.isLoggedIn}
            onLoginClick={() => setAuthModalOpen(true)}
            onLogout={auth.logout}
            onSearchClick={() => setSearchOpen(true)}
            onCommandPaletteClick={() => setCommandPaletteOpen(true)}
            onTopStoriesClick={() => setTopStoriesDrawerOpen(true)}
            onCategorySelect={handleCategorySelect}
            onArticleClick={handleArticleClick}
            onSettingsClick={() => setView('settings')}
            onSavedClick={() => setView('saved')}
            onPremiumClick={() => setPremiumModalOpen(true)}
            onAdminClick={() => setView('admin')}
        />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {renderMainContent()}
        </main>
        <Footer />
        <SearchOverlay isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} onSearch={handleSearch} user={auth.user} clearSearchHistory={auth.clearSearchHistory} />
        <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            onCategorySelect={handleCategorySelect}
            onSearch={handleSearch}
            user={auth.user}
            onLoginClick={() => setAuthModalOpen(true)}
            onLogout={auth.logout}
            onSettingsClick={() => setView('settings')}
        />
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
        <PremiumModal 
            isOpen={isPremiumModalOpen} 
            onClose={() => setPremiumModalOpen(false)} 
            onSubscribeClick={handleOpenPaymentModal}
        />
        {selectedPlan && (
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                planName={selectedPlan.plan.charAt(0).toUpperCase() + selectedPlan.plan.slice(1)}
                price={selectedPlan.price}
                onPaymentSuccess={handleSubscriptionUpgrade}
            />
        )}
        <TopStoriesDrawer 
            isOpen={isTopStoriesDrawerOpen}
            onClose={() => setTopStoriesDrawerOpen(false)}
            articles={topStories}
            onArticleClick={handleArticleClick}
        />
        <TopStoriesFAB onOpen={() => setTopStoriesDrawerOpen(true)} />
        <BackToTopButton />
    </div>
  );
};

export default App;