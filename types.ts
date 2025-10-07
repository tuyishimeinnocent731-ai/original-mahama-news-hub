export interface Article {
    id: string;
    title: string;
    description: string;
    body: string;
    author: string;
    publishedAt: string;
    source: {
        name: string;
    };
    url: string;
    urlToImage: string;
    category: string;
    galleryImages?: { src: string; alt: string }[];
    isOffline?: boolean;
}

export type SubscriptionPlan = 'free' | 'standard' | 'premium' | 'pro';
export type IntegrationId = 'slack' | 'google-calendar' | 'notion';

export interface Ad {
    id: string;
    headline: string;
    image: string;
    url: string;
}

export interface PaymentRecord {
    id: string;
    date: string;
    plan: SubscriptionPlan;
    amount: string;
    method: 'Credit Card' | 'PayPal' | 'MTN Mobile Money';
    status: 'succeeded' | 'pending' | 'failed';
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    bio?: string;
    subscription: SubscriptionPlan;
    savedArticles: string[]; // array of article IDs
    searchHistory: string[];
    userAds: Ad[];
    twoFactorEnabled: boolean;
    integrations: {
        [key in IntegrationId]?: boolean;
    };
    role?: 'admin' | 'sub-admin' | 'user';
    paymentHistory: PaymentRecord[];
}

export interface NavLink {
    id: string;
    name: string;
    href: string;
    sublinks?: NavLink[];
}

export type ThemeName = 'default' | 'midnight' | 'latte' | 'forest' | 'oceanic' | 'rose' | 'slate' | 'sandstone' | 'nebula' | 'cyberpunk' | 'solaris' | 'monochrome' | 'image';
export type AccentColor = 'yellow' | 'blue' | 'green' | 'red' | 'purple' | 'pink' | 'indigo' | 'teal';
export type FontWeight = '300' | '400' | '500' | '600' | '700';
export type CardStyle = 'standard' | 'elevated' | 'outline';
export type BorderRadius = 'sharp' | 'rounded' | 'pill';

export interface ThemeSettings {
    name: ThemeName;
    accent: AccentColor;
    customImage?: string; // Base64 encoded image
}

export interface FontSettings {
    family: string;
    weight: FontWeight;
}

export interface LayoutSettings {
    homepage: 'grid' | 'list' | 'magazine';
    density: 'compact' | 'comfortable' | 'spacious';
    infiniteScroll: boolean;
}

export interface UiSettings {
    cardStyle: CardStyle;
    borderRadius: BorderRadius;
}

export interface Settings {
    theme: ThemeSettings;
    font: FontSettings;
    layout: LayoutSettings;
    ui: UiSettings;
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
    dyslexiaFont: boolean;
    notifications: {
        breakingNews: boolean;
        weeklyDigest: boolean;
        specialOffers: boolean;
    };
    preferredCategories: string[];
    dataSharing: boolean;
    adPersonalization: boolean;
}