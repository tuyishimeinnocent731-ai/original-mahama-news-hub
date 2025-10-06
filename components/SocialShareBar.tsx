
import React from 'react';
import { FacebookShareIcon, TwitterShareIcon, LinkedInShareIcon, RedditShareIcon } from './icons/SocialShareIcons';

interface SocialShareBarProps {
    url: string;
    title: string;
}

const SocialShareBar: React.FC<SocialShareBarProps> = ({ url, title }) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: <FacebookShareIcon /> },
        { name: 'Twitter', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, icon: <TwitterShareIcon /> },
        { name: 'LinkedIn', href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`, icon: <LinkedInShareIcon /> },
        { name: 'Reddit', href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, icon: <RedditShareIcon /> },
    ];

    return (
        <div className="flex items-center space-x-4">
            <span className="font-semibold text-sm">Share:</span>
            {shareLinks.map(link => (
                <a 
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-yellow-500 transition-colors"
                    aria-label={`Share on ${link.name}`}
                >
                    {link.icon}
                </a>
            ))}
        </div>
    );
};

export default SocialShareBar;
