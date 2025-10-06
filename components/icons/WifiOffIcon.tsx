import React from 'react';

export const WifiOffIcon: React.FC<{className?: string}> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.555a5.5 5.5 0 017.778 0M12 20.25a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-.01zM3.69 13.03a9.5 9.5 0 0113.438 0M1.75 1.75l20.5 20.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.06 9.04a2.5 2.5 0 013.444 3.444" />
    </svg>
);