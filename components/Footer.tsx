
import React from 'react';
import { NAV_LINKS } from '../constants';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './icons/SocialIcons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-900 dark:bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Logo and About */}
          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Gemini News</h2>
            <p className="text-sm text-gray-400">Your daily source for insightful news, powered by AI.</p>
          </div>
          
          {/* Navigation Links */}
          <div className="col-span-1">
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider">Sections</h3>
            <ul className="space-y-2">
              {NAV_LINKS.slice(0, 5).map(link => (
                <li key={link.name}><a href={link.href} className="hover:text-yellow-300 transition-colors text-sm">{link.name}</a></li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
           <div className="col-span-1">
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-yellow-300 transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition-colors text-sm">Contact</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition-colors text-sm">Privacy Policy</a></li>
            </ul>
          </div>
          
          {/* Social and Newsletter */}
          <div className="col-span-2 lg:col-span-2">
             <h3 className="font-bold text-white mb-4 uppercase tracking-wider">Subscribe to our Newsletter</h3>
             <form className="flex flex-col sm:flex-row gap-2">
                 <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-grow bg-blue-800 dark:bg-gray-800 border border-blue-700 dark:border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                 />
                 <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Subscribe</button>
             </form>
             <div className="mt-6">
                <h3 className="font-bold text-white mb-3 uppercase tracking-wider">Follow Us</h3>
                <div className="flex space-x-4">
                    <a href="#" aria-label="Facebook" className="hover:text-yellow-300 transition-colors"><FacebookIcon/></a>
                    <a href="#" aria-label="Twitter" className="hover:text-yellow-300 transition-colors"><TwitterIcon/></a>
                    <a href="#" aria-label="Instagram" className="hover:text-yellow-300 transition-colors"><InstagramIcon/></a>
                </div>
             </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-blue-800 dark:border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Gemini News. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
