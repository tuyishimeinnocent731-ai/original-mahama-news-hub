import React, { useEffect, useRef } from 'react';
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
  allArticles: Article[];
  onSelectArticle: (article: Article) => void;
}

const ReadingProgressBar: React.FC<{ target: React.RefObject<HTMLDivElement> }> = ({ target }) => {
    const [readingProgress, setReadingProgress] = React.useState(0);
    const scrollListener = () => {
        if (!target.current) return;
        
        const element = target.current;
        const totalHeight = element.scrollHeight - element.clientHeight;
        if (totalHeight > 0) {
            setReadingProgress((element.scrollTop / totalHeight) * 100);
        } else {
            setReadingProgress(100);
        }
    };

    useEffect(() => {
        const targetEl = target.current;
        if (!targetEl) return;

        targetEl.addEventListener("scroll", scrollListener);
        return () => targetEl.removeEventListener("scroll", scrollListener);
    });

    return (
        <div className="sticky top-0 h-1 w-full bg-gray-200 dark:bg-gray-700 z-10">
            <div className="h-1 bg-yellow-500" style={{ width: `${readingProgress}%` }} />
        </div>
    );
};

const ArticleViewModal: React.FC<ArticleViewModalProps> = ({ isOpen, onClose, article, fontSize, allArticles, onSelectArticle }) => {
  const { isPlaying, stop, pause, resume, speak, isPaused } = useTTS();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
        contentRef.current.scrollTop = 0;
    }
  }, [article?.id]);
  
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
  
  const otherArticles = allArticles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="relative max-h-[85vh] flex flex-col">
        <div ref={contentRef} className="overflow-y-auto flex-grow">
            <ReadingProgressBar target={contentRef}/>
            <img src={article.urlToImage} alt={article.title} className="w-full h-auto max-h-96 object-cover" />
            <div className="p-6 md:p-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h2>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 border-y dark:border-gray-700 py-3 gap-x-4 gap-y-2">
                        <div className="flex items-center">
                            <span className="font-semibold mr-1.5">Author:</span>
                            <span>{article.author || 'Unknown'}</span>
                        </div>
                         <div className="flex items-center">
                            <span className="font-semibold mr-1.5">Source:</span>
                            <span>{article.source.name}</span>
                        </div>
                        <div className="flex items-center">
                             <span className="font-semibold mr-1.5">Read time:</span>
                            <span>~{readingTime} min</span>
                        </div>
                    </div>

                    {article.keyPoints && article.keyPoints.length > 0 && (
                        <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg mb-6 border-l-4 border-yellow-500">
                            <h4 className="font-bold text-lg mb-2">In a Nutshell</h4>
                            <ul className="space-y-2">
                                {article.keyPoints.map((point, i) => (
                                    <li key={i} className="flex items-start">
                                        <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                        <span className="text-gray-700 dark:text-gray-300">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className={`prose dark:prose-invert max-w-none ${FONT_SIZE_MAPS[fontSize]}`}>
                        <p className="lead font-semibold">{article.description}</p>
                        {article.body.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </div>
            
            {otherArticles.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-800/50 py-8 px-6 md:px-8">
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">Read Also</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {otherArticles.map(other => (
                                <div key={other.id} onClick={() => onSelectArticle(other)} className="cursor-pointer group">
                                    <img src={other.urlToImage} alt={other.title} className="w-full h-32 object-cover rounded-lg mb-2"/>
                                    <h4 className="font-semibold text-sm group-hover:text-yellow-500 dark:group-hover:text-yellow-400 line-clamp-3">{other.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
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
            className="text-yellow-600 dark:text-yellow-400 hover:underline font-medium text-sm"
          >
            Read Full Story
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default ArticleViewModal;