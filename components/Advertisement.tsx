import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface Ad {
    id: number;
    image: string;
    headline: string;
    cta: string;
    url: string;
}

const mockAds: Ad[] = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1511389026284-d62134a11773?q=80&w=800',
        headline: 'Blazing Fast Web Hosting',
        cta: 'Learn More',
        url: '#',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=800',
        headline: 'Master Your Workflow',
        cta: 'Get Started',
        url: '#',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800',
        headline: 'The Ultimate Design Tool',
        cta: 'Try for Free',
        url: '#',
    }
];

const Advertisement: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const nextAd = useCallback(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % mockAds.length);
    }, []);

    const prevAd = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + mockAds.length) % mockAds.length);
    };

    useEffect(() => {
        const adInterval = setInterval(nextAd, 10000); // Rotate ad every 10 seconds
        return () => clearInterval(adInterval);
    }, [nextAd]);

    if (!isVisible) {
        return null;
    }

    const currentAd = mockAds[currentIndex];

    return (
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 relative shadow-md overflow-hidden group">
            <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-1 right-1 bg-gray-600/50 text-white rounded-full p-1 hover:bg-gray-800/70 z-20"
                aria-label="Close ad"
            >
                <CloseIcon />
            </button>
            
            {/* Carousel Arrows */}
            <button onClick={prevAd} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-black/30 hover:bg-black/50 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous Ad">
                <ChevronLeftIcon className="h-5 w-5"/>
            </button>
             <button onClick={nextAd} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-black/30 hover:bg-black/50 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next Ad">
                <ChevronRightIcon className="h-5 w-5"/>
            </button>


            <a href={currentAd.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative overflow-hidden rounded-md">
                    <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                         {mockAds.map(ad => (
                            <img key={ad.id} src={ad.image} alt={ad.headline} className="w-full h-40 object-cover flex-shrink-0" />
                         ))}
                    </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                     <div className="absolute bottom-0 left-0 p-3">
                        <h4 className="text-white font-bold text-lg leading-tight">{currentAd.headline}</h4>
                     </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Advertisement</span>
                     <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-md hover:bg-blue-700 transition-colors">
                        {currentAd.cta}
                     </span>
                </div>
            </a>
            
             {/* Carousel Dots */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                {mockAds.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}></button>
                ))}
            </div>
        </div>
    );
};

export default Advertisement;