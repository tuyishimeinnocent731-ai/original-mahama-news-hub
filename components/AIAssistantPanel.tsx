import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { StarIcon } from './icons/StarIcon';

interface AIAssistantPanelProps {
    isOpen: boolean;
    onClose: () => void;
    summary: string;
    keyPoints: string[];
    answer: string;
    isSummaryLoading: boolean;
    isKeyPointsLoading: boolean;
    isAnswering: boolean;
    onGenerateSummary: () => void;
    onGenerateKeyPoints: () => void;
    onAskQuestion: (question: string) => void;
    isPremium: boolean;
    onUpgradeClick: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
    isOpen,
    onClose,
    summary,
    keyPoints,
    answer,
    isSummaryLoading,
    isKeyPointsLoading,
    isAnswering,
    onGenerateSummary,
    onGenerateKeyPoints,
    onAskQuestion,
    isPremium,
    onUpgradeClick,
}) => {
    const [question, setQuestion] = useState('');

    const handleQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim()) {
            onAskQuestion(question.trim());
        }
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-assistant-title"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 id="ai-assistant-title" className="text-xl font-semibold flex items-center">
                            <SparklesIcon className="h-6 w-6 mr-2 text-blue-500" />
                            AI Companion
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow p-6 overflow-y-auto space-y-6">
                        {!isPremium ? (
                            <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <StarIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Upgrade for AI Features</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Unlock article summaries and key points by upgrading your plan.
                                </p>
                                <button onClick={onUpgradeClick} className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">
                                    Upgrade Now
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Enhance your reading experience with AI-powered tools.</p>
                                    <button onClick={onGenerateSummary} disabled={isSummaryLoading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold">
                                        {isSummaryLoading ? 'Generating Summary...' : 'Summarize Article'}
                                    </button>
                                    <button onClick={onGenerateKeyPoints} disabled={isKeyPointsLoading} className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold">
                                        {isKeyPointsLoading ? 'Extracting Key Points...' : 'Get Key Points'}
                                    </button>
                                </div>

                                {(isSummaryLoading || isKeyPointsLoading) && <div className="py-6 flex justify-center"><LoadingSpinner /></div>}

                                {summary && (
                                    <div className="pt-4 animate-fade-in">
                                        <h3 className="font-semibold mb-2 text-lg">Summary:</h3>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap prose dark:prose-invert max-w-none">{summary}</p>
                                        </div>
                                    </div>
                                )}
                                {keyPoints.length > 0 && (
                                    <div className="pt-4 animate-fade-in">
                                        <h3 className="font-semibold mb-2 text-lg">Key Points:</h3>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 prose dark:prose-invert max-w-none">
                                                {keyPoints.map((point, index) => <li key={index}>{point}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* New "Ask a question" feature */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                                    <h3 className="text-lg font-semibold">Ask About This Article</h3>
                                    <form onSubmit={handleQuestionSubmit} className="space-y-3">
                                        <textarea
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            placeholder="e.g., 'What was the main outcome of the summit?'"
                                            rows={3}
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-accent focus:outline-none"
                                        />
                                        <button type="submit" disabled={isAnswering} className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed font-semibold">
                                            {isAnswering ? 'Thinking...' : 'Get Answer'}
                                        </button>
                                    </form>
                                    
                                    {isAnswering && <div className="py-6 flex justify-center"><LoadingSpinner /></div>}
                                    
                                    {answer && (
                                        <div className="pt-4 animate-fade-in">
                                            <h4 className="font-semibold mb-2">Answer:</h4>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap prose dark:prose-invert max-w-none">{answer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIAssistantPanel;