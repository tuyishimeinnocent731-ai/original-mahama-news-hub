import React from 'react';
import { NavLink } from '../types';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './icons/SocialIcons';

interface FooterProps {
    navLinks: NavLink[];
}

const Footer: React.FC<FooterProps> = ({ navLinks }) => {
  return (
    <footer className="bg-blue-900 dark:bg-gray-900 text-blue-200 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
                 <h2 className="text-xl font-bold text-yellow-400 mb-4">Mahama News Hub</h2>
                 <p className="text-sm text-blue-300 max-w-sm mb-6">Your trusted source for news and information. We provide unbiased, in-depth coverage of the stories that matter.</p>
                 <div className="flex space-x-4">
                    <a href="#" aria-label="Facebook" className="hover:text-white transition-colors"><FacebookIcon /></a>
                    <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><TwitterIcon /></a>
                    <a href="#" aria-label="Instagram" className="hover:text-white transition-colors"><InstagramIcon /></a>
                 </div>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
                 {navLinks.filter(l => l.sublinks && l.sublinks.length > 0).map((link) => (
                    <div key={link.id}>
                        <h3 className="font-semibold text-white mb-4">{link.name}</h3>
                        <ul className="space-y-2">
                            {link.sublinks?.map((sub) => (
                            <li key={sub.id}><a href={sub.href} className="text-sm hover:text-yellow-300 transition-colors">{sub.name}</a></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="lg:col-span-3">
                <h3 className="font-semibold text-white mb-4">Subscribe to our Newsletter</h3>
                <p className="text-sm text-blue-300 mb-4">Get the latest news and top stories delivered to your inbox weekly.</p>
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
                    <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                    <input 
                        type="email"
                        id="newsletter-email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button type="submit" className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors flex-shrink-0">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
        <div className="mt-12 pt-8 border-t border-blue-800 dark:border-gray-700 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Mahama News Hub. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;