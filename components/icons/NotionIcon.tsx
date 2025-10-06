import React from 'react';

export const NotionIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg className={className} viewBox="0 0 40 40" fill="currentColor">
        <path d="M24.38 2.5h-18.75v35h18.75c4.14 0 7.5-3.36 7.5-7.5v-20c0-4.14-3.36-7.5-7.5-7.5zM11.88 7.5h.01v25h-2.5v-25h2.5zm12.5 25h-7.5v-25h7.5c2.76 0 5 2.24 5 5v15c0 2.76-2.24 5-5 5z"/>
        <path d="M0 0h40v40H0z" fill="none"/>
    </svg>
);