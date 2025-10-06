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
}

// FIX: Defined NavLink interface to remove circular dependency and fix type errors.
export interface NavLink {
  name: string;
  href: string;
  sublinks?: NavLink[];
}

export type SubscriptionPlan = 'free' | 'standard' | 'premium';

export interface User {
  email: string;
  name: string;
  avatar: string;
  subscription: SubscriptionPlan;
  savedArticles: Article[];
  bio?: string;
}
