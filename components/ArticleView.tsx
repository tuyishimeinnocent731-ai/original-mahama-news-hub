
import React, { useState, useEffect } from 'react';
import { Article, User } from '../types';
import * as newsService from '../services/newsService';
import { useTTS } from '../hooks/useTTS';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ShareIcon } from './icons/ShareIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import AIAssistantPanel from './AIAssistantPanel';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import ArticleCard from './ArticleCard';

interface ArticleViewProps {
    article: Article;
    user: User | null;
    onBack: () => void;
    onUpgradeClick: () => void;
    isArticleSaved: (id: string) => boolean;
    onToggleSave: (article: Article) => void;
    relatedArticles: Article[];
    onArticleClick: (article: Article) => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, user, onBack, onUpgradeClick, isArticleSaved, onToggleSave, relatedArticles, onArticleClick }) => {
    const [summary, setSummary] = useState('');
    const [keyPoints, setKeyPoints] = useState<string[]>([]);
    const [isSummaryLoading, setSummaryLoading] = useState(false);
    const [isKeyPointsLoading, setKeyPointsLoading] = useState(false);
    const [isAIPanelOpen, setAIPanelOpen] = useState(false);
    const { isPlaying, isSupported, speak, stop, pause } = useTTS();
    const isPremium = user?.subscription === 'premium' || user?.subscription === 'standard';

    useEffect(() => {
        // Reset states when article changes
        setSummary('');
        setKeyPoints([]);
        setAIPanelOpen(false);
        stop();
    }, [article, stop]);

    const handleGenerateSummary = async () => {
        if (!article || !isPremium) return;
        setSummaryLoading(true);
        const generatedSummary = await newsService.summarizeArticle(article.body, article.title);
        setSummary(generatedSummary);
        setSummaryLoading(false);
    };

    const handleGenerateKeyPoints = async () => {
        if (!article || !isPremium) return;
        setKeyPointsLoading(true);
        const generatedKeyPoints = await newsService.getKeyPoints(article.body);
        setKeyPoints(generatedKeyPoints);
        setKeyPointsLoading(false);
    };

    const handlePlayAudio = () => {
        if (!article) return;
        if (isPlaying) {
            pause();
        } else {
            const textToSpeak = summary || `${article.title}. ${article.description}. ${article.body}`;
            speak(textToSpeak);
        }
    };
    
    const saved = isArticleSaved(article.id);

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-yellow-500 hover:underline mb-6 font-semibold">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to News</span>
            </button>

            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                 <img src={article.urlToImage} alt={article.title} className="w-full h-auto max-h-[500px] object-cover" />
                 
                 <div className="p-6 sm:p-8">
                    <header className="mb-6">
                         <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase">{article.category}</span>
                         <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white leading-tight">{article.title}</h1>
                         <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-4 gap-2">
                            <span>By {article.author} | {article.source.name}</span>
                            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                    </header>
                    
                     <div className="my-6 py-4 border-y dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center flex-wrap gap-4 sm:gap-6">
                            <button onClick={() => onToggleSave(article)} className={`flex items-center space-x-2 transition-colors ${saved ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-300 hover:text-yellow-500'}`}>
                                <BookmarkIcon className={`h-5 w-5 ${saved ? 'fill-current' : ''}`}/><span>{saved ? 'Saved' : 'Save'}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500"><ShareIcon className="h-5 w-5"/><span>Share</span></button>
                            {isSupported && (
                                <button onClick={handlePlayAudio} disabled={!isPremium} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                                <span>{isPlaying ? 'Pause' : 'Listen'}</span>
                                {!isPremium && <span className="text-xs text-yellow-500 ml-1">(Premium)</span>}
                                </button>
                            )}
                        </div>
                        <button onClick={() => setAIPanelOpen(true)} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold w-full sm:w-auto justify-start sm:justify-center">
                            <SparklesIcon className="h-5 w-5" />
                            <span>AI Companion</span>
                        </button>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
                        <p className="lead font-semibold">{article.description}</p>
                        {article.body.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                     <div className="mt-8 pt-6 border-t dark:border-gray-700 text-center">
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
                            Read original article on {article.source.name}
                        </a>
                    </div>
                 </div>
            </article>

            {relatedArticles.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-yellow-500">You might also like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {relatedArticles.map((relatedArticle) => (
                            <ArticleCard
                                key={relatedArticle.id}
                                article={relatedArticle}
                                onArticleClick={onArticleClick}
                                layoutMode="compact"
                            />
                        ))}
                    </div>
                </div>
            )}

             <AIAssistantPanel
                isOpen={isAIPanelOpen}
                onClose={() => setAIPanelOpen(false)}
                summary={summary}
                keyPoints={keyPoints}
                isSummaryLoading={isSummaryLoading}
                isKeyPointsLoading={isKeyPointsLoading}
                onGenerateSummary={handleGenerateSummary}
                onGenerateKeyPoints={handleGenerateKeyPoints}
                isPremium={!!isPremium}
                onUpgradeClick={() => {
                    setAIPanelOpen(false);
                    onUpgradeClick();
                }}
            />
        </div>
    );
};

export default ArticleView;
