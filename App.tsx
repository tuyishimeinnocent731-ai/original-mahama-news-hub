import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import ArticleViewModal from './components/ArticleViewModal';
import SearchOverlay from './components/SearchOverlay';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import PremiumModal from './components/PremiumModal';
import BackToTopButton from './components/BackToTopButton';
import Aside from './components/Aside';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import { fetchNews } from './services/newsService';
import { Article } from './types';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [topStories, setTopStories] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('latest technology trends');

  // Modals state
  const [isArticleModalOpen, setArticleModalOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isPremiumModalOpen, setPremiumModalOpen] = useState(false);

  const { user, login, logout, register, subscribe, plan } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    document.documentElement.style.fontSize = settings.fontSize === 'sm' ? '14px' : settings.fontSize === 'lg' ? '18px' : '16px';
  }, [settings.fontSize]);

  useEffect(() => {
    const getNews = async () => {
      setLoading(true);
      const data = await fetchNews(searchQuery);
      setArticles(data.articles);
      setLoading(false);
    };
    getNews();
  }, [searchQuery]);
  
  useEffect(() => {
    const getTopStories = async () => {
      const data = await fetchNews('world top stories');
      setTopStories(data.articles.slice(0, 5));
    };
    getTopStories();
  }, []);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setArticleModalOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchOpen(false);
  };

  const mainContent = loading ? (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${settings.layoutMode === 'compact' ? 'xl:grid-cols-5' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
      {Array.from({ length: 10 }).map((_, index) => (
        <ArticleCardSkeleton key={index} layoutMode={settings.layoutMode} />
      ))}
    </div>
  ) : articles.length > 0 ? (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${settings.layoutMode === 'compact' ? 'xl:grid-cols-5' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
      {articles.map((article) => (
        <ArticleCard 
          key={article.id} 
          article={article} 
          onArticleClick={handleArticleClick}
          layoutMode={settings.layoutMode}
        />
      ))}
    </div>
  ) : (
    <div className="text-center py-20 col-span-full">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No articles found</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Try searching for something else.</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header
        onSearchClick={() => setSearchOpen(true)}
        onLoginClick={() => setAuthModalOpen(true)}
        onSettingsClick={() => setSettingsModalOpen(true)}
        onPremiumClick={() => setPremiumModalOpen(true)}
        user={user}
        logout={logout}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
         <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-9">
              <h1 className="text-3xl font-bold mb-6 capitalize">{searchQuery}</h1>
              {mainContent}
            </div>
            <div className="lg:col-span-3 mt-8 lg:mt-0">
               <Aside topStories={topStories} onArticleClick={handleArticleClick}/>
            </div>
         </div>
      </main>

      <Footer />

      <ArticleViewModal
        article={selectedArticle}
        isOpen={isArticleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        isPremium={plan === 'premium' || plan === 'standard'}
      />
      
      <SearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={(email) => { login(email); setAuthModalOpen(false); }}
        onRegister={(email) => { register(email); setAuthModalOpen(false); }}
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      <PremiumModal 
        isOpen={isPremiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        onSubscribe={(newPlan) => { subscribe(newPlan); setPremiumModalOpen(false); }}
        currentPlan={plan}
      />

      <BackToTopButton />
    </div>
  );
};

export default App;
