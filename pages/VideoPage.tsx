import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { PlayIcon } from '../components/icons/PlayIcon';

interface VideoPageProps {
    allArticles: Article[];
    onArticleClick: (article: Article) => void;
}

const VideoPage: React.FC<VideoPageProps> = ({ allArticles, onArticleClick }) => {
    // For demo, we'll treat some articles as "videos"
    const videoArticles = allArticles.filter(a => a.category === 'Technology' || a.category === 'Sport').slice(0, 10);
    const [mainVideo, setMainVideo] = useState<Article | null>(null);

    useEffect(() => {
        if (videoArticles.length > 0) {
            setMainVideo(videoArticles[0]);
        }
    }, [allArticles]);

    if (!mainVideo) {
        return <div className="text-center py-20">Loading videos...</div>;
    }

    return (
        <div className="animate-fade-in">
             <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-accent">Video</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Video Player */}
                <div className="lg:col-span-2">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl group cursor-pointer" onClick={() => onArticleClick(mainVideo)}>
                        <img src={mainVideo.urlToImage} alt={mainVideo.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/50 transition-colors">
                                <PlayIcon className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 p-6">
                            <span className="text-sm font-semibold bg-accent text-accent-foreground px-2 py-1 rounded">{mainVideo.category}</span>
                            <h2 className="text-3xl font-bold text-white mt-2 line-clamp-2">{mainVideo.title}</h2>
                        </div>
                    </div>
                     <div className="mt-4">
                        <p className="text-muted-foreground">{mainVideo.description}</p>
                        <div className="text-xs text-muted-foreground mt-2">By {mainVideo.author} &bull; {new Date(mainVideo.publishedAt).toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Video Playlist */}
                <div className="lg:col-span-1">
                    <h3 className="text-xl font-bold mb-4">Up Next</h3>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {videoArticles.map(video => (
                            <button key={video.id} onClick={() => setMainVideo(video)} className={`w-full text-left flex space-x-4 p-2 rounded-lg transition-colors ${mainVideo.id === video.id ? 'bg-secondary' : 'hover:bg-secondary/70'}`}>
                                <div className="relative w-32 h-20 flex-shrink-0">
                                    <img src={video.urlToImage} alt={video.title} className="w-full h-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                         <PlayIcon className="w-6 h-6 text-white/80" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold line-clamp-2">{video.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{video.category}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
