import React, { useEffect, useState, useRef } from 'react';
import Modal from './Modal';
import { Article } from '../types';
import { useTTS } from '../hooks/useTTS';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { ShareIcon } from './icons/ShareIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface ArticleViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  fontSize: 'sm' | 'base' | 'lg';
}

const ReadingProgressBar: React.FC<{ target: React.RefObject<HTMLDivElement> }> = ({ target }) => {
    const [readingProgress, setReadingProgress] = useState(0);
    const scrollListener = () => {
        if (!target.current) return;
        
        const element = target.current;
        const totalHeight = element.scrollHeight - element.clientHeight;
        setReadingProgress((element.scrollTop / totalHeight) * 100);
    };

    useEffect(() => {
        const targetEl = target.current;
        if (!targetEl) return;

        targetEl.addEventListener("scroll", scrollListener);
        return () => targetEl.removeEventListener("scroll", scrollListener);
    });

    return (
        <div className="sticky top-0 h-1 w-full bg-gray-200 dark:bg-gray-700">
            <div className="h-1 bg-yellow-500" style={{ width: `${readingProgress}%` }} />
        </div>
    );
};

const ArticleViewModal: React.FC<ArticleViewModalProps> = ({ isOpen, onClose, article, fontSize }) => {
  const { isPlaying, speak, stop, pause, resume, isPaused } = useTTS();
  const contentRef = useRef<HTMLDivElement>(null);
  
  if (!article) return null;
  
  const wordsPerMinute = 200;
  const wordCount = article.body.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  const handleTTSToggle = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if(isPaused) {
      resume();
    } else {
      speak(`${article.title}. ${article.body}`);
    }
  }

  const handleClose = () => {
      stop();
      onClose();
  }
  
  const FONT_SIZE_MAPS = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="relative max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold">{article.title}</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span>By {article.author || 'Unknown'} / {article.source.name}</span>
            <span className="mx-2">•</span>
            <span>{readingTime} min read</span>
          </div>
        </div>

        <div ref={contentRef} className="overflow-y-auto flex-grow">
            <ReadingProgressBar target={contentRef}/>
            <div className="p-6">
                <img src={article.urlToImage} alt={article.title} className="w-full h-auto max-h-80 object-cover rounded-md mb-6" />
                <div className={`prose dark:prose-invert max-w-none ${FONT_SIZE_MAPS[fontSize]}`}>
                    <p className="lead font-semibold">{article.description}</p>
                    {article.body.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button onClick={handleTTSToggle} aria-label="Play or pause text to speech" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300">
              {isPlaying && !isPaused ? <PauseIcon /> : <PlayIcon />}
            </button>
             <button aria-label="Bookmark article" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300">
                <BookmarkIcon />
            </button>
             <button aria-label="Share article" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300">
                <ShareIcon />
            </button>
          </div>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-yellow-600 dark:text-yellow-400 hover:underline font-medium"
          >
            Read Full Story on {article.source.name}
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default ArticleViewModal;
