
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchNews } from './services/newsService';
import { Article } from './types';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import AuthModal from './components/AuthModal';
import ArticleViewModal from './components/ArticleViewModal';
import MobileMenu from './components/MobileMenu';
import Aside from './components/Aside';
import SettingsPage from './pages/SettingsPage';
import PremiumModal from './components/PremiumModal';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { settings } = useSettings();
  const [currentQuery, setCurrentQuery] = useState('latest world news');

  const { user, login, logout, register, subscribe, plan } = useAuth();

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isArticleModalOpen, setArticleModalOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPremiumModalOpen, setPremiumModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const handleSearch = useCallback(async (query: string, categories?: string[]) => {
    setLoading(true);
    setError(null);
    setArticles([]);
    setRoute('#');
    window.location.hash = '#';

    try {
      const finalQuery = categories && categories.length > 0
        ? `latest news on ${categories.join(', ')}`
        : query;
      const { articles: fetchedArticles } = await fetchNews(finalQuery);
      setArticles(fetchedArticles);
      setCurrentQuery(query);
    // FIX: Corrected syntax for the try-catch block.
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch('latest world news', settings.preferredCategories);
  }, [settings.preferredCategories, handleSearch]);

  const handleNavClick = (category: string) => {
    const query = category === 'home' ? 'latest world news' : `latest ${category} news`;
    handleSearch(query);
    setMobileMenuOpen(false);
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setArticleModalOpen(true);
  };
  
  const handleLogin = (email: string) => {
    login(email);
    setAuthModalOpen(false);
  };

  const handleRegister = (email: string) => {
    register(email);
    setAuthModalOpen(false);
  };
  
  const handleSubscribe = (newPlan: 'free' | 'standard' | 'premium') => {
    subscribe(newPlan);
    setPremiumModalOpen(false);
  }

  const trendingTopics = ["AI", "Elections 2024", "Climate Change", "Stock Market", "Global Economy"];

  return (
    <div className={`flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans ${settings.theme}`}>
      <Header
        onSearch={handleSearch}
        onNavClick={handleNavClick}
        onAuthClick={() => setAuthModalOpen(true)}
        onMobileMenuClick={() => setMobileMenuOpen(true)}
        isLoggedIn={!!user}
        onLogout={logout}
      />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {route === '#/settings' ? (
          <SettingsPage />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:flex-1">
                   <h1 className="text-3xl font-bold mb-6 capitalize border-b-4 border-yellow-500 pb-2">{currentQuery}</h1>
                  {loading && <LoadingSpinner />}
                  {error && <p className="text-red-500 text-center">{error}</p>}
                  {!loading && !error && (
                  <div className={`grid grid-cols-1 gap-6 ${settings.layoutMode === 'compact' ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                      {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} onArticleClick={handleArticleClick} layoutMode={settings.layoutMode}/>
                      ))}
                  </div>
                  )}
              </div>
              <Aside 
                  trendingTopics={trendingTopics}
                  topStories={articles}
                  onTopicClick={handleSearch}
                  onArticleClick={handleArticleClick}
                  onPremiumClick={() => setPremiumModalOpen(true)}
                  isPremium={plan !== 'free'}
              />
          </div>
        )}
      </main>
      <Footer />

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        onSubscribe={handleSubscribe}
        currentPlan={plan}
      />
      <ArticleViewModal
        isOpen={isArticleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        article={selectedArticle}
        fontSize={settings.fontSize}
        allArticles={articles}
        onSelectArticle={setSelectedArticle}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavClick={handleNavClick}
      />
    </div>
  );
};

export default App;
