
import React, { useState, useEffect } from 'react';

const ReadingProgressBar: React.FC = () => {
  const [width, setWidth] = useState(0);

  const scrollListener = () => {
    const element = document.documentElement;
    const totalHeight = element.scrollHeight - element.clientHeight;
    if (totalHeight <= 0) {
        setWidth(0);
        return;
    }
    const windowScroll = element.scrollTop;
    const scroll = (windowScroll / totalHeight) * 100;
    setWidth(scroll);
  };

  useEffect(() => {
    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full h-1 bg-transparent">
      <div 
        className="h-full bg-yellow-500 transition-all duration-75 ease-out" 
        style={{ width: `${width}%` }}
      ></div>
    </div>
  );
};

export default ReadingProgressBar;
