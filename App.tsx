


import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleView from './components/ArticleView';
import SavedArticlesPage from './pages/SavedArticlesPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import SubAdminPage from './pages/SubAdminPage';
import MyAdsPage from './pages/MyAdsPage';
import PremiumPage from './pages/PremiumPage';
import NotificationsPage from './pages/NotificationsPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import VideoPage from './pages/VideoPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import AuthModal from './components/AuthModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import PremiumModal from './components/PremiumModal';
import PaymentModal from './components/PaymentModal';
import InteractiveSearchBar from './components/InteractiveSearchBar';
import CommandPalette from './components/CommandPalette';
import TopStoriesDrawer from './components/TopStoriesDrawer';
import TopStoriesBanner from './components/TopStoriesBanner';
import LiveAssistantModal from './components/LiveAssistantModal';
import BackToTopButton from './components/BackToTopButton';
import LoadingSpinner from './components/LoadingSpinner';
import Aside from './components/Aside';
import { NewspaperIcon } from './components/icons/NewspaperIcon';


import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useToast } from './contexts/ToastContext';
import * as newsService from './services/newsService';
import * as userService from './services/userService';
import * as navigationService from './services/navigationService';
import * as paymentService from './services/paymentService';

import { Article, Ad, NavLink, SubscriptionPlan } from './types';
import ArticleCard from './components/ArticleCard';
import Pagination from './components/Pagination';
import { ArticleFormData } from './components/admin/ArticleManager';

declare const google: any;

const HomePage: React.FC<{
    articles: Article[],
    onArticleClick: (article: Article) => void,
    isLoading: boolean
}> = ({ articles, onArticleClick, isLoading }) => {
    if (isLoading) {
        return <div className="flex justify-center items-center py-20"><LoadingSpinner /></div>;
    }
    if (articles.length === 0) {
        return (
            <div className="text-center py-20 bg-secondary rounded-lg">
                <NewspaperIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">No Articles Found</h2>
                <p className="text-muted-foreground mt-2">
                    There are no articles to display at the moment. This may be due to a server issue.
                </p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map(article => (
                <ArticleCard key={article.id} article={article} onArticleClick={onArticleClick} />
            ))}
        </div>
    );
};


const App: React.FC = () => {
    // Page/View State
    const [view, setView] = useState('home');
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [currentCategory, setCurrentCategory] = useState('World');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilters, setSearchFilters] = useState({});

    // Modal State
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Data State
    const [articles, setArticles] = useState<Article[]>([]);
    const [allArticles, setAllArticles] = useState<Article[]>([]);
    const [allAds, setAllAds] = useState<Ad[]>([]);
    const [topStories, setTopStories] = useState<Article[]>([]);
    const [navLinks, setNavLinks] = useState<NavLink[]>([]);
    const [siteSettings, setSiteSettings] = useState({ siteName: 'Mahama News Hub', maintenanceMode: false });
    const [isLoading, setIsLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    
    // Hooks
    const { user, login, logout, register, refreshUser, loginWithGoogle } = useAuth();
    const { isInitialized: isSettingsInitialized } = useSettings();
    const { addToast } = useToast();

    const fetchArticles = useCallback(async (category: string, page: number) => {
        setIsLoading(true);
        try {
            const data = await newsService.getArticles(category, page);
            setArticles(data.articles);
            setTotalPages(data.totalPages);
            setCurrentPage(page);
        } catch (error) {
            addToast('Failed to fetch articles.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);
    
    const handleCategorySelect = useCallback((category: string) => {
        setSearchQuery('');
        setSearchFilters({});
        setCurrentCategory(category);
        setCurrentPage(1);
        setView('home');
        onCloseAllModals();
    }, []);
    
    const handleGoogleCredentialResponse = useCallback(async (response: any) => {
        const success = await loginWithGoogle(response.credential);
        if (success) {
            onCloseAllModals();
            handleCategorySelect('World');
        }
    }, [loginWithGoogle, handleCategorySelect]);


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('token') && urlParams.get('token')) {
            setView('reset-password');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        if (typeof google !== 'undefined' && process.env.GOOGLE_CLIENT_ID) {
            google.accounts.id.initialize({
                client_id: process.env.GOOGLE_CLIENT_ID,
                callback: handleGoogleCredentialResponse
            });
        }

        const initialLoad = async () => {
            setIsLoading(true);
            try {
                const [
                    initialArticles,
                    top,
                    ads,
                    allAdminArticles,
                    links,
                    settings
                ] = await Promise.all([
                    newsService.getArticles(currentCategory, currentPage),
                    newsService.getTopStories(),
                    newsService.getAds(),
                    user?.role === 'admin' || user?.role === 'sub-admin' ? newsService.getAllArticles() : Promise.resolve([]),
                    navigationService.getNavLinks(),
                    navigationService.getSiteSettings(),
                ]);
                setArticles(initialArticles.articles);
                setTotalPages(initialArticles.totalPages);
                setTopStories(top);
                setAllAds(ads);
                setAllArticles(allAdminArticles);
                setNavLinks(links);
                setSiteSettings(settings);
            } catch (error) {
                console.error("Initial data load failed:", error);
                addToast("Could not load initial data.", 'error');
            } finally {
                setIsLoading(false);
            }
        };
        initialLoad();
    }, [user?.role, handleGoogleCredentialResponse]);

    useEffect(() => {
        if (view === 'home' && !searchQuery) {
            fetchArticles(currentCategory, currentPage);
        }
    }, [currentCategory, currentPage, view, searchQuery, fetchArticles]);
    
     const handleSearch = useCallback(async (query: string, filters: object, page: number = 1) => {
        setIsLoading(true);
        setView('home'); // Ensure we are on the home view for search results
        setSearchQuery(query);
        setSearchFilters(filters);
        onCloseAllModals();
        try {
            const data = await newsService.searchArticles(query, filters, page);
            setArticles(data.articles);
            setTotalPages(data.totalPages);
            setCurrentPage(page);
        } catch (error) {
            addToast('Search failed.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    const handlePageChange = (page: number) => {
        if (searchQuery) {
            handleSearch(searchQuery, searchFilters, page);
        } else {
            setCurrentPage(page);
        }
    };

    const handleArticleClick = (article: Article) => {
        setCurrentArticle(article);
        setView('article');
        onCloseAllModals();
    };

    const handleBack = () => {
        setView('home');
        setCurrentArticle(null);
    };

    const onCloseAllModals = () => setActiveModal(null);

    const handleLoginAndRedirect = async (email: string, password: string) => {
        const success = await login(email, password);
        if (success) {
            handleCategorySelect('World');
        }
        return success;
    };

    const handleRegisterAndRedirect = async (name: string, email: string, password: string) => {
        const success = await register(name, email, password);
        if (success) {
            handleCategorySelect('World');
        }
        return success;
    };
    
    // Admin Actions
    const handleAddArticle = async (data: ArticleFormData) => {
        try {
            await newsService.addArticle(data);
            addToast('Article added successfully!', 'success');
            const all = await newsService.getAllArticles();
            setAllArticles(all);
        } catch (error: any) { addToast(error.message, 'error'); }
    };
    const handleUpdateArticle = async (id: string, data: Partial<Omit<Article, 'id'>>) => {
        try {
            await newsService.updateArticle(id, data);
            addToast('Article updated successfully!', 'success');
            const all = await newsService.getAllArticles();
            setAllArticles(all);
        } catch (error: any) { addToast(error.message, 'error'); }
    };
    const handleDeleteArticle = async (id: string) => {
        try {
            await newsService.deleteArticle(id);
            addToast('Article deleted!', 'success');
            setAllArticles(prev => prev.filter(a => a.id !== id));
        } catch (error: any) { addToast(error.message, 'error'); }
    };
    
    const renderView = () => {
        switch (view) {
            case 'article': return <ArticleView article={currentArticle!} user={user} onBack={handleBack} onArticleClick={handleArticleClick} onUpgradeClick={() => setActiveModal('premium')} onLoginClick={() => setActiveModal('auth')} toggleSaveArticle={async (article) => { await userService.toggleSavedArticle(article.id); refreshUser(); }} onTagClick={(tag) => handleSearch('', {tag}, 1)} customAds={allAds} />;
            case 'saved': return <SavedArticlesPage savedArticles={[]} onArticleClick={handleArticleClick} />;
            case 'settings': return <SettingsPage user={user!} onUpgradeClick={() => setActiveModal('premium')} onManageAdsClick={() => setView('my-ads')} />;
            case 'admin': return <AdminPage user={user!} allArticles={allArticles} allAds={allAds} navLinks={navLinks} onAddArticle={handleAddArticle} onUpdateArticle={handleUpdateArticle} onDeleteArticle={handleDeleteArticle} onAddAd={async (data) => { await newsService.addAd(data); setAllAds(await newsService.getAds()); }} onUpdateAd={async (id, data) => { await newsService.updateAd(id, data); setAllAds(await newsService.getAds()); }} onDeleteAd={async (id) => { await newsService.deleteAd(id); setAllAds(await newsService.getAds()); }} getAllUsers={userService.getAllUsers} addUser={async (data) => { try { await userService.addUser(data); addToast('User added', 'success'); return true; } catch(e) { addToast((e as Error).message, 'error'); return false; } }} updateUser={async (id, data) => { try { await userService.updateUser(id, data); addToast('User updated', 'success'); return true; } catch(e) { addToast((e as Error).message, 'error'); return false; } }} deleteUser={async (id) => { try { await userService.deleteUser(id); addToast('User deleted', 'success'); return true; } catch(e) { addToast((e as Error).message, 'error'); return false; } }} siteSettings={siteSettings} onUpdateSiteSettings={async (newSettings) => { await navigationService.saveSiteSettings(newSettings); setSiteSettings(s => ({...s, ...newSettings})); addToast('Settings saved', 'success'); }} onUpdateNavLinks={async (links) => { await navigationService.saveNavLinks(links); setNavLinks(links); addToast('Navigation saved', 'success'); }} />;
            case 'sub-admin': return <SubAdminPage allArticles={allArticles} onAddArticle={handleAddArticle} onUpdateArticle={handleUpdateArticle} onDeleteArticle={handleDeleteArticle} onBack={() => setView('admin')} />;
            case 'my-ads': return <MyAdsPage user={user} onBack={() => setView('settings')} onCreateAd={async (data) => { await newsService.addAd(data); addToast('Ad created!', 'success'); refreshUser(); }} />;
            case 'premium': return <PremiumPage />;
            case 'notifications': return <NotificationsPage onNotificationCountChange={setUnreadNotifications} />;
            case 'about-us': return <AboutUsPage />;
            case 'contact-us': return <ContactUsPage />;
            case 'video': return <VideoPage allArticles={allArticles} onArticleClick={handleArticleClick} />;
            case 'payment-success': return <PaymentSuccessPage onContinue={() => { refreshUser(); setView('home'); }} />;
            case 'payment-cancel': return <PaymentCancelPage onBack={() => setView('home')} onTryAgain={() => setActiveModal('premium')} />;
            case 'reset-password': return <ResetPasswordPage onSuccess={() => { setView('home'); setActiveModal('auth'); }} />;
            case 'home':
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-8">
                            <HomePage articles={articles} onArticleClick={handleArticleClick} isLoading={isLoading} />
                            {totalPages > 1 && !isLoading && articles.length > 0 && (
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                            )}
                        </div>
                        <div className="md:col-span-4">
                            <Aside
                                title="Top Stories"
                                articles={topStories}
                                onArticleClick={handleArticleClick}
                                isLoading={isLoading}
                                customAds={allAds}
                            />
                        </div>
                    </div>
                );
        }
    };
    
    if (!isSettingsInitialized) {
        return <div className="h-screen w-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <TopStoriesBanner articles={topStories} onArticleClick={handleArticleClick} />
            <Header
                user={user}
                isLoggedIn={!!user}
                navLinks={navLinks}
                unreadNotifications={unreadNotifications}
                onLoginClick={() => setActiveModal('auth')}
                onLogout={logout}
                onSearchClick={() => setActiveModal('search')}
                onCommandPaletteClick={() => setActiveModal('command')}
                onMobileMenuClick={() => setActiveModal('mobile-menu')}
                onTopStoriesClick={() => setActiveModal('top-stories')}
                onLiveAssistantClick={() => setActiveModal('live-assistant')}
                onSettingsClick={() => setView('settings')}
                onSavedClick={() => setView('saved')}
                onNotificationsClick={() => setView('notifications')}
                onPremiumClick={() => setActiveModal('premium')}
                onAdminClick={() => setView('admin')}
                onSubAdminClick={() => setView('sub-admin')}
                onCategorySelect={handleCategorySelect}
                onArticleClick={handleArticleClick}
                siteName={siteSettings.siteName}
            />
            <main className="container mx-auto px-4 py-8 flex-grow">
                {renderView()}
            </main>
            <Footer navLinks={navLinks} onAboutClick={() => setView('about-us')} onContactClick={() => setView('contact-us')} />
            <BackToTopButton />

            {/* Modals & Overlays */}
            {activeModal === 'auth' && <AuthModal isOpen={true} onClose={onCloseAllModals} onLogin={handleLoginAndRedirect} onRegister={handleRegisterAndRedirect} onForgotPasswordClick={() => setActiveModal('forgot-password')} onGoogleLogin={() => {
                if (process.env.GOOGLE_CLIENT_ID) {
                    google.accounts.id.prompt();
                } else {
                    addToast('Google Sign-In is not configured.', 'error');
                }
            }}/>}
            {activeModal === 'forgot-password' && <ForgotPasswordModal isOpen={true} onClose={onCloseAllModals} onSuccess={onCloseAllModals} />}
            {activeModal === 'premium' && <PremiumModal isOpen={true} onClose={onCloseAllModals} onSubscribeClick={async (plan) => { if(user) { try { await paymentService.createCheckoutSession(plan); } catch(e) { addToast((e as Error).message, 'error'); } } else { setActiveModal('auth'); } }} />}
            {activeModal === 'payment' && <PaymentModal isOpen={true} onClose={onCloseAllModals} planName="Premium" price="$9.99/mo" onPaymentSuccess={(method) => { console.log(method); onCloseAllModals(); addToast('Subscribed successfully!', 'success'); refreshUser(); }} />}
            {activeModal === 'search' && <InteractiveSearchBar isOpen={true} onClose={onCloseAllModals} onSearch={handleSearch} onArticleSelect={handleArticleClick} user={user} clearSearchHistory={() => { userService.clearSearchHistory(); refreshUser(); }} topStories={topStories} allArticles={allArticles} />}
            {activeModal === 'command' && <CommandPalette isOpen={true} onClose={onCloseAllModals} onOpenSettings={() => { setView('settings'); onCloseAllModals(); }} onOpenPremium={() => setActiveModal('premium')} onOpenSearch={() => setActiveModal('search')} />}
            {activeModal === 'top-stories' && <TopStoriesDrawer isOpen={true} onClose={onCloseAllModals} articles={topStories} onArticleClick={handleArticleClick} />}
            {activeModal === 'live-assistant' && <LiveAssistantModal isOpen={true} onClose={onCloseAllModals} />}
        </div>
    );
};

export default App;