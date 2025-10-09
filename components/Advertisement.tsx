import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { Ad } from '../types';

interface AdvertisementProps {
    customAds?: Ad[];
}

const Advertisement: React.FC<AdvertisementProps> = ({ customAds = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    
    const allAds = customAds;

    const nextAd = useCallback(() => {
        if (allAds.length === 0) return;
        setCurrentIndex(prevIndex => (prevIndex + 1) % allAds.length);
    }, [allAds.length]);

    const prevAd = () => {
        if (allAds.length === 0) return;
        setCurrentIndex(prevIndex => (prevIndex - 1 + allAds.length) % allAds.length);
    };

    useEffect(() => {
        const adInterval = setInterval(nextAd, 10000);
        return () => clearInterval(adInterval);
    }, [nextAd]);

    if (!isVisible) {
        return null;
    }

    if (allAds.length === 0) {
        return (
             <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">No advertisements available.</p>
            </div>
        );
    }

    const currentAd = allAds[currentIndex];

    return (
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 relative shadow-md overflow-hidden group">
            <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-1 right-1 bg-gray-600/50 text-white rounded-full p-1 hover:bg-gray-800/70 z-20"
                aria-label="Close ad"
            >
                <CloseIcon />
            </button>
            
            <button onClick={prevAd} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-black/30 hover:bg-black/50 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous Ad">
                <ChevronLeftIcon className="h-5 w-5"/>
            </button>
             <button onClick={nextAd} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-black/30 hover:bg-black/50 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next Ad">
                <ChevronRightIcon className="h-5 w-5"/>
            </button>


            <a href={currentAd.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative overflow-hidden rounded-md">
                     <img src={currentAd.image} alt={currentAd.headline} className="w-full h-40 object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                     <div className="absolute bottom-0 left-0 p-3">
                        <h4 className="text-white font-bold text-lg leading-tight">{currentAd.headline}</h4>
                     </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Sponsored Content
                    </span>
                     <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-md hover:bg-blue-700 transition-colors">
                        Learn More
                     </span>
                </div>
            </a>
            
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                {allAds.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}></button>
                ))}
            </div>
        </div>
    );
};

export default Advertisement;