import React from 'react';
import { Article } from '../types';
import RelatedArticleCard from './RelatedArticleCard';

interface AsideProps {
  title: string;
  articles: Article[];
  onArticleClick: (article: Article) => void;
  isLoading?: boolean;
}

const AsideSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
             <div key={i} className="flex space-x-4">
                <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            </div>
        ))}
    </div>
);


const Aside: React.FC<AsideProps> = ({ title, articles, onArticleClick, isLoading = false }) => {
  return (
    <aside className="space-y-8 sticky top-24">
      <div>
        <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-yellow-500">{title}</h2>
        {isLoading ? <AsideSkeleton /> : (
            <div className="space-y-6">
            {articles.map((article) => (
                <RelatedArticleCard 
                    key={article.id} 
                    article={article} 
                    onArticleClick={() => onArticleClick(article)}
                />
            ))}
            </div>
        )}
      </div>
      
      <div>
         <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-yellow-500">Advertisement</h2>
         <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
            <span className="text-gray-500">Ad Space</span>
         </div>
      </div>
    </aside>
  );
};

export default Aside;