import React from 'react';
import { NAV_LINKS } from '../constants';
import { FacebookIcon, TwitterIcon, InstagramIcon } from './icons/SocialIcons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-800 dark:bg-gray-900 text-white mt-auto">
      <div className="container mx-auto py-8 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Mahama News Hub</h2>
            <p className="text-sm text-gray-300">Your daily source of reliable news.</p>
          </div>
          {NAV_LINKS.slice(0, 3).map((link) => (
            <div key={link.name}>
              <h3 className="font-semibold mb-3 uppercase tracking-wider">{link.name}</h3>
              <ul className="space-y-2">
                {link.sublinks ? link.sublinks.map(sub => (
                  <li key={sub.name}><a href={sub.href} className="text-gray-300 hover:text-yellow-300 text-sm">{sub.name}</a></li>
                )) : <li><a href={link.href} className="text-gray-300 hover:text-yellow-300 text-sm">{link.name}</a></li>}
              </ul>
            </div>
          ))}
           <div>
              <h3 className="font-semibold mb-3 uppercase tracking-wider">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-yellow-300 text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-300 text-sm">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-300 text-sm">Careers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-300 text-sm">Privacy Policy</a></li>
              </ul>
            </div>
        </div>
        <div className="mt-8 pt-6 border-t border-blue-700 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Mahama News Hub. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook"><FacebookIcon /></a>
            <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter"><TwitterIcon /></a>
            <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram"><InstagramIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;