import React from 'react';
import { Article } from '../types';

interface AsideProps {
  title: string;
  articles: Article[];
  onArticleClick: (article: Article) => void;
  isLoading?: boolean;
}

const AsideSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                </div>
            </div>
        ))}
    </div>
);


const Aside: React.FC<AsideProps> = ({ title, articles, onArticleClick, isLoading = false }) => {
  return (
    <aside className="space-y-8 sticky top-20">
      <div>
        <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-yellow-500">{title}</h2>
        {isLoading ? <AsideSkeleton /> : (
            <div className="space-y-4">
            {articles.map((article, index) => (
                <div 
                    key={article.id} 
                    className="flex items-start space-x-3 cursor-pointer group"
                    onClick={() => onArticleClick(article)}
                >
                <span className="text-2xl font-bold text-gray-300 dark:text-gray-600">{`0${index + 1}`}</span>
                <div>
                    <h3 className="text-sm font-semibold group-hover:text-yellow-500 transition-colors">{article.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{article.source.name}</p>
                </div>
                </div>
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