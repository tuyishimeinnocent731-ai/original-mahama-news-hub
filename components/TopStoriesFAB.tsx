import React from 'react';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface TopStoriesFABProps {
  onOpen: () => void;
}

const TopStoriesFAB: React.FC<TopStoriesFABProps> = ({ onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="lg:hidden fixed bottom-20 right-5 z-20 flex items-center justify-center pl-3 pr-4 py-3 bg-accent text-accent-foreground rounded-full shadow-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-300 transform hover:scale-105"
      aria-label="See Top Stories"
    >
      <TrendingUpIcon className="w-5 h-5 mr-2" />
      <span className="text-sm font-semibold">Top Stories</span>
    </button>
  );
};

export default TopStoriesFAB;
