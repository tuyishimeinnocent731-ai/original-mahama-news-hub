import React from 'react';
import { Article } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import RelatedArticleCard from './RelatedArticleCard';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface TopStoriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const TopStoriesDrawer: React.FC<TopStoriesDrawerProps> = ({ isOpen, onClose, articles, onArticleClick }) => {
  const handleArticleClick = (article: Article) => {
    onArticleClick(article);
    onClose();
  };
  
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="top-stories-title"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="top-stories-title" className="text-xl font-semibold flex items-center">
              <TrendingUpIcon className="h-6 w-6 mr-2 text-yellow-500" />
              Top Stories
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
              <CloseIcon />
            </button>
          </div>
          <div className="flex-grow p-6 overflow-y-auto">
            {articles.length > 0 ? (
              <div className="space-y-6">
                {articles.map(article => (
                  <RelatedArticleCard 
                    key={article.id} 
                    article={article} 
                    onArticleClick={() => handleArticleClick(article)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No top stories available at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopStoriesDrawer;
