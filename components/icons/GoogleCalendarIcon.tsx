import React from 'react';

export const GoogleCalendarIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" fill="#34A853"/>
        <path d="M14 11h-4v4h4v-4z" fill="#4285F4"/>
    </svg>
);