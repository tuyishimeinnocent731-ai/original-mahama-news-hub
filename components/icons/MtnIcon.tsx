import React from 'react';

export const MtnIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-12" }) => (
    <svg className={className} viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="60" rx="5" fill="#FFCC00"/>
        <path d="M25 15 L35 45 L45 15" stroke="#004990" strokeWidth="5" fill="none"/>
        <path d="M55 45 L65 15 L75 45" stroke="#004990" strokeWidth="5" fill="none"/>
        <circle cx="50" cy="30" r="18" stroke="#D90000" strokeWidth="5" fill="none" />
    </svg>
);