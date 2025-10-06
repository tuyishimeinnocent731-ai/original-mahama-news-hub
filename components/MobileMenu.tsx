import React, { useState } from 'react';
import { NAV_LINKS } from '../constants';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { NavLink } from '../types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (category: string) => void;
}

const MobileMenuItem: React.FC<{
    link: NavLink;
    onCategorySelect: (category: string) => void;
    onClose: () => void;
}> = ({ link, onCategorySelect, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSelect = (category: string) => {
        onCategorySelect(category);
        onClose();
    };

    const handleToggle = () => {
        if (link.sublinks) {
            setIsExpanded(!isExpanded);
        } else {
            handleSelect(link.name);
        }
    };

    return (
        <div className="py-2 border-b border-blue-700 dark:border-gray-700">
            <button
                onClick={handleToggle}
                className="w-full flex justify-between items-center text-lg text-white hover:text-yellow-300 focus:outline-none"
            >
                <span>{link.name}</span>
                {link.sublinks && (
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                )}
            </button>
            {link.sublinks && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 mt-2' : 'max-h-0'}`}>
                    <div className="pl-4 pt-2 flex flex-col space-y-2">
                        {link.sublinks.map(sublink => (
                            <button
                                key={sublink.name}
                                onClick={() => handleSelect(sublink.name)}
                                className="text-left text-base text-gray-300 hover:text-yellow-300"
                            >
                                {sublink.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onCategorySelect }) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-blue-800 dark:bg-gray-900 shadow-xl p-5 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-yellow-400">Menu</h2>
            <button onClick={onClose} aria-label="Close menu" className="text-white">
                <CloseIcon />
            </button>
        </div>
        <nav className="flex-grow overflow-y-auto">
          {NAV_LINKS.map(link => (
            <MobileMenuItem key={link.name} link={link} onCategorySelect={onCategorySelect} onClose={onClose} />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;