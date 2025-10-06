import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import Aside from './components/Aside';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import MobileMenu from './components/MobileMenu';
import { getInitialNews, searchNews } from './services/newsService';
import { Article, SearchResult } from './types';
import { useSettings } from './hooks/useSettings';
import { useAuth } from './hooks/useAuth';
import { NEWS_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [topStory, setTopStory] = useState<Article | null>(null);
  const [secondaryStories, setSecondaryStories] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { settings, setTheme, setPreferredCategories } = useSettings();
  const { isLoggedIn, login, logout, register } = useAuth();

  const fetchInitialNews = useCallback(async (categories: string[] = NEWS_CATEGORIES) => {
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    setIsSearching(false);
    try {
      // Use preferred categories if they exist, otherwise fetch from all
      const categoriesToFetch = categories.length > 0 ? categories : NEWS_CATEGORIES;
      const news = await getInitialNews(categoriesToFetch);
      setTopStory(news.topStory);
      setSecondaryStories(news.secondaryStories);
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialNews(settings.preferredCategories);
  }, [settings.preferredCategories, fetchInitialNews]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchInitialNews(settings.preferredCategories);
      return;
    }
    setIsLoading(true);
    setError(null);
    setIsSearching(true);
    try {
      const results = await searchNews(query);
      setSearchResults(results);
    } catch (err)
     {
      setError('Failed to perform search. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = () => {
    fetchInitialNews(settings.preferredCategories);
  }

  const handleLogin = (email: string) => {
    login(email);
    setAuthModalOpen(false);
  };

  const handleRegister = (email: string) => {
    register(email);
    setAuthModalOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    if (error) {
      return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    if (isSearching && searchResults) {
      return (
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-4 border-b-4 border-yellow-400 pb-2 text-gray-900 dark:text-white">Search Results</h1>
          <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">{searchResults.summary}</p>
          {searchResults.sources && searchResults.sources.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sources:</h2>
              <ul className="list-disc list-inside space-y-1">
                {searchResults.sources.map((source, index) => (
                  <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {source.title || source.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        {topStory && (
          <div className="p-4 md:p-8">
            <ArticleCard article={topStory} isTopStory={true} />
          </div>
        )}
        <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {secondaryStories.map((story, index) => (
            <ArticleCard key={index} article={story} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header 
        onSearch={handleSearch} 
        onLogoClick={handleLogoClick} 
        theme={settings.theme} 
        toggleTheme={setTheme}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogoutClick={logout}
        onSettingsClick={() => setSettingsModalOpen(true)}
        onMobileMenuClick={() => setMobileMenuOpen(prev => !prev)}
      />
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavClick={handleLogoClick}
      />
      <div className="max-w-screen-xl mx-auto grid grid-cols-12 gap-8">
        <main className="col-span-12 lg:col-span-9">
          {renderContent()}
        </main>
        <Aside />
      </div>
      <Footer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        setTheme={setTheme}
        setPreferredCategories={setPreferredCategories}
      />
    </div>
  );
};

export default App;