import React from 'react';
import { NavLink } from '../types';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './icons/SocialIcons';

interface FooterProps {
    navLinks: NavLink[];
    onAboutClick: () => void;
    onContactClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ navLinks, onAboutClick, onContactClick }) => {
  return (
    <footer className="bg-primary text-primary-foreground/80 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
                 <h2 className="text-xl font-bold text-accent mb-4">Mahama News Hub</h2>
                 <p className="text-sm max-w-sm mb-6">Your trusted source for news and information. We provide unbiased, in-depth coverage of the stories that matter.</p>
                 <div className="flex space-x-4">
                    <a href="#" aria-label="Facebook" className="hover:text-accent transition-colors"><FacebookIcon /></a>
                    <a href="#" aria-label="Twitter" className="hover:text-accent transition-colors"><TwitterIcon /></a>
                    <a href="#" aria-label="Instagram" className="hover:text-accent transition-colors"><InstagramIcon /></a>
                 </div>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
                 {navLinks.filter(l => l.sublinks && l.sublinks.length > 0).slice(0, 2).map((link) => (
                    <div key={link.id}>
                        <h3 className="font-semibold text-primary-foreground mb-4">{link.name}</h3>
                        <ul className="space-y-2">
                            {link.sublinks?.map((sub) => (
                            <li key={sub.id}><a href={sub.href} className="text-sm hover:text-accent transition-colors">{sub.name}</a></li>
                            ))}
                        </ul>
                    </div>
                ))}
                 <div>
                    <h3 className="font-semibold text-primary-foreground mb-4">Company</h3>
                    <ul className="space-y-2">
                        <li><button onClick={onAboutClick} className="text-sm hover:text-accent transition-colors">About Us</button></li>
                        <li><button onClick={onContactClick} className="text-sm hover:text-accent transition-colors">Contact Us</button></li>
                        <li><a href="#" className="text-sm hover:text-accent transition-colors">Careers</a></li>
                        <li><a href="#" className="text-sm hover:text-accent transition-colors">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <div className="lg:col-span-3">
                <h3 className="font-semibold text-primary-foreground mb-4">Subscribe to our Newsletter</h3>
                <p className="text-sm mb-4">Get the latest news and top stories delivered to your inbox weekly.</p>
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
                    <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                    <input 
                        type="email"
                        id="newsletter-email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 text-sm text-foreground bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button type="submit" className="px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-md hover:bg-accent/90 transition-colors flex-shrink-0">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
        <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Mahama News Hub. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;