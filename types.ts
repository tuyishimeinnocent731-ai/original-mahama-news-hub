
export type SubscriptionPlan = 'free' | 'standard' | 'premium' | 'pro';

export interface Source {
  name: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  body: string;
  author: string;
  publishedAt: string;
  source: Source;
  url: string;
  urlToImage: string;
  category: string;
  isOffline?: boolean;
  tags?: string[];
  galleryImages?: { src: string; alt: string }[];
  scheduledFor?: string;
}

export interface Ad {
  id: string;
  headline: string;
  url: string;
  image: string;
  user_id?: string;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  body: string;
  parent_id?: string | null;
  created_at: string;
  author_name: string;
  author_avatar: string;
  status: 'pending' | 'approved' | 'rejected';
  article_title?: string; // For admin view
  replies?: Comment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscription: SubscriptionPlan;
  role?: 'user' | 'sub-admin' | 'admin';
  bio?: string;
  socials?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
  };
  two_factor_enabled?: boolean;
  savedArticles: string[];
  searchHistory: string[];
  userAds: Ad[];
  paymentHistory: PaymentRecord[];
  integrations: { [key in IntegrationId]?: boolean };
  settings: Settings;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_subscription_status?: string;
}

export interface NavLink {
  id: string;
  name: string;
  href: string;
  sublinks?: NavLink[];
}

// Settings Types
export interface ThemeSettings {
  name: 'default' | 'midnight' | 'forest' | 'rose' | 'cyberpunk' | 'solaris' | 'monochrome' | 'cosmic' | 'sunset' | 'image';
  accent: 'yellow' | 'blue' | 'green' | 'red' | 'purple' | 'pink' | 'indigo' | 'teal';
  customImage?: string;
}

export interface FontSettings {
  family: string;
  weight: '300' | '400' | '500' | '700';
}

export interface LayoutSettings {
  homepage: 'grid' | 'list' | 'magazine';
  density: 'compact' | 'comfortable' | 'spacious';
  infiniteScroll: boolean;
}

export interface UiSettings {
  cardStyle: 'standard' | 'elevated' | 'outline';
  borderRadius: 'sharp' | 'rounded' | 'pill';
}

export interface ReadingSettings {
  autoPlayAudio: boolean;
  defaultSummaryView: boolean;
  lineHeight: number;
  letterSpacing: number;
  justifyText: boolean;
}

export interface NotificationSettings {
    breakingNews: boolean;
    weeklyDigest: boolean;
    specialOffers: boolean;
}

export interface Settings {
    theme: ThemeSettings;
    font: FontSettings;
    layout: LayoutSettings;
    ui: UiSettings;
    reading: ReadingSettings;
    notifications: NotificationSettings;
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
    dyslexiaFont: boolean;
    preferredCategories: string[];
    dataSharing: boolean;
    adPersonalization: boolean;
}

export type IntegrationId = 'slack' | 'google-calendar' | 'notion';

export interface ApiKey {
    id: string;
    description: string;
    prefix: string;
    last_used: string | null;
    created_at: string;
}

export interface Notification {
    id: number;
    user_id: string;
    message: string;
    type: 'alert' | 'feature' | 'update' | 'message';
    is_read: boolean;
    created_at: string;
}

export interface Page {
    slug: string;
    title: string;
    content: string;
    updated_at: string;
    last_updated_by?: string;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
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
    name: string;
    email: string;
    resume_path: string;
    cover_letter?: string;
    applied_at: string;
}

export interface ActivityLog {
    id: number;
    user_id: string;
    action_type: string;
    details: any;
    ip_address: string;
    created_at: string;
}

export interface PaymentRecord {
    id: string;
    date: string;
    plan: SubscriptionPlan;
    amount: string;
    method: 'Credit Card' | 'PayPal' | 'MTN Mobile Money' | 'Stripe';
    status: 'succeeded' | 'pending' | 'failed';
}
