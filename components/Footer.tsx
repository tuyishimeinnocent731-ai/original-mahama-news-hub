import React from 'react';
import { NavLink } from '../types';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './icons/SocialIcons';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface FooterProps {
    navLinks: NavLink[];
    onAboutClick: () => void;
    onContactClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ navLinks, onAboutClick, onContactClick }) => {
  return (
    <footer className="bg-primary text-primary-foreground/80 mt-8">
      <div className="container mx-auto px-4 py-4"> {/* Reduced vertical padding */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-x-8 gap-y-6">
          
          {/* LEFT SIDE: Brand info */}
          <div className="flex-shrink-0">
             <h2 className="text-xl font-bold text-accent mb-2">Mahama News Hub</h2>
             <p className="text-xs text-primary-foreground/70 max-w-xs">
               Your trusted source for news and information.
             </p>
             <div className="flex space-x-3 mt-4">
                <a href="#" aria-label="Facebook" className="hover:text-accent transition-colors"><FacebookIcon className="w-5 h-5" /></a>
                <a href="#" aria-label="Twitter" className="hover:text-accent transition-colors"><TwitterIcon className="w-5 h-5" /></a>
                <a href="#" aria-label="Instagram" className="hover:text-accent transition-colors"><InstagramIcon className="w-5 h-5" /></a>
             </div>
          </div>

          {/* RIGHT SIDE: Links and Subscription grouped */}
          <div className="w-full sm:w-auto flex-grow flex flex-wrap justify-start sm:justify-end gap-x-10 gap-y-8 text-sm">
            {/* Links Columns */}
            {navLinks.filter(l => l.sublinks && l.sublinks.length > 0).slice(0, 2).map((link) => (
                <div key={link.id}>
                    <h3 className="font-semibold text-primary-foreground mb-3 uppercase tracking-wider">{link.name}</h3>
                    <ul className="space-y-2">
                        {link.sublinks?.map((sub) => (
                        <li key={sub.id}><a href={sub.href} className="hover:text-accent transition-colors">{sub.name}</a></li>
                        ))}
                    </ul>
                </div>
            ))}
            <div>
                <h3 className="font-semibold text-primary-foreground mb-3 uppercase tracking-wider">Company</h3>
                <ul className="space-y-2">
                    <li><button onClick={onAboutClick} className="hover:text-accent transition-colors">About Us</button></li>
                    <li><button onClick={onContactClick} className="hover:text-accent transition-colors">Contact</button></li>
                    <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-accent transition-colors">Privacy</a></li>
                </ul>
            </div>
            
            {/* Subscription Form */}
            <div className="w-full sm:max-w-[240px]">
              <h3 className="font-semibold text-primary-foreground mb-3 uppercase tracking-wider">Stay Updated</h3>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input 
                      type="email"
                      id="newsletter-email"
                      placeholder="Your email"
                      className="w-full px-3 py-1.5 text-sm text-foreground bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button type="submit" className="p-2 bg-accent text-accent-foreground font-semibold rounded-md hover:bg-accent/90 flex-shrink-0" aria-label="Subscribe">
                      <ChevronRightIcon className="w-5 h-5" />
                  </button>
              </form>
            </div>
          </div>

        </div>
        <div className="mt-4 pt-3 border-t border-primary-foreground/20 text-center text-xs"> {/* Reduced margin & padding */}
            <p>&copy; {new Date().getFullYear()} Mahama News Hub. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
