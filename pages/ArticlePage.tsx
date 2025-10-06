import React from 'react';
import { Article } from '../types';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

interface ArticlePageProps {
  article: Article;
  onBack: () => void;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ article, onBack }) => {
  const { title, body, urlToImage, source, publishedAt, author, keyPoints } = article;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/1200x600?text=No+Image';
    e.currentTarget.onerror = null;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={onBack} className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-600 font-semibold mb-6">
            <ArrowLeftIcon />
            <span>Back to News</span>
        </button>

        <article>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">{title}</h1>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>By {author || source?.name || 'Unknown'}</span>
                <span>{new Date(publishedAt).toDateString()}</span>
            </div>
            
            <img className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-lg" src={urlToImage} alt={title} onError={handleImageError} />

            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 text-lg">
                {keyPoints && keyPoints.length > 0 && (
                    <div className="mb-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-xl">
                        <h2 className="text-2xl font-bold mb-3">Key Points</h2>
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
        </article>
      </div>
    </div>
  );
};

export default ArticlePage;
