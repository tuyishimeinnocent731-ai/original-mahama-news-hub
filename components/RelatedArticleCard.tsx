
import React from 'react';
import { Article } from '../types';

interface RelatedArticleCardProps {
    article: Article;
    onArticleClick: (article: Article) => void;
}

const RelatedArticleCard: React.FC<RelatedArticleCardProps> = ({ article, onArticleClick }) => {
    return (
        <div onClick={() => onArticleClick(article)} className="flex space-x-4 cursor-pointer group">
            <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                <img src={article.urlToImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-1">
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase">{article.category}</span>
                <h4 className="text-sm font-semibold line-clamp-3 text-gray-800 dark:text-gray-200 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                    {article.title}
                </h4>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(article.publishedAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default RelatedArticleCard;
