
import React from 'react';
import { FacebookIcon, TwitterIcon, InstagramIcon } from './icons/SocialIcons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-900 dark:bg-gray-900 text-blue-200 mt-auto border-t border-blue-800 dark:border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
             <p className="text-sm">&copy; {new Date().getFullYear()} Mahama News Hub. All Rights Reserved.</p>
          </div>
          <div className="flex items-center space-x-6">
             <a href="#" className="text-sm hover:text-yellow-300 transition-colors">Privacy</a>
             <a href="#" className="text-sm hover:text-yellow-300 transition-colors">Terms</a>
             <div className="flex space-x-4">
                <a href="#" className="hover:text-white" aria-label="Facebook"><FacebookIcon className="w-5 h-5"/></a>
                <a href="#" className="hover:text-white" aria-label="Twitter"><TwitterIcon className="w-5 h-5"/></a>
                <a href="#" className="hover:text-white" aria-label="Instagram"><InstagramIcon className="w-5 h-5"/></a>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
