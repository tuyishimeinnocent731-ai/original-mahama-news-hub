import React from 'react';

export const MegaphoneIcon: React.FC<{className?: string}> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.118 2.047 18.555 2 19 2a2 2 0 012 2v10a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3.328M12 18a3 3 0 00-3-3H9m0 0l-2 2m2-2v-2m2 2l2-2m-2 2v2" />
    </svg>
);