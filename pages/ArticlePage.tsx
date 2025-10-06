
import React from 'react';
import { Article } from '../types';
import { ShareIcon } from '../components/icons/ShareIcon';
import { BookmarkIcon } from '../components/icons/BookmarkIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

interface ArticlePageProps {
  article: Article;
  onBack: () => void;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ article, onBack }) => {

  if (!article) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Article not found.</p>
            <button onClick={onBack} className="ml-4 text-yellow-500 hover:underline">Go Back</button>
        </div>
    );
  }

  const { title, body, urlToImage, source, publishedAt, author, url, keyPoints, description } = article;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/1200x600?text=No+Image';
    e.currentTarget.onerror = null;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-600 font-semibold mb-6">
                <ArrowLeftIcon />
                <span>Back to News</span>
            </button>

            <article>
                <header className="mb-8">
                    <img className="h-auto max-h-[500px] w-full object-cover rounded-lg shadow-lg mb-6" src={urlToImage} alt={title} onError={handleImageError} />
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span className="truncate pr-4 font-medium">By {author || source?.name || 'Unknown'}</span>
                        <time dateTime={publishedAt}>{new Date(publishedAt).toDateString()}</time>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">{title}</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{description}</p>
                </header>

                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 text-lg">
                    {keyPoints && keyPoints.length > 0 && (
                        <div className="mb-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-xl">
                            <h2 className="text-xl font-bold mb-3">Key Points</h2>
                            <ul className="list-disc list-inside space-y-2">
                                {keyPoints.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {body.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-6">{paragraph}</p>
                    ))}
                </div>

                <footer className="mt-10 pt-6 border-t dark:border-gray-600 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <p className="font-semibold">Share:</p>
                      <button 
                        onClick={() => navigator.share ? navigator.share({ title, url }) : navigator.clipboard.writeText(url)}
                        aria-label="Share article" 
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <ShareIcon />
                      </button>
                      <button onClick={() => alert('Bookmarked!')} aria-label="Bookmark article" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <BookmarkIcon />
                      </button>
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center">
                      Read on Source
                    </a>
                </footer>
            </article>
        </div>
    </div>
  );
};

export default ArticlePage;
