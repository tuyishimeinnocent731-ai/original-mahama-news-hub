import React from 'react';

export const MastercardIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-12" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 240">
        <path fill="#FF5F00" d="M149.2 240H49.8C22.3 240 0 217.7 0 190.2V49.8C0 22.3 22.3 0 49.8 0h99.4v240z"/>
        <path fill="#EB001B" d="M334.2 0H234.8v240h99.4c27.5 0 49.8-22.3 49.8-49.8V49.8c0-27.5-22.3-49.8-49.8-49.8z"/>
        <path fill="#F79E1B" d="M234.8 120c0 41.5-33.7 75.2-75.2 75.2S84.4 161.5 84.4 120s33.7-75.2 75.2-75.2 75.2 33.7 75.2 75.2z"/>
    </svg>
);
