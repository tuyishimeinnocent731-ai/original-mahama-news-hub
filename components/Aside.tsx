import React from 'react';
import { Article } from '../types';

interface AsideProps {
    trendingTopics: string[];
    topStories: Article[];
    onTopicClick: (topic: string) => void;
    onArticleClick: (article: Article) => void;
    onPremiumClick: () => void;
    isPremium: boolean;
}

const Aside: React.FC<AsideProps> = ({ trendingTopics, topStories, onTopicClick, onArticleClick, onPremiumClick, isPremium }) => {
    return (
        <aside className="w-full lg:w-1/3 xl:w-1/4 space-y-8">
            {!isPremium && (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Go Ad-Free!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Enjoy an uninterrupted news experience with a premium subscription.</p>
                    <button onClick={onPremiumClick} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Go Premium
                    </button>
                </div>
            )}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-20">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Trending Topics</h3>
                <ul className="space-y-2">
                    {trendingTopics.map(topic => (
                        <li key={topic}>
                            <a href="#" onClick={(e) => {e.preventDefault(); onTopicClick(topic)}} className="text-yellow-600 dark:text-yellow-400 hover:underline">#{topic}</a>
                        </li>
                    ))}
                </ul>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-64">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Top Stories</h3>
                <ul className="space-y-4">
                    {topStories.slice(0, 5).map(story => (
                        <li key={story.id} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0 last:pb-0">
                            <a href="#" onClick={(e) => {e.preventDefault(); onArticleClick(story)}} className="text-gray-800 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium text-sm">
                                {story.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    )
}

export default Aside;
