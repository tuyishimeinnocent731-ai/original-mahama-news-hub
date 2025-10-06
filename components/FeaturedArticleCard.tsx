
import React from 'react';
import { Article } from '../types';

interface FeaturedArticleCardProps {
    article: Article;
    onArticleClick: (article: Article) => void;
}

const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({ article, onArticleClick }) => {
    return (
        <div onClick={() => onArticleClick(article)} className="cursor-pointer group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">Featured Article</h3>
            <div className="relative rounded-lg overflow-hidden">
                <img src={article.urlToImage} alt={article.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3">
                    <h4 className="text-white text-sm font-semibold line-clamp-2 group-hover:underline">{article.title}</h4>
                </div>
            </div>
        </div>
    );
};

export default FeaturedArticleCard;
