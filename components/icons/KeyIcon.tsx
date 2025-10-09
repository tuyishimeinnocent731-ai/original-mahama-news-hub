import React from 'react';

export const KeyIcon: React.FC<{className?: string}> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a1 1 0 011-1h2.157a6.002 6.002 0 0111.843 0H23M3 9a2 2 0 012-2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2M3 9a2 2 0 00-2 2" />
    </svg>
);