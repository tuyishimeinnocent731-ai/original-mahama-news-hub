import { NavLink, SubscriptionPlan } from "./types";

export const NAV_LINKS: NavLink[] = [
    { name: "World", href: "#", sublinks: [
        { name: "Africa", href: "#" },
        { name: "Americas", href: "#" },
        { name: "Asia", href: "#" },
        { name: "Europe", href: "#" },
    ]},
    { name: "Politics", href: "#" },
    { name: "Business", href: "#", sublinks: [
        { name: "Markets", href: "#" },
        { name: "Companies", href: "#" },
    ]},
    { name: "Economy", href: "#" },
    { name: "Technology", href: "#", sublinks: [
        { name: "AI", href: "#" },
        { name: "Gadgets", href: "#" },
        { name: "Innovation", href: "#" },
    ]},
    { name: "Sport", href: "#" },
    { name: "History", href: "#" },
];

export const ALL_CATEGORIES = NAV_LINKS.flatMap(link => 
    link.sublinks ? [link.name, ...link.sublinks.map(s => s.name)] : [link.name]
);

export const SUBSCRIPTION_PLANS: { id: SubscriptionPlan, name: string, price: string, features: string[] }[] = [
    {
        id: 'standard',
        name: 'Standard',
        price: '$4.99/mo',
        features: ['Ad-free browsing', 'Unlimited summaries', 'Access to exclusive content', 'Save articles for offline reading'],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '$9.99/mo',
        features: ['Everything in Standard', 'High-quality audio articles', 'Dyslexia-friendly font', 'Priority support'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$19.99/mo',
        features: ['Everything in Premium', 'Create your own ads', 'Access to developer API', 'Early access to new features'],
    }
];
