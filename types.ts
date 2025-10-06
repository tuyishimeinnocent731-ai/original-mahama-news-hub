
export interface NavLink {
  name: string;
  href: string;
  sublinks?: NavLink[];
}

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
    headline: string;
    image: string; // base64
    url: string;
    isUserAd?: boolean;
}

export interface User {
  email: string;
  name: string;
  avatar: string;
  subscription: SubscriptionPlan;
  savedArticles: Article[];
  bio?: string;
  userAds: Ad[];
}
