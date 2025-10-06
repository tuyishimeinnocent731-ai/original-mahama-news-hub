import React from 'react';
import { Article } from '../types';

interface RelatedArticleCardProps {
    article: Article;
    onArticleClick: () => void;
}

const RelatedArticleCard: React.FC<RelatedArticleCardProps> = ({ article, onArticleClick }) => {

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = 'https://via.placeholder.com/300x300?text=News';
    };

    return (
        <div 
            className="flex items-center space-x-4 cursor-pointer group"
            onClick={onArticleClick}
        >
            <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-lg">
                <img 
                    src={article.urlToImage} 
                    alt={article.title} 
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
            </div>
            <div>
                <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1">{article.category}</p>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 group-hover:text-yellow-500 transition-colors duration-200 line-clamp-3">
                    {article.title}
                </h3>
            </div>
        </div>
    );
};

export default RelatedArticleCard;