

import React from 'react';
import { Article } from '../types';
import { WifiOffIcon } from './icons/WifiOffIcon';

interface ArticleCardProps {
  article: Article;
  onArticleClick: (article: Article) => void;
  layoutMode?: 'normal' | 'compact';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onArticleClick, layoutMode = 'normal' }) => {
  const isOffline = article.isOffline;

  if (layoutMode === 'compact') {
    return (
        <div onClick={() => onArticleClick(article)} className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
            <div className="h-32 w-full overflow-hidden">
                <img className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" src={article.urlToImage} alt={article.title} />
            </div>
            {isOffline && (
                <div className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded-full" title="Available Offline">
                    <WifiOffIcon className="h-4 w-4" />
                </div>
            )}
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-3 flex-grow group-hover:text-yellow-600 dark:group-hover:text-yellow-400">{article.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="font-medium text-blue-600 dark:text-blue-400 uppercase">{article.category}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col group h-full">
        <div onClick={() => onArticleClick(article)} className="relative cursor-pointer overflow-hidden">
            <img className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={article.urlToImage} alt={article.title} />
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md uppercase">{article.category}</div>
             {isOffline && (
                <div className="absolute top-2 left-2 bg-gray-700 text-white p-1.5 rounded-full" title="Available Offline">
                    <WifiOffIcon className="h-4 w-4" />
                </div>
            )}
        </div>
        <div className="p-6 flex-grow flex flex-col">
            <h2 onClick={() => onArticleClick(article)} className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-400">{article.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">{article.description}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                <span className="line-clamp-1">By {article.author}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
        </div>
    </div>
  );
};

export default ArticleCard;