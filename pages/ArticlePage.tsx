import React from 'react';
import { Article } from '../types';
import { BookmarkIcon } from '../components/icons/BookmarkIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { PlayIcon } from '../components/icons/PlayIcon';

// Mock article for demonstration purposes
const mockArticle: Article = {
    id: '1',
    title: 'Global Tech Summit 2024 Highlights Future of AI',
    description: 'Leaders from around the world gathered to discuss advancements in artificial intelligence and its impact on society.',
    body: 'The Global Tech Summit 2024 concluded yesterday, leaving attendees with a sense of awe and excitement for the future. Keynote speakers emphasized the responsible development of AI, highlighting potential breakthroughs in medicine, climate change, and education. A major theme was the collaboration between public and private sectors to ensure AI benefits all of humanity. Several startups showcased groundbreaking applications, from autonomous drones for agriculture to AI-powered diagnostic tools that can detect diseases earlier than ever before.',
    author: 'Jane Doe',
    publishedAt: '2024-07-15T10:00:00Z',
    source: { name: 'Tech Chronicle' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1620712943543-95fc6961452f?q=80&w=2070&auto=format&fit=crop',
    category: 'Technology'
};

const ArticlePage: React.FC = () => {
    const article = mockArticle; // In a real app, you'd fetch this based on a URL param

    return (
        <div className="bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <article>
                    <header className="mb-8">
                         <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white leading-tight">{article.title}</h1>
                         <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>By {article.author} | {article.source.name}</span>
                            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                    </header>
                    
                    <img src={article.urlToImage} alt={article.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8" />
                    
                    <div className="prose dark:prose-invert max-w-none text-lg">
                        <p className="lead font-semibold">{article.description}</p>
                        <p>{article.body}</p>
                    </div>

                     <div className="mt-8 pt-6 border-t dark:border-gray-700 flex items-center space-x-6">
                        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500"><BookmarkIcon className="h-5 w-5"/><span>Save</span></button>
                        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500"><ShareIcon className="h-5 w-5"/><span>Share</span></button>
                        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500"><PlayIcon className="h-5 w-5" /><span>Listen</span></button>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default ArticlePage;
