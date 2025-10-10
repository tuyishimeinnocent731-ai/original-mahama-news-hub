import React, { useState, useEffect, useRef } from 'react';
import * as newsService from '../../services/newsService';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../LoadingSpinner';
import { SparklesIcon } from '../icons/SparklesIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { FilmIcon } from '../icons/FilmIcon';

const loadingMessages = [
    "Warming up the virtual cameras...",
    "This can take a few minutes, please be patient.",
    "Composing the perfect shot...",
    "Choreographing digital actors...",
    "Checking the lighting...",
    "Rendering the final cut...",
    "Polling the Gemini servers for an update...",
];

const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    
    const [operation, setOperation] = useState<any>(null);
    const pollIntervalRef = useRef<number | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        let messageInterval: number;
        if (isLoading) {
            setLoadingMessage(loadingMessages[0]);
            let i = 1;
            messageInterval = window.setInterval(() => {
                setLoadingMessage(loadingMessages[i % loadingMessages.length]);
                i++;
            }, 4000);
        }
        return () => {
            if (messageInterval) clearInterval(messageInterval);
        };
    }, [isLoading]);

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const pollOperation = (op: any) => {
        pollIntervalRef.current = window.setInterval(async () => {
            try {
                const updatedOp = await newsService.getVideoOperation(op);
                if (updatedOp.done) {
                    clearInterval(pollIntervalRef.current!);
                    setIsLoading(false);
                    if (updatedOp.error) {
                         setError(`Generation failed: ${updatedOp.error.message}`);
                         addToast(`Generation failed: ${updatedOp.error.message}`, 'error');
                    } else {
                         const dataUrl = updatedOp.response?.generatedVideos?.[0]?.video?.dataUrl;
                         if(dataUrl) {
                            setVideoUrl(dataUrl);
                            addToast('Video generated successfully!', 'success');
                         } else {
                            setError('Generation finished, but no video URL was found.');
                            addToast('Generation finished, but no video URL was found.', 'error');
                         }
                    }
                    setOperation(null);
                } else {
                    setOperation(updatedOp);
                }
            } catch (err: any) {
                clearInterval(pollIntervalRef.current!);
                setIsLoading(false);
                setError(err.message || 'Failed to poll for video status.');
                addToast(err.message || 'Failed to poll for video status.', 'error');
            }
        }, 10000); // Poll every 10 seconds
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) {
            addToast('Please enter a prompt for the video.', 'warning');
            return;
        }

        setIsLoading(true);
        setError('');
        setVideoUrl(null);

        const formData = new FormData();
        formData.append('prompt', prompt);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const initialOp = await newsService.generateVideo(formData);
            setOperation(initialOp);
            pollOperation(initialOp);
        } catch (err: any) {
            setIsLoading(false);
            setError(err.message || 'Failed to start video generation.');
            addToast(err.message || 'Failed to start video generation.', 'error');
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Video Studio</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg border-border">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium mb-1">Video Prompt</label>
                        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="w-full p-2 border rounded-md" placeholder="e.g., A neon hologram of a cat driving at top speed"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Optional Image</label>
                         <label htmlFor="video-image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg bg-secondary hover:bg-muted">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                            ) : (
                                <div className="text-center">
                                    <UploadIcon className="mx-auto w-8 h-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Click to upload an image</p>
                                </div>
                            )}
                        </label>
                        <input id="video-image-upload" type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold disabled:bg-muted">
                        <SparklesIcon className="w-5 h-5"/>
                        {isLoading ? 'Generating...' : 'Generate Video'}
                    </button>
                </form>

                <div className="bg-secondary rounded-lg p-6 flex items-center justify-center min-h-[300px]">
                    {isLoading ? (
                        <div className="text-center">
                            <LoadingSpinner />
                            <p className="mt-4 font-semibold text-lg">{loadingMessage}</p>
                        </div>
                    ) : error ? (
                        <p className="text-destructive text-center">{error}</p>
                    ) : videoUrl ? (
                        <div className="w-full">
                             <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-lg"></video>
                             <a href={videoUrl} download={`mahamanews-video-${Date.now()}.mp4`} className="block w-full text-center mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Download Video</a>
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground">
                            <FilmIcon className="mx-auto w-16 h-16" />
                            <p className="mt-2 font-semibold">Your generated video will appear here.</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoGenerator;
