export interface Article {
  id: string;
  title: string;
  description: string;
  body: string; // Changed from 'content' to 'body' for full article text
  author: string;
  publishedAt: string;
  source: {
    name: string;
  };
  url: string;
  urlToImage: string;
  category: string;
}

export interface GroundingChunk {
  web?: {
    // FIX: Made uri and title optional to match the type from @google/genai SDK.
    uri?: string;
    title?: string;
  };
}

export interface User {
    email: string;
}

export type SubscriptionPlan = 'free' | 'standard' | 'premium';

export interface NavLink {
    name: string;
    href: string;
    sublinks?: NavLink[];
}