
import React from 'react';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './icons/SocialIcons';

const Footer: React.FC = () => {
    const footerLinks = {
        'Categories': ['World', 'Politics', 'Business', 'Technology', 'Sport'],
        'Company': ['About Us', 'Contact', 'Careers', 'Advertise'],
        'Legal': ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
    };

    return (
        <footer className="bg-blue-900 dark:bg-gray-900 text-blue-200 mt-16">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="col-span-2 lg:col-span-1">
                        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Mahama News Hub</h2>
                        <p className="text-sm text-blue-300">Your trusted source for daily news and insights from around the world.</p>
                        <div className="flex space-x-4 mt-6">
                           <a href="#" className="hover:text-white" aria-label="Facebook"><FacebookIcon /></a>
                           <a href="#" className="hover:text-white" aria-label="Twitter"><TwitterIcon /></a>
                           <a href="#" className="hover:text-white" aria-label="Instagram"><InstagramIcon /></a>
                        </div>
                    </div>
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="font-semibold text-white mb-4">{title}</h3>
                            <ul className="space-y-2">
                                {links.map(link => (
                                    <li key={link}>
                                        <a href="#" className="text-sm text-blue-300 hover:text-white transition-colors">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-blue-950 dark:bg-black/20">
                <div className="container mx-auto px-4 py-4 text-center text-xs text-blue-300">
                    &copy; {new Date().getFullYear()} Mahama News Hub. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
