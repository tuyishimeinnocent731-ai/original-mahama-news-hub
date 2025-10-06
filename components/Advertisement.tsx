import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

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
    const [currentAd, setCurrentAd] = useState<Ad>(mockAds[0]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const adInterval = setInterval(() => {
            setCurrentAd(prevAd => {
                const nextIndex = (prevAd.id % mockAds.length);
                return mockAds[nextIndex];
            });
        }, 10000); // Rotate ad every 10 seconds

        return () => clearInterval(adInterval);
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 relative shadow-md">
            <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-1 right-1 bg-gray-600/50 text-white rounded-full p-1 hover:bg-gray-800/70 z-10"
                aria-label="Close ad"
            >
                <CloseIcon />
            </button>
            <a href={currentAd.url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="relative overflow-hidden rounded-md">
                    <img src={currentAd.image} alt={currentAd.headline} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                     <div className="absolute bottom-0 left-0 p-3">
                        <h4 className="text-white font-bold text-lg leading-tight">{currentAd.headline}</h4>
                     </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Advertisement</span>
                     <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-md group-hover:bg-blue-700 transition-colors">
                        {currentAd.cta}
                     </span>
                </div>
            </a>
        </div>
    );
};

export default Advertisement;