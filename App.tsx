
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import Aside from './components/Aside';
import ArticleViewModal from './components/ArticleViewModal';
import { getTopHeadlines, searchArticles, summarizeArticleWithGemini, searchNewsWithGrounding } from './services/newsService';
import { Article, GroundingChunk } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './hooks/useAuth';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import PremiumModal from './components/PremiumModal';
import { useSettings } from './hooks/useSettings';
import SearchOverlay from './components/SearchOverlay';
import ArticleCardSkeleton from './components/ArticleCardSkeleton';
import BackToTopButton from './components/BackToTopButton';
import { ToastProvider, useToast } from './contexts/ToastContext';
import CommandPalette from './components/CommandPalette';

const AppContent: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [topStories, setTopStories] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const [searchResult, setSearchResult] = useState<{ text: string; chunks: GroundingChunk[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);


  const { user, login, logout, register, subscriptionPlan, setSubscriptionPlan } = useAuth();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const isPremium = useMemo(() => subscriptionPlan === 'premium' || subscriptionPlan === 'standard', [subscriptionPlan]);

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const topHeadlines = await getTopHeadlines();
      setArticles(topHeadlines.slice(5));
      setTopStories(topHeadlines.slice(0, 5));
    } catch (err) {
      setError('Failed to fetch news articles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleArticleClick = useCallback(async (article: Article) => {
    setSelectedArticle(article);
    setIsArticleModalOpen(true);

    if (!article.keyPoints && (subscriptionPlan === 'standard' || subscriptionPlan === 'premium')) {
      setIsSummarizing(true);
      try {
        const keyPoints = await summarizeArticleWithGemini(article);
        setSelectedArticle(prev => prev ? { ...prev, keyPoints } : null);
        addToast("Summary generated successfully!", "success");
      } catch (e) {
        console.error("Failed to generate summary", e);
        addToast("Could not generate summary.", "error");
      } finally {
        setIsSummarizing(false);
      }
    }
  }, [subscriptionPlan, addToast]);

  const handleSearch = async (query: string) => {
    setIsSearchOverlayOpen(false);
    setIsLoading(true);
    setSearchResult(null);
    setArticles([]);
    setError(null);
    try {
        if(query.toLowerCase().includes('latest') || query.toLowerCase().includes('recent') || query.toLowerCase().includes('who won')) {
            setIsSearching(true);
            const result = await searchNewsWithGrounding(query);
            setSearchResult(result);
        } else {
            const results = await searchArticles(query);
            setArticles(results);
        }
    } catch (err) {
        setError(`Failed to search for "${query}".`);
        console.error(err);
    } finally {
        setIsLoading(false);
        setIsSearching(false);
    }
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setIsArticleModalOpen(false);
  };

  return (
    <div className={`bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans text-${settings.fontSize}`}>
      <Header
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={logout}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onUpgradeClick={() => setIsPremiumModalOpen(true)}
        onSearchClick={() => setIsSearchOverlayOpen(true)}
        onCommandPaletteClick={() => setIsCommandPaletteOpen(true)}
        subscriptionPlan={subscriptionPlan}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {isSearching && (
                 <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Search Results</h2>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <LoadingSpinner />
                        <p className="text-center mt-2">Searching with Google... this may take a moment.</p>
                    </div>
                 </div>
            )}
            {searchResult && (
                 <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Search Result</h2>
                    <p className="whitespace-pre-wrap mb-4">{searchResult.text}</p>
                    {searchResult.chunks.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Sources:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {searchResult.chunks.map((chunk, index) => (
                                    chunk.web?.uri && <li key={index}><a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">{chunk.web.title || chunk.web.uri}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                 </div>
            )}
            <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-yellow-500">
                {searchResult ? 'Related Articles' : 'Latest News'}
            </h1>
            {isLoading && !isSearching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} layoutMode={settings.layoutMode} />)}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
                <button onClick={fetchNews} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Try Again</button>
              </div>
            ) : articles.length > 0 ? (
              <div className={`grid gap-6 ${settings.layoutMode === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                {articles.map(article => (
                  <ArticleCard key={article.id} article={article} onArticleClick={handleArticleClick} layoutMode={settings.layoutMode}/>
                ))}
              </div>
            ) : !searchResult ? (
                 <div className="text-center py-10"><p>No articles found.</p></div>
            ) : null}
          </div>
          <div className="lg:col-span-1">
            {topStories.length > 0 && <Aside topStories={topStories} onArticleClick={handleArticleClick} />}
          </div>
        </div>
      </main>

      <Footer />

      <ArticleViewModal
        article={selectedArticle}
        isOpen={isArticleModalOpen}
        onClose={closeModal}
        isPremium={isPremium}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(email) => { login(email, 'password'); setIsAuthModalOpen(false); addToast("Logged in successfully!", "success"); }}
        onRegister={(email) => { register(email, 'password'); setIsAuthModalOpen(false); addToast("Registered successfully!", "success"); }}
      />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <PremiumModal 
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        currentPlan={subscriptionPlan}
        onSubscribe={(plan) => {
            setSubscriptionPlan(plan);
            setIsPremiumModalOpen(false);
            addToast(`Successfully subscribed to ${plan} plan!`, 'success');
        }}
      />
      <SearchOverlay isOpen={isSearchOverlayOpen} onClose={() => setIsSearchOverlayOpen(false)} onSearch={handleSearch}/>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} setSettingsOpen={setIsSettingsModalOpen} setPremiumOpen={setIsPremiumModalOpen} setSearchOpen={setIsSearchOverlayOpen} />
      <BackToTopButton />
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
