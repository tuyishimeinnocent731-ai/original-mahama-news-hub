import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Article } from '../types';
import * as newsService from '../services/newsService';
import { useTTS } from '../hooks/useTTS';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ShareIcon } from './icons/ShareIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import LoadingSpinner from './LoadingSpinner';

interface ArticleViewModalProps {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
    isPremium: boolean;
    onUpgradeClick: () => void;
}

const ArticleViewModal: React.FC<ArticleViewModalProps> = ({ article, isOpen, onClose, isPremium, onUpgradeClick }) => {
    const [summary, setSummary] = useState<string>('');
    const [keyPoints, setKeyPoints] = useState<string[]>([]);
    const [isSummaryLoading, setSummaryLoading] = useState(false);
    const [isKeyPointsLoading, setKeyPointsLoading] = useState(false);
    const { isPlaying, isSupported, speak, stop, pause, resume } = useTTS();

    useEffect(() => {
        if (article && isOpen) {
            // Reset states when a new article is opened
            setSummary('');
            setKeyPoints([]);
            stop(); // Stop any ongoing speech
        }
    }, [article, isOpen, stop]);
    
    const handleGenerateSummary = async () => {
        if (!article) return;
        setSummaryLoading(true);
        const generatedSummary = await newsService.summarizeArticle(article.body, article.title);
        setSummary(generatedSummary);
        setSummaryLoading(false);
    };

    const handleGenerateKeyPoints = async () => {
        if (!article) return;
        setKeyPointsLoading(true);
        const generatedKeyPoints = await newsService.getKeyPoints(article.body);
        setKeyPoints(generatedKeyPoints);
        setKeyPointsLoading(false);
    };

    const handlePlayAudio = () => {
        if (!article) return;
        if(isPlaying) {
            pause();
        } else {
            if (summary) {
                speak(summary);
            } else {
                speak(`${article.title}. ${article.description}. ${article.body}`);
            }
        }
    };
    
    if (!isOpen || !article) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">{article.title}</h1>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>By {article.author} | {article.source.name}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500"><BookmarkIcon className="h-5 w-5"/><span>Save</span></button>
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500"><ShareIcon className="h-5 w-5"/><span>Share</span></button>
                    {isSupported && (
                        <button onClick={handlePlayAudio} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500">
                           {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                           <span>{isPlaying ? 'Pause' : 'Listen'}</span>
                        </button>
                    )}
                </div>

                <img src={article.urlToImage} alt={article.title} className="w-full h-auto max-h-80 object-cover rounded-lg mb-6" />

                {/* AI Features */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 space-y-4">
                    <h2 className="text-lg font-semibold">AI Assistant</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={handleGenerateSummary} disabled={isSummaryLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                            {isSummaryLoading ? 'Generating...' : 'Summarize Article'}
                        </button>
                        <button onClick={handleGenerateKeyPoints} disabled={isKeyPointsLoading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400">
                            {isKeyPointsLoading ? 'Extracting...' : 'Get Key Points'}
                        </button>
                    </div>
                     {isSummaryLoading || isKeyPointsLoading ? <div className="py-4"><LoadingSpinner /></div> : null}

                    {summary && (
                        <div className="pt-4">
                            <h3 className="font-semibold mb-2">Summary:</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{summary}</p>
                        </div>
                    )}
                    {keyPoints.length > 0 && (
                        <div className="pt-4">
                            <h3 className="font-semibold mb-2">Key Points:</h3>
                            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                {keyPoints.map((point, index) => <li key={index}>{point}</li>)}
                            </ul>
                        </div>
                    )}
                </div>

                <article className="prose dark:prose-invert max-w-none">
                    <p className="lead">{article.description}</p>
                    <p>{article.body}</p>
                </article>
                 <div className="mt-6 text-center">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
                        Read original article on {article.source.name}
                    </a>
                </div>
            </div>
        </Modal>
    );
};

export default ArticleViewModal;
