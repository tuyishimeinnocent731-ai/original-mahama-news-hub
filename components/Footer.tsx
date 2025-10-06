import React from 'react';
import { FacebookIcon, TwitterIcon, InstagramIcon } from './icons/SocialIcons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-900 dark:bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                 <h3 className="text-xl font-bold mb-2">Mahama News TV</h3>
                 <p className="text-sm text-gray-400">Your trusted source for unbiased news.</p>
                 <div className="flex space-x-4 mt-4">
                    <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white"><FacebookIcon /></a>
                    <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white"><TwitterIcon /></a>
                    <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white"><InstagramIcon /></a>
                 </div>
            </div>
            <div>
                 <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
                 <p className="text-gray-400 mb-4 text-sm">Stay updated with the latest news by subscribing to our newsletter.</p>
                 <form onSubmit={(e) => {e.preventDefault(); alert('Thank you for subscribing!'); }}>
                    <div className="flex">
                        <input type="email" placeholder="Enter your email" className="w-full px-4 py-2 rounded-l-md text-gray-900 focus:outline-none" required/>
                        <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-r-md">Subscribe</button>
                    </div>
                 </form>
            </div>
             <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Mahama News TV. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
