import React from 'react';

interface ArticleCardSkeletonProps {
    layoutMode?: 'normal' | 'compact';
}

const ArticleCardSkeleton: React.FC<ArticleCardSkeletonProps> = ({ layoutMode = 'normal' }) => {
    if (layoutMode === 'compact') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-32 w-full bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="flex items-center justify-between">
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 w-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-6">
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-3"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
                <div className="flex items-center justify-between mt-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCardSkeleton;
