import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavClick: (category: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavClick }) => {
    const navLinks = ["World", "Politics", "Business", "Economy", "Technology", "Sport", "History"];
    
    return (
        <div className={`fixed inset-0 z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="fixed top-0 right-0 h-full w-64 bg-gray-900 text-white shadow-lg p-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-bold">Menu</h2>
                    <button onClick={onClose} aria-label="Close menu">
                        <CloseIcon />
                    </button>
                </div>
                <nav>
                    <ul className="space-y-4">
                        <li>
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavClick('home'); onClose(); }} className="block py-2 text-lg hover:text-yellow-400">Home</a>
                        </li>
                        {navLinks.map(link => (
                             <li key={link}>
                                <a href="#" onClick={(e) => e.preventDefault()} className="block py-2 text-lg hover:text-yellow-400">{link}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default MobileMenu;