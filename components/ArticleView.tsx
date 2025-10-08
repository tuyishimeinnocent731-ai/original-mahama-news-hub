import React, { useState, useEffect } from 'react';
import { Article, User, Ad, Comment as CommentType } from '../types';
import * as newsService from '../services/newsService';
import { useTTS } from '../hooks/useTTS';
import { useSettings } from '../hooks/useSettings';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TranslateIcon } from './icons/TranslateIcon';
import SocialShareBar from './SocialShareBar';
import AIAssistantPanel from './AIAssistantPanel';
import Aside from './Aside';
import InFeedAd from './InFeedAd';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import LoginPrompt from './LoginPrompt';
import ReadingProgressBar from './ReadingProgressBar';
import ImageGallery from './ImageGallery';
import Comment from './Comment';
import { NewspaperIcon } from './icons/NewspaperIcon';

interface ArticleViewProps {
  article: Article;
  user: User | null;
  onBack: () => void;
  onArticleClick: (article: Article) => void;
  onUpgradeClick: () => void;
  onLoginClick: () => void;
  toggleSaveArticle: (article: Article) => void;
  onTagClick: (tag: string) => void;
  customAds?: Ad[];
}

const ArticleView: React.FC<ArticleViewProps> = (props) => {
  const { article, user, onBack, onArticleClick, onUpgradeClick, onLoginClick, toggleSaveArticle, onTagClick, customAds = [] } = props;
  
  const [summary, setSummary] = useState<string>('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [isKeyPointsLoading, setKeyPointsLoading] = useState(false);
  const [isAIAssistantOpen, setAIAssistantOpen] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);
  
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  const [translatedContent, setTranslatedContent] = useState<{ title: string; body: string; language: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const [comments, setComments] = useState<CommentType[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const { isPlaying, isSupported, speak, stop, pause } = useTTS();
  const { settings } = useSettings();
  const isSaved = user?.savedArticles?.includes(article.id) ?? false;
  const isPremium = user?.subscription === 'premium' || user?.subscription === 'pro';
  
  const inArticleAd = customAds && customAds.length > 0
    ? customAds[Math.floor(Math.random() * customAds.length)]
    : null;

  useEffect(() => {
    setSummary('');
    setKeyPoints([]);
    setAnswer('');
    stop();
    setAIAssistantOpen(false);
    setIsRelatedLoading(true);
    setTranslatedContent(null);
    setIsTranslating(false);

    const fetchRelated = async () => {
      try {
        const related = await newsService.getRelatedArticles(article.id, article.category);
        setRelatedArticles(related);
      } catch (error) {
        console.error("Failed to fetch related articles", error);
      } finally {
        setIsRelatedLoading(false);
      }
    };
    
    const fetchComments = async () => {
        setIsCommentsLoading(true);
        try {
            const fetchedComments = await newsService.getComments(article.id);
            setComments(fetchedComments);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setIsCommentsLoading(false);
        }
    };

    fetchRelated();
    fetchComments();

    if (user && isPremium && settings.reading.defaultSummaryView) {
        handleGenerateSummary();
    }
  }, [article.id]);

    useEffect(() => {
    if (user && isPremium && settings.reading.autoPlayAudio && isSupported && article) {
      const textToSpeak = summary || `${article.title}. ${article.description}. ${article.body}`;
      speak(textToSpeak);
    }
  }, [summary, article.id, user, isPremium, settings.reading.autoPlayAudio, isSupported]);


  const handleGenerateSummary = async () => {
    if (!isPremium) return;
    setSummaryLoading(true);
    const generatedSummary = await newsService.summarizeArticle(article.body, article.title);
    setSummary(generatedSummary);
    setSummaryLoading(false);
  };

  const handleGenerateKeyPoints = async () => {
    if (!isPremium) return;
    setKeyPointsLoading(true);
    const generatedKeyPoints = await newsService.getKeyPoints(article.body);
    setKeyPoints(generatedKeyPoints);
    setKeyPointsLoading(false);
  };
  
  const handleAskQuestion = async (question: string) => {
    if (!isPremium || !question) return;
    setIsAnswering(true);
    setAnswer('');
    const generatedAnswer = await newsService.askAboutArticle(article.body, article.title, question);
    setAnswer(generatedAnswer);
    setIsAnswering(false);
  };

  const handlePlayAudio = () => {
    if (!isPremium) {
        onUpgradeClick();
        return;
    }
    if (isPlaying) {
      pause();
    } else {
      const textToSpeak = summary || `${article.title}. ${article.description}. ${article.body}`;
      speak(textToSpeak);
    }
  };
  
  const handleToggleSave = () => {
      if (!user) {
          onLoginClick();
          return;
      }
      toggleSaveArticle(article);
  }

  const handleTranslate = async (language: string) => {
    if (!isPremium) {
        onUpgradeClick();
        return;
    }
    setIsTranslating(true);
    const result = await newsService.translateArticle(article.body, article.title, language);
    setTranslatedContent({ ...result, language });
    setIsTranslating(false);
  };

  const handlePostComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !newComment.trim()) return;
      try {
          const postedComment = await newsService.postComment(article.id, newComment.trim());
          setComments(prev => [...prev, postedComment]);
          setNewComment('');
      } catch (error) {
          console.error("Failed to post comment", error);
      }
  };

  const currentTitle = translatedContent?.title || article.title;
  const currentBody = translatedContent?.body || article.body;

  return (
    <div className={settings.reading.justifyText ? 'text-justify' : ''}>
      <ReadingProgressBar />
      <button onClick={onBack} className="flex items-center space-x-2 text-accent hover:underline mb-6 font-semibold">
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Back to News</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <main className="md:col-span-8">
          <article>
            <header className="mb-6">
              <span className="text-sm font-semibold text-accent uppercase">{article.category}</span>
              <h1 className="text-3xl md:text-4xl font-bold my-2 leading-tight">{currentTitle}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-muted-foreground mt-3">
                <span>By {article.author} | {article.source.name}</span>
                <span>{new Date(article.publishedAt).toLocaleString()}</span>
              </div>
            </header>

            <img src={article.urlToImage} alt={article.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-6" />

            {inArticleAd && (
                <div className="my-6 md:my-8 -mx-4 sm:mx-0">
                    <InFeedAd ad={inArticleAd} />
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <button onClick={handleToggleSave} className={`flex items-center space-x-2 transition-colors ${isSaved ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}>
                        <BookmarkIcon className="h-5 w-5" />
                        <span>{isSaved ? 'Saved' : 'Save Article'}</span>
                    </button>
                    {isSupported && (
                        <button onClick={handlePlayAudio} className={`flex items-center space-x-2 ${isPremium ? 'text-muted-foreground hover:text-accent' : 'text-muted-foreground/50 cursor-not-allowed'}`}>
                           {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                           <span>{isPlaying ? 'Pause' : 'Listen'}</span>
                        </button>
                    )}
                     <div className="relative group">
                        <button disabled={isTranslating} className={`flex items-center space-x-2 ${isPremium ? 'text-muted-foreground hover:text-accent' : 'text-muted-foreground/50 cursor-not-allowed'}`}>
                           <TranslateIcon />
                           <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
                        </button>
                        {isPremium && (
                             <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-popover text-popover-foreground rounded-md shadow-lg border border-border py-1 z-10">
                                <button onClick={() => handleTranslate('Spanish')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary">Spanish</button>
                                <button onClick={() => handleTranslate('French')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary">French</button>
                                <button onClick={() => handleTranslate('German')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary">German</button>
                             </div>
                        )}
                    </div>
                </div>
                 <SocialShareBar url={article.url} title={article.title} />
            </div>
            
            {translatedContent && (
                <div className="mb-6 p-3 bg-secondary rounded-md text-sm">
                    Translated to {translatedContent.language} by Gemini. 
                    <button onClick={() => setTranslatedContent(null)} className="ml-2 font-semibold text-accent hover:underline">Show Original</button>
                </div>
            )}

            <div className="prose dark:prose-invert max-w-none text-lg">
                <p className="lead font-semibold">{article.description}</p>
                 <ImageGallery images={article.galleryImages} />
                {currentBody.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>

            {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-base font-semibold mb-3">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => onTagClick(tag)}
                                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <section className="mt-12 pt-8 border-t border-border">
                <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>
                <div className="space-y-6">
                    {isCommentsLoading ? <p>Loading comments...</p> : 
                        comments.length > 0 ? comments.map(comment => <Comment key={comment.id} comment={comment}/>)
                        : <div className="text-center py-10 bg-secondary rounded-lg">
                            <NewspaperIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                            <h3 className="text-lg font-semibold">No Comments Yet</h3>
                            <p className="text-sm text-muted-foreground">Be the first to share your thoughts.</p>
                          </div>
                    }
                </div>
                <div className="mt-8">
                    {user ? (
                        <form onSubmit={handlePostComment} className="flex items-start space-x-3">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-1">
                                <textarea 
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Add to the discussion..."
                                    rows={3}
                                    className="w-full p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent"
                                ></textarea>
                                <button type="submit" className="mt-2 px-4 py-2 bg-accent text-accent-foreground rounded-md font-semibold text-sm hover:bg-accent/90 disabled:bg-muted" disabled={!newComment.trim()}>
                                    Post Comment
                                </button>
                            </div>
                        </form>
                    ) : (
                        <LoginPrompt onLoginClick={onLoginClick} message="Join the conversation" subMessage="Log in or create an account to post a comment." />
                    )}
                </div>
            </section>
          </article>
        </main>

        <div className="md:col-span-4">
            <div className="sticky top-24 space-y-8">
                <div>
                     <button onClick={() => setAIAssistantOpen(true)} className="w-full flex items-center justify-center p-3 mb-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition-colors shadow-lg">
                        <SparklesIcon className="h-6 w-6 mr-2" />
                        AI Companion
                    </button>
                    {user ? 
                        <Aside
                            title="Related Stories"
                            articles={relatedArticles}
                            onArticleClick={onArticleClick}
                            isLoading={isRelatedLoading}
                            customAds={customAds}
                        />
                        : 
                         <LoginPrompt 
                            onLoginClick={onLoginClick} 
                            message="See related stories"
                            subMessage="Log in to view articles related to this topic and access more features."
                        />
                    }
                </div>
            </div>
        </div>
      </div>

      <AIAssistantPanel
        isOpen={isAIAssistantOpen}
        onClose={() => setAIAssistantOpen(false)}
        summary={summary}
        keyPoints={keyPoints}
        answer={answer}
        isSummaryLoading={isSummaryLoading}
        isKeyPointsLoading={isKeyPointsLoading}
        isAnswering={isAnswering}
        onGenerateSummary={handleGenerateSummary}
        onGenerateKeyPoints={handleGenerateKeyPoints}
        onAskQuestion={handleAskQuestion}
        isPremium={isPremium}
        onUpgradeClick={onUpgradeClick}
      />
    </div>
  );
};

export default ArticleView;