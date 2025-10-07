import React from 'react';

// FIX: Update component to accept all standard SVG props for better flexibility (e.g., for passing style).
export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = "h-6 w-6", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
