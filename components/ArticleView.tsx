import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { useTTS } from '../hooks/useTTS';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ShareIcon } from './icons/ShareIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import AIAssistantPanel from './AIAssistantPanel';
import * as newsService from '../services/newsService';

interface ArticleViewProps {
    article: Article;
    isPremium: boolean;
    onUpgradeClick: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, isPremium, onUpgradeClick }) => {
    const [summary, setSummary] = useState<string>('');
    const [keyPoints, setKeyPoints] = useState<string[]>([]);
    const [isSummaryLoading, setSummaryLoading] = useState(false);
    const [isKeyPointsLoading, setKeyPointsLoading] = useState(false);
    const [isAIPanelOpen, setAIPanelOpen] = useState(false);
    const { isPlaying, isPaused, isSupported, speak, stop, pause, resume } = useTTS();

    useEffect(() => {
        // Reset states when a new article is shown
        setSummary('');
        setKeyPoints([]);
        setAIPanelOpen(false);
        stop(); // Stop any ongoing speech
    }, [article, stop]);
    
    const handleGenerateSummary = async () => {
        if (!article) return;
        setSummaryLoading(true);
        try {
            const generatedSummary = await newsService.summarizeArticle(article.body, article.title);
            setSummary(generatedSummary);
        } catch (error) {
            console.error("Failed to generate summary:", error);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleGenerateKeyPoints = async () => {
        if (!article) return;
        setKeyPointsLoading(true);
        try {
            const generatedKeyPoints = await newsService.getKeyPoints(article.body);
            setKeyPoints(generatedKeyPoints);
        } catch (error) {
            console.error("Failed to generate key points:", error);
        } finally {
            setKeyPointsLoading(false);
        }
    };

    const handlePlayAudio = () => {
        if (!article) return;
        
        if (isPlaying) {
            pause();
        } else if (isPaused) {
            resume();
        } else {
            const textToSpeak = summary || `${article.title}. ${article.description}. ${article.body}`;
            speak(textToSpeak);
        }
    };
    
    return (
        <div className="relative">
            <article>
                <header className="mb-8">
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-2">{article.category}</p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">{article.title}</h1>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>By {article.author} / {article.source.name}</span>
                        <span className="mx-2">&#8226;</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </header>

                <div className="flex items-center space-x-6 my-6 py-4 border-y dark:border-gray-700">
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition-colors duration-200"><BookmarkIcon className="h-5 w-5"/><span>Save</span></button>
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition-colors duration-200"><ShareIcon className="h-5 w-5"/><span>Share</span></button>
                    {isSupported && (
                        <button onClick={handlePlayAudio} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition-colors duration-200">
                           {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                           <span>{isPlaying ? 'Pause' : (isPaused ? 'Resume' : 'Listen')}</span>
                        </button>
                    )}
                </div>

                <img src={article.urlToImage} alt={article.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-lg" />
                
                <div className="prose dark:prose-invert max-w-none text-lg lg:text-xl leading-relaxed">
                    <p className="lead font-semibold text-gray-700 dark:text-gray-300">{article.description}</p>
                    <p>{article.body}</p>
                </div>
            </article>

            {/* Floating AI Companion Button */}
            <button
                onClick={() => setAIPanelOpen(true)}
                className="fixed bottom-8 right-8 lg:bottom-10 lg:right-10 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-30 transform hover:scale-110"
                aria-label="Open AI Assistant"
            >
                <SparklesIcon />
            </button>

            {/* AI Assistant Panel */}
            <AIAssistantPanel
                isOpen={isAIPanelOpen}
                onClose={() => setAIPanelOpen(false)}
                summary={summary}
                keyPoints={keyPoints}
                isSummaryLoading={isSummaryLoading}
                isKeyPointsLoading={isKeyPointsLoading}
                onGenerateSummary={handleGenerateSummary}
                onGenerateKeyPoints={handleGenerateKeyPoints}
            />
        </div>
    );
};

export default ArticleView;
