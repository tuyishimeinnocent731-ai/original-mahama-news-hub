import React from 'react';

export const DataSyncIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10m16-10v10M4 12a8 8 0 0116 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15l3 3m0 0l3-3m-3 3V9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-3-3m0 0l-3 3m3-3v6" />
    </svg>
);