import React from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    
    // Logic to show a limited number of page buttons with ellipsis
    const pageLimit = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        endPage = Math.min(totalPages, pageLimit);
    }
    if (currentPage > totalPages - 3) {
        startPage = Math.max(1, totalPages - pageLimit + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {startPage > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-secondary">1</button>
                    {startPage > 2 && <span className="px-2 py-1.5 text-sm text-muted-foreground">...</span>}
                </>
            )}

            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-md ${currentPage === number ? 'bg-accent text-accent-foreground shadow' : 'hover:bg-secondary'}`}
                    aria-current={currentPage === number ? 'page' : undefined}
                >
                    {number}
                </button>
            ))}

             {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="px-2 py-1.5 text-sm text-muted-foreground">...</span>}
                    <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-secondary">{totalPages}</button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
            >
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Pagination;