import React from 'react';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';

interface SavedArticlesPageProps {
  savedArticles: Article[];
  onArticleClick: (article: Article) => void;
}

const SavedArticlesPage: React.FC<SavedArticlesPageProps> = ({ savedArticles, onArticleClick }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-yellow-500">My Saved Articles</h1>
      {savedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedArticles.map(article => (
            <ArticleCard key={article.id} article={article} onArticleClick={onArticleClick} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <NewspaperIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold">No Saved Articles Yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Click the 'Save' button on an article to add it to your list for offline reading.
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedArticlesPage;