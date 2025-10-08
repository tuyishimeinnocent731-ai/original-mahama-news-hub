

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import LoadingSpinner from './components/LoadingSpinner';
import InteractiveSearchBar from './components/InteractiveSearchBar';
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
import SubAdminPage from './pages/SubAdminPage';
import Aside from './components/Aside';
import { NewspaperIcon } from './components/icons/NewspaperIcon';
import PaymentModal from './components/PaymentModal';
import VideoPage from './pages/VideoPage';
import LiveAssistantModal from './components/LiveAssistantModal';
import MyAdsPage from './pages/MyAdsPage';
import Pagination from './components/Pagination';

import * as newsService from './services/newsService';
import * as navigationService from './services/navigationService';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useToast } from './contexts/ToastContext';
import { Article, Ad, SubscriptionPlan, PaymentRecord, NavLink } from './types';
import { API_URL } from './services/apiService';

type View = 'home' | 'article' | 'settings' | 'saved' | 'admin' | 'video' | 'my-ads' | 'sub-admin-management';

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
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopStoriesLoading, setIsTopStoriesLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('World');
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [view, setView] = useState<View>('home');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isPremiumModalOpen, setPremiumModalOpen] = useState(false);
  const [isTopStoriesDrawerOpen, setTopStoriesDrawerOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isLiveAssistantOpen, setLiveAssistantOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{plan: SubscriptionPlan, price: string} | null>(null);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
      siteName: 'Mahama News Hub',
      maintenanceMode: false
  });

  const auth = useAuth();
  useSettings();
  const { addToast } = useToast();

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
      await navigationService.saveSiteSettings(newSettings);
      setSiteSettings(prev => ({ ...prev, ...newSettings }));
      addToast('Site settings updated!', 'success');
  };

  const fetchArticles = useCallback(async (category: string, page: number = 1) => {
    setIsLoading(true);
    setView('home');
    setCurrentArticle(null);
    try {
      const { articles: fetchedArticles, totalPages: fetchedTotalPages } = await newsService.getArticles(category, page);
      setArticles(fetchedArticles);
      setCurrentCategory(category);
      setTotalPages(fetchedTotalPages);
      setCurrentPage(page);
    } catch (error) {
      addToast("Error fetching articles.", 'error');
    } finally {
      setIsLoading(false);
      window.scrollTo(0, 0);
    }
  }, [addToast]);

  const fetchAllContent = useCallback(async () => {
    setIsLoading(true);
    setIsTopStoriesLoading(true);

    try {
        const [stories, ads, links, categoryArticlesData, settings] = await Promise.all([
            newsService.getTopStories(),
            newsService.getAds(),
            navigationService.getNavLinks(),
            newsService.getArticles(currentCategory, 1),
            navigationService.getSiteSettings(),
        ]);
        
        setTopStories(stories);
        setAllAds(ads);
        setNavLinks(links);
        setArticles(categoryArticlesData.articles);
        setTotalPages(categoryArticlesData.totalPages);
        setCurrentPage(1);
        setSiteSettings(settings);

    } catch(err) {
        addToast("Failed to load initial content.", "error");
    } finally {
        setIsTopStoriesLoading(false);
        setIsLoading(false);
    }
    
    // Fetch all articles in background for admin panel/search filters
    newsService.getAllArticles().then(setAllArticles).catch(() => {});

  }, [currentCategory, addToast]);


  useEffect(() => {
    fetchAllContent();
  }, [auth.isLoggedIn]); // Refetch content on login/logout

  const handleArticleClick = (article: Article) => {
    setCurrentArticle(article);
    setView('article');
    window.scrollTo(0, 0);
  };
  
  const handleBackToHome = () => {
    setView('home');
    setCurrentArticle(null);
  }

    const handleSearch = async (query: string, filters: { category?: string; author?: string; tag?: string } = {}, page: number = 1) => {
        setSearchOpen(false);
        setIsLoading(true);
        setView('home');
        setCurrentArticle(null);
        try {
            const { articles: fetchedArticles, totalPages: fetchedTotalPages } = await newsService.searchArticles(query, filters, page);
            setArticles(fetchedArticles);
            setTotalPages(fetchedTotalPages);
            setCurrentPage(page);

            let categoryTitle = `Search Results`;
            if(query) categoryTitle += ` for "${query}"`;
            if(filters.tag) categoryTitle = `Articles tagged with "${filters.tag}"`;
            
            setCurrentCategory(categoryTitle);

        } catch (error) {
            addToast("Error searching articles.", 'error');
        } finally {
            setIsLoading(false);
            window.scrollTo(0, 0);
        }
    };
  
  const handleLoginSuccess = async (email: string, password?: string) => {
    if (await auth.login(email, password)) {
      setAuthModalOpen(false);
    }
  };
  
  const handleRegisterSuccess = async (email: string, password?: string) => {
    if (await auth.register(email, password)) {
      setAuthModalOpen(false);
    }
  };
  
  const handleCategorySelect = (category: string) => {
      if (category.toLowerCase() === 'video') {
          setView('video');
          setCurrentArticle(null);
          setCurrentCategory('Video');
      } else {
          fetchArticles(category, 1);
      }
  }

  const handlePageChange = (newPage: number) => {
    if (currentCategory.startsWith('Search Results')) {
        // Simple search pagination not implemented, just refetching category
        fetchArticles('World', newPage);
    } else {
        fetchArticles(currentCategory, newPage);
    }
  };

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

  const handleSubscriptionUpgrade = async (method: PaymentRecord['method']) => {
    if (selectedPlan) {
        await auth.upgradeSubscription(selectedPlan.plan, selectedPlan.price, method);
        setPaymentModalOpen(false);
        setSelectedPlan(null);
    }
  };

  const handleAddArticle = async (articleData: Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>) => {
    await newsService.addArticle(articleData);
    fetchAllContent();
    addToast('Article uploaded successfully!', 'success');
  };

  const handleUpdateArticle = async (articleId: string, articleData: Partial<Omit<Article, 'id'>>) => {
      await newsService.updateArticle(articleId, articleData);
      fetchAllContent();
      addToast('Article updated successfully!', 'success');
  }

  const handleDeleteArticle = async (articleId: string) => {
    await newsService.deleteArticle(articleId);
    fetchAllContent();
    addToast('Article deleted successfully.', 'success');
  };

  const handleAddAd = async (adData: Omit<Ad, 'id'>) => {
    await newsService.addAd(adData);
    fetchAllContent();
    addToast('Advertisement created successfully!', 'success');
  };
  
  const handleUpdateAd = async (adId: string, adData: Partial<Omit<Ad, 'id'>>) => {
      await newsService.updateAd(adId, adData);
      fetchAllContent();
      addToast('Advertisement updated successfully!', 'success');
  };

  const handleDeleteAd = async (adId: string) => {
    await newsService.deleteAd(adId);
    fetchAllContent();
    addToast('Advertisement deleted successfully.', 'success');
  };

  const handleAddUserAd = async (adData: Omit<Ad, 'id'>) => {
      await auth.addUserAd(adData);
      addToast('Your advertisement has been created!', 'success');
  }

  const handleDeleteUser = async (userId: string): Promise<boolean> => {
      // FIX: Wrap the call in a try/catch block to handle the promise and return a boolean as expected by the caller.
      try {
          await auth.deleteUser(userId);
          addToast('User deleted successfully.', 'success');
          return true;
      } catch (error: any) {
          addToast(error.message || 'Failed to delete user.', 'error');
          return false;
      }
  };

  const handleUpdateNavLinks = async (links: NavLink[]) => {
      await navigationService.saveNavLinks(links);
      setNavLinks(links);
      addToast('Navigation links updated successfully!', 'success');
  };
  
  const inFeedAd = allAds.length > 0 ? allAds[Math.floor(Math.random() * allAds.length)] : null;
  
  const processUrl = (url: string) => (url.startsWith('http') || url.startsWith('data:')) ? url : `${API_URL}${url}`;
  
  const articlesWithFullUrls = articles.map(a => ({...a, urlToImage: processUrl(a.urlToImage)}));
  const allArticlesWithFullUrls = allArticles.map(a => ({...a, urlToImage: processUrl(a.urlToImage)}));
  const topStoriesWithFullUrls = topStories.map(a => ({...a, urlToImage: processUrl(a.urlToImage)}));
  const currentArticleWithFullUrl = currentArticle ? {...currentArticle, urlToImage: processUrl(currentArticle.urlToImage)} : null;
  const allAdsWithFullUrls = allAds.map(ad => ({...ad, image: processUrl(ad.image)}));
  const inFeedAdWithFullUrl = inFeedAd ? {...inFeedAd, image: processUrl(inFeedAd.image)} : null;


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
        return currentArticleWithFullUrl && (
          <ArticleView 
            article={currentArticleWithFullUrl} 
            user={auth.user}
            onBack={handleBackToHome} 
            onArticleClick={handleArticleClick}
            onUpgradeClick={() => setPremiumModalOpen(true)}
            onLoginClick={() => setAuthModalOpen(true)}
            customAds={allAdsWithFullUrls}
            toggleSaveArticle={auth.toggleSaveArticle}
            onTagClick={(tag) => handleSearch('', { tag })}
          />
        );
      case 'settings':
        return auth.user && <SettingsPage user={auth.user} onUpgradeClick={() => setPremiumModalOpen(true)} onManageAdsClick={() => setView('my-ads')} />;
      case 'saved':
        const savedArticles = allArticlesWithFullUrls.filter(a => auth.isArticleSaved(a.id));
        return <SavedArticlesPage savedArticles={savedArticles} onArticleClick={handleArticleClick} />;
      case 'admin':
        return (auth.user?.role === 'admin' || auth.user?.role === 'sub-admin') && (
            <AdminPage 
                user={auth.user}
                allArticles={allArticlesWithFullUrls}
                allAds={allAdsWithFullUrls}
                navLinks={navLinks}
                onAddArticle={handleAddArticle}
                onUpdateArticle={handleUpdateArticle}
                onDeleteArticle={handleDeleteArticle}
                onAddAd={handleAddAd}
                onUpdateAd={handleUpdateAd}
                onDeleteAd={handleDeleteAd}
                getAllUsers={auth.getAllUsers}
                addUser={auth.addUser}
                updateUser={auth.updateUser}
                deleteUser={handleDeleteUser}
                siteSettings={siteSettings}
                onUpdateSiteSettings={updateSiteSettings}
                onUpdateNavLinks={handleUpdateNavLinks}
            />
        );
       case 'sub-admin-management':
          return (auth.user?.role === 'admin') && (
              <SubAdminPage
                  allArticles={allArticlesWithFullUrls}
                  onAddArticle={handleAddArticle}
                  onUpdateArticle={handleUpdateArticle}
                  onDeleteArticle={handleDeleteArticle}
                  onBack={() => setView('admin')}
              />
          );
       case 'video':
          return <VideoPage allArticles={allArticlesWithFullUrls} onArticleClick={handleArticleClick} />;
       case 'my-ads':
          return <MyAdsPage user={auth.user} onBack={handleBackToHome} onCreateAd={handleAddUserAd} />
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
                    ) : articlesWithFullUrls.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {articlesWithFullUrls.map((article, index) => (
                                <React.Fragment key={article.id}>
                                    <ArticleCard article={article} onArticleClick={handleArticleClick} />
                                    {index === 1 && inFeedAdWithFullUrl && <InFeedAd ad={inFeedAdWithFullUrl} />}
                                </React.Fragment>
                            ))}
                            </div>
                            {totalPages > 1 && (
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-secondary rounded-lg col-span-full">
                            <NewspaperIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                            <h2 className="text-xl font-semibold">No Articles Found</h2>
                            <p className="text-muted-foreground mt-2">
                                Try adjusting your search or check back later for new content.
                            </p>
                        </div>
                    )}
                </div>
                 <div className="md:col-span-4">
                    <Aside
                        title="Top Stories"
                        articles={topStoriesWithFullUrls}
                        onArticleClick={handleArticleClick}
                        isLoading={isTopStoriesLoading}
                        customAds={allAdsWithFullUrls}
                    />
                </div>
            </div>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans text-foreground">
        {siteSettings.maintenanceMode && <MaintenanceBanner />}
        <TopStoriesBanner articles={topStoriesWithFullUrls} onArticleClick={handleArticleClick} />
        <Header 
            siteName={siteSettings.siteName}
            navLinks={navLinks}
            user={auth.user}
            isLoggedIn={auth.isLoggedIn}
            onLoginClick={() => setAuthModalOpen(true)}
            onLogout={auth.logout}
            onSearchClick={() => setSearchOpen(true)}
            onCommandPaletteClick={() => setCommandPaletteOpen(true)}
            onMobileMenuClick={() => setMobileMenuOpen(true)}
            onTopStoriesClick={() => setTopStoriesDrawerOpen(true)}
            onLiveAssistantClick={() => setLiveAssistantOpen(true)}
            onCategorySelect={handleCategorySelect}
            onArticleClick={handleArticleClick}
            onSettingsClick={() => setView('settings')}
            onSavedClick={() => setView('saved')}
            onPremiumClick={() => setPremiumModalOpen(true)}
            onAdminClick={() => setView('admin')}
            onSubAdminClick={() => setView('sub-admin-management')}
        />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {renderMainContent()}
        </main>
        <Footer navLinks={navLinks} />
        <InteractiveSearchBar 
            isOpen={isSearchOpen} 
            onClose={() => setSearchOpen(false)} 
            onSearch={handleSearch} 
            onArticleSelect={handleArticleClick}
            topStories={topStoriesWithFullUrls}
            user={auth.user} 
            clearSearchHistory={auth.clearSearchHistory}
            allArticles={allArticlesWithFullUrls}
        />
        <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            navLinks={navLinks}
            onCategorySelect={handleCategorySelect}
            onSearch={(q) => handleSearch(q, {})}
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
        <LiveAssistantModal
            isOpen={isLiveAssistantOpen}
            onClose={() => setLiveAssistantOpen(false)}
        />
        <TopStoriesDrawer 
            isOpen={isTopStoriesDrawerOpen}
            onClose={() => setTopStoriesDrawerOpen(false)}
            articles={topStoriesWithFullUrls}
            onArticleClick={handleArticleClick}
        />
        <BackToTopButton />
    </div>
  );
};

export default App;
