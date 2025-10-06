import { useState, useEffect, useCallback } from 'react';

export const useTTS = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    
    useEffect(() => {
        const checkSupport = () => setIsSupported('speechSynthesis' in window);
        checkSupport();
    }, []);

    const speak = useCallback((text: string) => {
        if (!isSupported) return;
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        utterance.onpause = () => {
            setIsPlaying(false);
            setIsPaused(true);
        };

        utterance.onresume = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };
        
        window.speechSynthesis.speak(utterance);
    }, [isSupported]);

    const pause = useCallback(() => {
        if (isSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
    }, [isSupported]);

    const resume = useCallback(() => {
        if (isSupported && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }, [isSupported]);

    const stop = useCallback(() => {
        if (isSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        setIsPaused(false);
    }, [isSupported]);

    useEffect(() => {
      // Cleanup on unmount
      return () => {
        if (isSupported) {
          window.speechSynthesis.cancel();
        }
      };
    }, [isSupported]);

    return { isPlaying, isPaused, isSupported, speak, pause, resume, stop };
};
