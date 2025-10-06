import React, { useEffect } from 'react';
import Modal from './Modal';
import { Article } from '../types';
import { useTTS } from '../hooks/useTTS';
import { ShareIcon } from './icons/ShareIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface ArticleViewModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
}

const ArticleViewModal: React.FC<ArticleViewModalProps> = ({ article, isOpen, onClose, isPremium }) => {
  const { isPlaying, isSupported, speak, stop, pause, resume } = useTTS();

  useEffect(() => {
    // Stop TTS when modal is closed or article changes
    return () => {
      stop();
    };
  }, [article, isOpen, stop]);

  if (!article) {
    return null;
  }

  const { title, body, urlToImage, source, publishedAt, author, url, keyPoints, description } = article;
  
  const contentToRead = title + '. ' + (keyPoints?.join('. ') || description) + '. ' + body;

  const handlePlayPause = () => {
    if (!isPremium) {
        alert("Audio narration is a premium feature.");
        return;
    }
    if (isPlaying) {
      pause();
    } else if (window.speechSynthesis.paused) {
      resume();
    } else {
      speak(contentToRead);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/800x400?text=No+Image';
    e.currentTarget.onerror = null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="max-h-[85vh] overflow-y-auto">
        <img className="h-64 sm:h-80 w-full object-cover" src={urlToImage} alt={title} onError={handleImageError} />
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="truncate pr-4">By {author || source?.name || 'Unknown'}</span>
            <span>{new Date(publishedAt).toDateString()}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>

          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            {keyPoints && keyPoints.length > 0 && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Key Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
            )}

            {body.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t dark:border-gray-600 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
               {isSupported && (
                    <button 
                        onClick={handlePlayPause}
                        aria-label={isPlaying ? "Pause narration" : "Play narration"}
                        className={`p-2 rounded-full transition-colors ${isPremium ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : 'text-gray-400 cursor-not-allowed'}`}
                        title={!isPremium ? "Premium feature" : ""}
                    >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
               )}
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
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center">
              Read on Source
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ArticleViewModal;
