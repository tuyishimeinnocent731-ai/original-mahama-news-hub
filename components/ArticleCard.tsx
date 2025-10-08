import React from 'react';
import { Article } from '../types';
import { WifiOffIcon } from './icons/WifiOffIcon';

interface ArticleCardProps {
  article: Article;
  onArticleClick: (article: Article) => void;
  layoutMode?: 'normal' | 'compact';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onArticleClick, layoutMode = 'normal' }) => {
  const isOffline = article.isOffline;
  
  const cardBaseClasses = "bg-card text-card-foreground overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group";
  const cardStyleClasses = "rounded-lg shadow-md"; // Default, will be overridden by body classes from useSettings

  if (layoutMode === 'compact') {
    return (
        <div onClick={() => onArticleClick(article)} className={`relative ${cardBaseClasses} ${cardStyleClasses}`}>
            <div className="h-32 w-full overflow-hidden">
                <img className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" src={article.urlToImage} alt={article.title} />
            </div>
            {isOffline && (
                <div className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded-full" title="Available Offline">
                    <WifiOffIcon className="h-4 w-4" />
                </div>
            )}
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-base font-semibold mb-2 line-clamp-3 flex-grow group-hover:text-accent">{article.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span className="font-medium text-primary uppercase">{article.category}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className={`${cardBaseClasses} ${cardStyleClasses}`}>
        <div onClick={() => onArticleClick(article)} className="relative cursor-pointer overflow-hidden">
            <img className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={article.urlToImage} alt={article.title} />
            <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-md uppercase">{article.category}</div>
             {isOffline && (
                <div className="absolute top-2 left-2 bg-gray-700 text-white p-1.5 rounded-full" title="Available Offline">
                    <WifiOffIcon className="h-4 w-4" />
                </div>
            )}
        </div>
        <div className="p-6 flex-grow flex flex-col">
            <h2 onClick={() => onArticleClick(article)} className="text-xl font-bold mb-3 line-clamp-2 cursor-pointer hover:text-accent">{article.title}</h2>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">{article.description}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border text-xs text-muted-foreground">
                <span className="line-clamp-1">By {article.author}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
        </div>
    </div>
  );
};

export default ArticleCard;