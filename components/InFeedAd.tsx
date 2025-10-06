import React from 'react';
import { Ad } from '../types';

interface InFeedAdProps {
    ad: Ad;
}

const InFeedAd: React.FC<InFeedAdProps> = ({ ad }) => {
    return (
        <a 
            href={ad.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
        >
            <div className="relative">
                <img 
                    className="h-48 w-full object-cover" 
                    src={ad.image}
                    alt={ad.headline} 
                />
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    Sponsored
                </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex-grow group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                    {ad.headline}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    Check out this special offer from our sponsor. Click to learn more.
                </p>
                <div className="mt-auto text-xs text-gray-500 dark:text-gray-400">
                    <span>From Our Sponsor</span>
                </div>
            </div>
        </a>
    );
};

export default InFeedAd;