import React from 'react';
import { Article } from '../types';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface TopStoriesBannerProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const TopStoriesBanner: React.FC<TopStoriesBannerProps> = ({ articles, onArticleClick }) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-4 py-2">
          <div className="flex-shrink-0 flex items-center">
            <TrendingUpIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="ml-2 text-sm font-bold uppercase text-gray-700 dark:text-gray-300">Top Stories</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-marquee-fast whitespace-nowrap">
              {articles.map((article, index) => (
                <button
                  key={`${article.id}-${index}`}
                  onClick={() => onArticleClick(article)}
                  className="mx-4 text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">{article.category}:</span>
                  {article.title}
                </button>
              ))}
               {articles.map((article, index) => (
                <button
                  key={`${article.id}-${index}-clone`}
                  onClick={() => onArticleClick(article)}
                  className="mx-4 text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                  aria-hidden="true"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">{article.category}:</span>
                  {article.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopStoriesBanner;
