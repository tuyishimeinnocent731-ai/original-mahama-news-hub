// FIX: Removed circular dependency with constants.ts. The NavLink interface can refer to itself for nested structures.

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
  isOffline?: boolean;
}

export type SubscriptionPlan = 'free' | 'standard' | 'premium' | 'pro';

export interface Ad {
  id: string;
  image: string;
  headline: string;
  url: string;
  isUserAd?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscription: SubscriptionPlan;
  savedArticles: string[];
  bio?: string;
  userAds: Ad[];
  searchHistory: string[];
  twoFactorEnabled: boolean;
}

export interface NavLink {
  name: string;
  href: string;
  // FIX: Changed NavLinkType to NavLink to allow for recursive type definition.
  sublinks?: NavLink[];
}

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

export interface Settings {
    theme: Theme;
    fontSize: FontSize;
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