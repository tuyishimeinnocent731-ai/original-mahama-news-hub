
export interface Article {
  headline: string;
  summary: string;
  category: string;
  imageUrl: string;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface SearchResult {
  summary: string;
  sources: {
    uri: string;
    title: string;
  }[];
}
