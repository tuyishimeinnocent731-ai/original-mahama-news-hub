import React from 'react';
import { NAV_LINKS } from '../constants';
import { CloseIcon } from './icons/CloseIcon';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div 
        className="fixed top-0 left-0 h-full w-64 bg-blue-800 dark:bg-gray-900 shadow-xl p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-yellow-400">Menu</h2>
            <button onClick={onClose} aria-label="Close menu">
                <CloseIcon />
            </button>
        </div>
        <nav className="flex flex-col space-y-4">
          {NAV_LINKS.map(link => (
            <div key={link.name}>
                <a href={link.href} className="text-lg text-white hover:text-yellow-300" onClick={onClose}>
                    {link.name}
                </a>
                {link.sublinks && (
                    <div className="pl-4 mt-2 flex flex-col space-y-2">
                        {link.sublinks.map(sublink => (
                             <a key={sublink.name} href={sublink.href} className="text-base text-gray-300 hover:text-yellow-300" onClick={onClose}>
                                {sublink.name}
                            </a>
                        ))}
                    </div>
                )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
