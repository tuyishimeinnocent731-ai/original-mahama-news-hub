import React, { useState, useEffect } from 'react';
import { Article, User, Ad } from '../types';
import * as newsService from '../services/newsService';
import { useTTS } from '../hooks/useTTS';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import SocialShareBar from './SocialShareBar';
import AIAssistantPanel from './AIAssistantPanel';
import Aside from './Aside';
import InArticleAd from './InArticleAd';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import LoginPrompt from './LoginPrompt';
import ReadingProgressBar from './ReadingProgressBar';
import ImageGallery from './ImageGallery';

interface ArticleViewProps {
  article: Article;
  user: User | null;
  onBack: () => void;
  onArticleClick: (article: Article) => void;
  onUpgradeClick: () => void;
  onLoginClick: () => void;
  customAds?: Ad[];
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, user, onBack, onArticleClick, onUpgradeClick, onLoginClick, customAds = [] }) => {
  const [summary, setSummary] = useState<string>('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [isKeyPointsLoading, setKeyPointsLoading] = useState(false);
  const [isAIAssistantOpen, setAIAssistantOpen] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);

  const { isPlaying, isSupported, speak, stop, pause } = useTTS();
  
  const [isSaved, setIsSaved] = useState(false); // Local state for immediate feedback
  // A real app would use a context or props for this. This is a simplified example.
  useEffect(() => {
    setIsSaved(user?.savedArticles.includes(article.id) ?? false);
  }, [user, article.id]);


  const isPremium = user?.subscription === 'premium' || user?.subscription === 'pro';

  useEffect(() => {
    // Reset states when the article changes
    setSummary('');
    setKeyPoints([]);
    stop();
    setAIAssistantOpen(false);
    setIsRelatedLoading(true);

    const fetchRelated = async () => {
      try {
        const related = await newsService.getRelatedArticles(article.id, article.category);
        setRelatedArticles(related);
      } catch (error) {
        console.error("Failed to fetch related articles", error);
      } finally {
        setIsRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [article, stop]);

  const handleGenerateSummary = async () => {
    if (!isPremium) return;
    setSummaryLoading(true);
    const generatedSummary = await newsService.summarizeArticle(article.body, article.title);
    setSummary(generatedSummary);
    setSummaryLoading(false);
  };

  const handleGenerateKeyPoints = async () => {
    if (!isPremium) return;
    setKeyPointsLoading(true);
    const generatedKeyPoints = await newsService.getKeyPoints(article.body);
    setKeyPoints(generatedKeyPoints);
    setKeyPointsLoading(false);
  };

  const handlePlayAudio = () => {
    if (!isPremium) {
        onUpgradeClick();
        return;
    }
    if (isPlaying) {
      pause();
    } else {
      const textToSpeak = summary || `${article.title}. ${article.description}. ${article.body}`;
      speak(textToSpeak);
    }
  };
  
  const handleToggleSave = () => {
      if (!user) {
          onLoginClick();
          return;
      }
      // newsService.toggleSaveArticle(article) would be ideal
      setIsSaved(!isSaved); 
  }
  
  const articleBodyWithAd = article.body.split('\n').map((paragraph, index) => (
    <React.Fragment key={index}>
      <p>{paragraph}</p>
      {index === 1 && <InArticleAd />}
    </React.Fragment>
  ));

  return (
    <div className="animate-fade-in">
      <ReadingProgressBar />
      <button onClick={onBack} className="flex items-center space-x-2 text-yellow-500 hover:underline mb-6 font-semibold">
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Back to News</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <main className="md:col-span-8">
          <article>
            <header className="mb-6">
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase">{article.category}</span>
              <h1 className="text-3xl md:text-4xl font-bold my-2 text-gray-900 dark:text-white leading-tight">{article.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-3">
                <span>By {article.author} | {article.source.name}</span>
                <span>{new Date(article.publishedAt).toLocaleString()}</span>
              </div>
            </header>

            <img src={article.urlToImage} alt={article.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-6" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <button onClick={handleToggleSave} className={`flex items-center space-x-2 transition-colors ${isSaved ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-300 hover:text-yellow-500'}`}>
                        <BookmarkIcon className="h-5 w-5" />
                        <span>{isSaved ? 'Saved' : 'Save Article'}</span>
                    </button>
                    {isSupported && (
                        <button onClick={handlePlayAudio} className={`flex items-center space-x-2 ${isPremium ? 'text-gray-600 dark:text-gray-300 hover:text-yellow-500' : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}>
                           {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                           <span>{isPlaying ? 'Pause' : 'Listen'}</span>
                        </button>
                    )}
                </div>
                 <SocialShareBar url={article.url} title={article.title} />
            </div>

            <div className="prose dark:prose-invert max-w-none text-lg">
                <p className="lead font-semibold">{article.description}</p>
                 <ImageGallery images={article.galleryImages} />
                {articleBodyWithAd}
            </div>
          </article>
        </main>

        <div className="md:col-span-4">
            <div className="sticky top-24 space-y-8">
                <div>
                     <button onClick={() => setAIAssistantOpen(true)} className="w-full flex items-center justify-center p-3 mb-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-lg">
                        <SparklesIcon className="h-6 w-6 mr-2" />
                        AI Companion
                    </button>
                    {user ? 
                        <Aside
                            title="Related Stories"
                            articles={relatedArticles}
                            onArticleClick={onArticleClick}
                            isLoading={isRelatedLoading}
                            customAds={customAds}
                        />
                        : 
                         <LoginPrompt 
                            onLoginClick={onLoginClick} 
                            message="See related stories"
                            subMessage="Log in to view articles related to this topic and access more features."
                        />
                    }
                </div>
            </div>
        </div>
      </div>

      <AIAssistantPanel
        isOpen={isAIAssistantOpen}
        onClose={() => setAIAssistantOpen(false)}
        summary={summary}
        keyPoints={keyPoints}
        isSummaryLoading={isSummaryLoading}
        isKeyPointsLoading={isKeyPointsLoading}
        onGenerateSummary={handleGenerateSummary}
        onGenerateKeyPoints={handleGenerateKeyPoints}
        isPremium={isPremium}
        onUpgradeClick={onUpgradeClick}
      />
    </div>
  );
};

export default ArticleView;
