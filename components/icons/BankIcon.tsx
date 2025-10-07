import React from 'react';

export const BankIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-7 6h7m-3 3h3m-3 3h3m-6-3h.01M9 12h.01M6 12h.01M6 15h.01M6 18h.01M12 18h.01M15 18h.01M18 15h.01M18 12h.01M18 9h.01M12 3c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S17.523 3 12 3z" />
    </svg>
);