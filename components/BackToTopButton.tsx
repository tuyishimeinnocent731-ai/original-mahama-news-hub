import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from './icons/ArrowUpIcon';

const BackToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button 
            onClick={scrollToTop}
            className={`fixed bottom-5 right-5 p-3 rounded-full bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            aria-label="Go to top"
            style={{ visibility: isVisible ? 'visible' : 'hidden' }}
        >
            <ArrowUpIcon />
        </button>
    );
};

export default BackToTopButton;
