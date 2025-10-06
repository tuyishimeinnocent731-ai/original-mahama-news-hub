import React from 'react';
import { Article } from '../types';

interface AsideProps {
  topStories: Article[];
  onArticleClick: (article: Article) => void;
}

const Aside: React.FC<AsideProps> = ({ topStories, onArticleClick }) => {
  return (
    <aside className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-yellow-500">Top Stories</h2>
        <div className="space-y-4">
          {topStories.map((article, index) => (
            <div 
                key={article.id} 
                className="flex items-start space-x-3 cursor-pointer group"
                onClick={() => onArticleClick(article)}
            >
              <span className="text-2xl font-bold text-gray-300 dark:text-gray-600">0{index + 1}</span>
              <div>
                <h3 className="text-sm font-semibold group-hover:text-yellow-500 transition-colors">{article.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{article.source.name}</p>
              </div>
            </div>
          ))}
        </div>
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
