import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onArticleClick: (article: Article) => void;
  layoutMode?: 'normal' | 'compact';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onArticleClick, layoutMode = 'normal' }) => {
  const { title, description, urlToImage, source, publishedAt } = article;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
  };

  if (layoutMode === 'compact') {
      return (
         <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer"
            onClick={() => onArticleClick(article)}
        >
            <img className="h-32 w-full object-cover" src={urlToImage} alt={title} onError={handleImageError} loading="lazy"/>
             <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2 line-clamp-3 flex-grow">{title}</h3>
                <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="truncate pr-2">{source?.name || 'Unknown'}</span>
                    <span>{new Date(publishedAt).toLocaleDateString()}</span>
                </div>
            </div>
         </div>
      );
  }

  return (
    <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer"
        onClick={() => onArticleClick(article)}
    >
      <img className="h-48 w-full object-cover" src={urlToImage} alt={title} onError={handleImageError} loading="lazy"/>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex-grow">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="truncate pr-2">{source?.name || 'Unknown Source'}</span>
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
