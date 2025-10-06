
// Fix: Removed self-import of NavLink which caused a conflict with its local declaration.

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
  keyPoints?: string[];
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface User {
    email: string;
    name: string;
    avatar: string;
    subscription: SubscriptionPlan;
    savedArticles: Article[];
}

export type SubscriptionPlan = 'free' | 'standard' | 'premium';

export interface NavLink {
    name: string;
    href: string;
    sublinks?: NavLink[];
}
