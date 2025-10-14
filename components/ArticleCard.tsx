import React from 'react';
import { Article } from '../types';
import { WifiOffIcon } from './icons/WifiOffIcon';

interface ArticleCardProps {
  article: Article;
  onArticleClick: (article: Article) => void;
  layout?: 'normal' | 'compact' | 'list';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onArticleClick, layout = 'normal' }) => {
  const isOffline = article.isOffline;
  
  const cardBaseClasses = "bg-card text-card-foreground overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex group";
  const cardStyleClasses = "rounded-lg shadow-md"; // Default, will be overridden by body classes from useSettings

  if (layout === 'list') {
    return (
      <div onClick={() => onArticleClick(article)} className={`${cardBaseClasses} flex-row ${cardStyleClasses}`}>
        <div className="w-1/3 md:w-1/4 flex-shrink-0 overflow-hidden relative">
            <img className="absolute h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" src={article.urlToImage} alt={article.title} />
            {isOffline && (
                <div className="absolute top-2 left-2 bg-gray-700 text-white p-1.5 rounded-full" title="Available Offline">
                    <WifiOffIcon className="h-4 w-4" />
                </div>
            )}
        </div>
        <div className="p-4 sm:p-6 flex-grow flex flex-col">
            <span className="text-xs font-bold text-accent uppercase mb-1">{article.category}</span>
            <h2 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-accent">{article.title}</h2>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2 hidden sm:block flex-grow">{article.description}</p>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border text-xs text-muted-foreground">
              <span className="line-clamp-1">By {article.author}</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
        </div>
      </div>
    );
  }

  if (layout === 'compact') {
    return (
        <div onClick={() => onArticleClick(article)} className={`relative ${cardBaseClasses} flex-col h-full ${cardStyleClasses}`}>
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
    <div className={`${cardBaseClasses} flex-col h-full ${cardStyleClasses}`}>
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