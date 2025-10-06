import React from 'react';

const InArticleAd: React.FC = () => {
    return (
        <div className="my-8">
            <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <img 
                            className="h-24 w-24 object-cover rounded" 
                            src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=400"
                            alt="Brand Logo" 
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400">
                                Your Next Favorite Productivity App
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">Ad</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Streamline your tasks, manage projects, and collaborate with your team like never before. Try it for free!
                        </p>
                    </div>
                </div>
            </a>
        </div>
    );
};

export default InArticleAd;
