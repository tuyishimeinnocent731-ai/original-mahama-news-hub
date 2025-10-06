
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
}
