import { NavLink, SubscriptionPlan } from "./types";

// FIX: Added dummy 'id' properties to sublinks to satisfy the NavLink[] type.
// The type Omit<NavLink, 'id'> doesn't apply recursively, so sublinks were expected to have an id.
export const NAV_LINKS: Omit<NavLink, 'id'>[] = [
    { name: "World", href: "#", sublinks: [
        { id: '', name: "Africa", href: "#" },
        { id: '', name: "Americas", href: "#" },
        { id: '', name: "Asia", href: "#" },
        { id: '', name: "Europe", href: "#" },
    ]},
    { name: "Politics", href: "#" },
    { name: "Business", href: "#", sublinks: [
        { id: '', name: "Markets", href: "#" },
        { id: '', name: "Companies", href: "#" },
    ]},
    { name: "Economy", href: "#" },
    { name: "Technology", href: "#", sublinks: [
        { id: '', name: "AI", href: "#" },
        { id: '', name: "Gadgets", href: "#" },
        { id: '', name: "Innovation", href: "#" },
    ]},
    { name: "Sport", href: "#", sublinks: [
        { id: '', name: "Football", href: "#" },
        { id: '', name: "Basketball", href: "#" },
        { id: '', name: "Tennis", href: "#" },
    ]},
    { name: "Entertainment", href: "#", sublinks: [
        { id: '', name: "Movies", href: "#" },
        { id: '', name: "Music", href: "#" },
        { id: '', name: "Gaming", href: "#" },
    ]},
    { name: "Films & TV", href: "#" },
    { name: "Arts", href: "#" },
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

// --- New Theming Constants ---

const createPalette = (colors: { [key: string]: string }) => {
    return {
        background: colors.bg, foreground: colors.fg, card: colors.card,
        'card-foreground': colors.cardFg, popover: colors.popover,
        'popover-foreground': colors.popoverFg, primary: colors.primary,
        'primary-foreground': colors.primaryFg, secondary: colors.secondary,
        'secondary-foreground': colors.secondaryFg, muted: colors.muted,
        'muted-foreground': colors.mutedFg, border: colors.border
    };
};

export const THEMES = [
    {
        id: 'default', name: 'Default',
        palette: {
            light: createPalette({ bg: '249 250 251', fg: '17 24 39', card: '255 255 255', cardFg: '17 24 39', popover: '255 255 255', popoverFg: '17 24 39', primary: '30 64 175', primaryFg: '255 255 255', secondary: '243 244 246', secondaryFg: '17 24 39', muted: '243 244 246', mutedFg: '107 114 128', border: '229 231 235' }),
            dark: createPalette({ bg: '17 24 39', fg: '249 250 251', card: '31 41 55', cardFg: '249 250 251', popover: '31 41 55', popoverFg: '249 250 251', primary: '30 64 175', primaryFg: '255 255 255', secondary: '55 65 81', secondaryFg: '249 250 251', muted: '55 65 81', mutedFg: '156 163 175', border: '55 65 81' }),
        }
    },
    {
        id: 'midnight', name: 'Midnight',
        palette: {
            light: createPalette({ bg: '226 232 240', fg: '15 23 42', card: '241 245 249', cardFg: '15 23 42', popover: '255 255 255', popoverFg: '15 23 42', primary: '30 41 59', primaryFg: '248 250 252', secondary: '226 232 240', secondaryFg: '30 41 59', muted: '226 232 240', mutedFg: '71 85 105', border: '203 213 225' }),
            dark: createPalette({ bg: '15 23 42', fg: '226 232 240', card: '30 41 59', cardFg: '226 232 240', popover: '2 6 23', popoverFg: '226 232 240', primary: '30 41 59', primaryFg: '248 250 252', secondary: '30 41 59', secondaryFg: '226 232 240', muted: '30 41 59', mutedFg: '148 163 184', border: '49 60 78' }),
        }
    },
    {
        id: 'forest', name: 'Forest',
        palette: {
            light: createPalette({ bg: '240 253 244', fg: '20 83 45', card: '255 255 255', cardFg: '20 83 45', popover: '255 255 255', popoverFg: '20 83 45', primary: '22 101 52', primaryFg: '240 253 244', secondary: '220 252 231', secondaryFg: '21 94 51', muted: '220 252 231', mutedFg: '22 101 52', border: '187 247 208' }),
            dark: createPalette({ bg: '16 26 22', fg: '187 247 208', card: '20 38 30', cardFg: '187 247 208', popover: '17 24 39', popoverFg: '187 247 208', primary: '17 49 35', primaryFg: '220 252 231', secondary: '20 38 30', secondaryFg: '187 247 208', muted: '20 38 30', mutedFg: '134 239 172', border: '26 59 44' }),
        }
    },
    {
        id: 'rose', name: 'Rose Gold',
        palette: {
            light: createPalette({ bg: '254 242 242', fg: '159 28 66', card: '255 255 255', cardFg: '159 28 66', popover: '255 255 255', popoverFg: '159 28 66', primary: '190 24 93', primaryFg: '255 241 242', secondary: '253 224 224', secondaryFg: '190 24 93', muted: '253 224 224', mutedFg: '190 24 93', border: '254 202 202' }),
            dark: createPalette({ bg: '59 18 38', fg: '253 224 224', card: '90 24 57', cardFg: '253 224 224', popover: '40 12 25', popoverFg: '253 224 224', primary: '190 24 93', primaryFg: '255 241 242', secondary: '90 24 57', secondaryFg: '253 224 224', muted: '90 24 57', mutedFg: '251 146 156', border: '136 36 86' }),
        }
    },
     {
        id: 'cyberpunk', name: 'Cyberpunk',
        palette: {
            light: createPalette({ bg: '254 249 195', fg: '217 70 239', card: '253 230 138', cardFg: '217 70 239', popover: '253 230 138', popoverFg: '217 70 239', primary: '91 33 182', primaryFg: '250 245 255', secondary: '253 230 138', secondaryFg: '91 33 182', muted: '253 230 138', mutedFg: '91 33 182', border: '252 211 77' }),
            dark: createPalette({ bg: '24 0 54', fg: '250 204 21', card: '58 9 63', cardFg: '250 204 21', popover: '30 0 30', popoverFg: '250 204 21', primary: '91 33 182', primaryFg: '250 204 21', secondary: '58 9 63', secondaryFg: '250 204 21', muted: '58 9 63', mutedFg: '250 204 21', border: '86 13 94' }),
        }
    },
    {
        id: 'solaris', name: 'Solaris',
        palette: {
            light: createPalette({ bg: '255 251 235', fg: '124 58 237', card: '255 255 255', cardFg: '124 58 237', popover: '255 255 255', popoverFg: '124 58 237', primary: '245 158 11', primaryFg: '124 58 237', secondary: '254 243 199', secondaryFg: '124 58 237', muted: '254 243 199', mutedFg: '124 58 237', border: '253 224 71' }),
            dark: createPalette({ bg: '28 25 23', fg: '253 224 71', card: '41 37 36', cardFg: '253 224 71', popover: '28 25 23', popoverFg: '253 224 71', primary: '245 158 11', primaryFg: '28 25 23', secondary: '68 64 60', secondaryFg: '253 224 71', muted: '68 64 60', mutedFg: '253 224 71', border: '87 83 78' }),
        }
    },
    {
        id: 'monochrome', name: 'Monochrome',
        palette: {
            light: createPalette({ bg: '245 245 245', fg: '23 23 23', card: '255 255 255', cardFg: '23 23 23', popover: '255 255 255', popoverFg: '23 23 23', primary: '23 23 23', primaryFg: '245 245 245', secondary: '229 229 229', secondaryFg: '23 23 23', muted: '229 229 229', mutedFg: '82 82 82', border: '212 212 212' }),
            dark: createPalette({ bg: '23 23 23', fg: '245 245 245', card: '38 38 38', cardFg: '245 245 245', popover: '38 38 38', popoverFg: '245 245 245', primary: '245 245 245', primaryFg: '23 23 23', secondary: '64 64 64', secondaryFg: '245 245 245', muted: '64 64 64', mutedFg: '163 163 163', border: '82 82 82' }),
        }
    }
];

export const ACCENT_COLORS = [
    { id: 'yellow', name: 'Yellow', rgb: '251 191 36', fgRgb: '23 23 23' },
    { id: 'blue', name: 'Blue', rgb: '59 130 246', fgRgb: '255 255 255' },
    { id: 'green', name: 'Green', rgb: '16 185 129', fgRgb: '255 255 255' },
    { id: 'red', name: 'Red', rgb: '239 68 68', fgRgb: '255 255 255' },
    { id: 'purple', name: 'Purple', rgb: '139 92 246', fgRgb: '255 255 255' },
    { id: 'pink', name: 'Pink', rgb: '236 72 153', fgRgb: '255 255 255' },
    { id: 'indigo', name: 'Indigo', rgb: '99 102 241', fgRgb: '255 255 255' },
    { id: 'teal', name: 'Teal', rgb: '20 184 166', fgRgb: '255 255 255' },
];

export const FONTS = [
    { name: "Inter", family: "Inter" },
    { name: "Roboto", family: "Roboto" },
    { name: "Lato", family: "Lato" },
    { name: "Montserrat", family: "Montserrat" },
    { name: "Oswald", family: "Oswald" },
    { name: "Source Sans Pro", family: "Source Sans Pro" },
    { name: "Slabo 27px", family: "Slabo 27px" },
    { name: "Raleway", family: "Raleway" },
    { name: "PT Sans", family: "PT Sans" },
    { name: "Merriweather", family: "Merriweather" },
    { name: "Noto Sans", family: "Noto Sans" },
    { name: "Poppins", family: "Poppins" },
    { name: "Playfair Display", family: "Playfair Display" },
    { name: "Ubuntu", family: "Ubuntu" },
    { name: "Lora", family: "Lora" },
    { name: "Nunito", family: "Nunito" },
    { name: "Titillium Web", family: "Titillium Web" },
    { name: "Fira Sans", family: "Fira Sans" },
    { name: "Quicksand", family: "Quicksand" },
    { name: "Atkinson Hyperlegible", family: "Atkinson Hyperlegible" }
];

export const FONT_WEIGHTS = [
    { name: 'Light', value: '300' },
    { name: "Regular", value: "400" },
    { name: "Medium", value: "500" },
    { name: "Bold", value: "700" }
];
