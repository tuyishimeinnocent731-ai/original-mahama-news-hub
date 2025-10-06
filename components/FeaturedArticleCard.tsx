import React from 'react';
import { Article } from '../types';

interface FeaturedArticleCardProps {
  article: Article;
  onArticleClick: (article: Article) => void;
}

const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({ article, onArticleClick }) => {
  const { title, urlToImage } = article;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div 
        className="group cursor-pointer overflow-hidden rounded-md"
        onClick={() => onArticleClick(article)}
    >
        <div className="relative h-40">
            <img 
                className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" 
                src={urlToImage} 
                alt={title} 
                onError={handleImageError} 
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-3">
                 <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">{title}</h3>
            </div>
        </div>
    </div>
  );
};

export default FeaturedArticleCard;