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
    tags?: string[];
    galleryImages?: { src: string; alt: string }[];
    isOffline?: boolean;
    scheduledFor?: string; // ISO date string for future publishing
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
    password?: string; // Added for admin user creation
    avatar: string;
    bio?: string;
    socials?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
    };
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
    settings?: Settings; // Added for full settings sync
}

export interface NavLink {
    id: string;
    name: string;
    href: string;
    sublinks?: NavLink[];
}

export interface Comment {
    id: string;
    article_id: string;
    user_id: string;
    body: string;
    parent_id: string | null;
    created_at: string;
    author_name: string;
    author_avatar: string;
    replies: Comment[];
}

export type ThemeName = 'default' | 'midnight' | 'latte' | 'forest' | 'oceanic' | 'rose' | 'slate' | 'sandstone' | 'nebula' | 'cyberpunk' | 'solaris' | 'monochrome' | 'cosmic' | 'sunset' | 'image';
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

export interface ReadingSettings {
    autoPlayAudio: boolean;
    defaultSummaryView: boolean;
    lineHeight: number;
    letterSpacing: number;
    justifyText: boolean;
}

export interface Settings {
    theme: ThemeSettings;
    font: FontSettings;
    layout: LayoutSettings;
    ui: UiSettings;
    reading: ReadingSettings;
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

// --- New Types for Advanced Features ---

export interface UserSession {
    id: number;
    device: string;
    ip_address: string;
    last_active: string;
    is_current: boolean;
}

export interface ApiKey {
    id: string;
    prefix: string;
    description: string;
    created_at: string;
    last_used: string | null;
}

export interface Notification {
    id: number;
    user_id: string;
    type: 'alert' | 'feature' | 'update' | 'message';
    message: string;
    is_read: boolean;
    created_at: string;
    link?: string;
}

export interface Page {
    slug: string;
    title: string;
    content: string;
    updated_at: string;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject?: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface JobPosting {
    id: number;
    title: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract';
    description: string;
    is_active: boolean;
    created_at: string;
}

export interface JobApplication {
    id: number;
    job_id: number;
    user_id?: string;
    name: string;
    email: string;
    resume_path: string;
    cover_letter?: string;
    applied_at: string;
    // Joined from job_postings table
    job_title?: string;
}