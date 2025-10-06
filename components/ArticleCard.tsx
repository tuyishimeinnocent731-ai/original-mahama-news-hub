import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  isTopStory?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isTopStory = false }) => {
  if (isTopStory) {
    return (
      <div className="group border-b-2 pb-4 border-gray-200 dark:border-gray-700">
        <div className="relative">
          <img src={article.imageUrl} alt={article.headline} className="w-full h-auto object-cover" />
          <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white p-4 w-full">
            <h2 className="text-2xl md:text-4xl font-bold group-hover:text-yellow-300 transition-colors duration-300">{article.headline}</h2>
            <p className="mt-2 text-sm md:text-base hidden md:block">{article.summary}</p>
          </div>
        </div>
        <p className="mt-2 text-sm md:text-base md:hidden text-gray-800 dark:text-gray-300">{article.summary}</p>
        <span className="mt-2 inline-block text-yellow-500 font-semibold text-sm uppercase">{article.category}</span>
      </div>
    );
  }

  return (
    <div className="group flex flex-col h-full">
      <div className="relative">
        <img src={article.imageUrl} alt={article.headline} className="w-full h-48 object-cover" />
      </div>
      <div className="pt-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold group-hover:text-yellow-400 transition-colors duration-300 flex-grow text-gray-900 dark:text-white">{article.headline}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{article.summary}</p>
          <span className="mt-4 inline-block text-yellow-500 font-semibold text-sm uppercase">{article.category}</span>
      </div>
    </div>
  );
};

export default ArticleCard;