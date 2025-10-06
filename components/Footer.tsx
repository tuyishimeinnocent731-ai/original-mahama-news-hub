
import React from 'react';
import { NAV_LINKS } from '../constants';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './icons/SocialIcons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-900 dark:bg-gray-900 text-blue-200 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="col-span-2">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Mahama News Hub</h2>
            <p className="text-sm text-blue-300 max-w-sm">Your trusted source for news and information. We provide unbiased, in-depth coverage of the stories that matter.</p>
          </div>

          {NAV_LINKS.slice(0, 3).map((link) => (
            <div key={link.name}>
              <h3 className="font-semibold text-white mb-4">{link.name}</h3>
              <ul className="space-y-2">
                {link.sublinks?.map((sub) => (
                  <li key={sub.name}><a href={sub.href} className="text-sm hover:text-yellow-300 transition-colors">{sub.name}</a></li>
                ))}
                {!link.sublinks && (
                     <li><a href={link.href} className="text-sm hover:text-yellow-300 transition-colors">{link.name}</a></li>
                )}
              </ul>
            </div>
          ))}

          <div>
             <h3 className="font-semibold text-white mb-4">Follow Us</h3>
             <div className="flex space-x-4">
                <a href="#" aria-label="Facebook" className="hover:text-white"><FacebookIcon /></a>
                <a href="#" aria-label="Twitter" className="hover:text-white"><TwitterIcon /></a>
                <a href="#" aria-label="Instagram" className="hover:text-white"><InstagramIcon /></a>
             </div>
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
