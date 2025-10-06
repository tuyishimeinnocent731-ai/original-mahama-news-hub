
import { GoogleGenAI } from "@google/genai";
import { Article } from '../types';

// FIX: Initializing Gemini AI Client according to guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Global Tech Summit 2024 Highlights Future of AI',
    description: 'Leaders from around the world gathered to discuss advancements in artificial intelligence and its impact on society.',
    body: 'The Global Tech Summit 2024 concluded yesterday, leaving attendees with a sense of awe and excitement for the future. Keynote speakers emphasized the responsible development of AI, highlighting potential breakthroughs in medicine, climate change, and education. A major theme was the collaboration between public and private sectors to ensure AI benefits all of humanity. Several startups showcased groundbreaking applications, from autonomous drones for agriculture to AI-powered diagnostic tools that can detect diseases earlier than ever before.',
    author: 'Jane Doe',
    publishedAt: '2024-07-15T10:00:00Z',
    source: { name: 'Tech Chronicle' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1620712943543-95fc6961452f?q=80&w=1200',
    category: 'Technology'
  },
  {
    id: '2',
    title: 'Market Hits Record High Amidst Economic Optimism',
    description: 'The stock market surged to an all-time high as new economic data suggests strong growth and waning inflation.',
    body: 'Investors cheered as the S&P 500 index closed at a record high on Tuesday. The rally was fueled by a government report showing stronger-than-expected job growth and a surprising dip in the consumer price index. Analysts believe this combination could give the Federal Reserve more flexibility in its monetary policy. The technology and financial sectors led the gains, with several blue-chip companies reporting robust quarterly earnings. While some experts caution about potential volatility ahead, the overall market sentiment remains bullish.',
    author: 'John Smith',
    publishedAt: '2024-07-14T14:30:00Z',
    source: { name: 'Business Today' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200',
    category: 'Business'
  },
  {
      id: '3',
      title: 'Breakthrough in Renewable Energy Storage',
      description: 'Scientists announce a new battery technology that could revolutionize how we store and use energy from renewable sources.',
      body: 'A research team at a leading university has developed a new type of battery that is cheaper, more efficient, and has a significantly longer lifespan than current lithium-ion technology. The innovation, based on a novel sodium-ion chemistry, could solve one of the biggest challenges for renewable energy: intermittency. By providing a cost-effective way to store solar and wind power, this technology could accelerate the global transition to clean energy. The team has already partnered with a major manufacturer to begin pilot production.',
      author: 'Emily Chen',
      publishedAt: '2024-07-13T09:00:00Z',
      source: { name: 'Science Daily' },
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1509390232658-9243345244a3?q=80&w=1200',
      category: 'Technology'
  },
  {
    id: '4',
    title: 'World Leaders Convene for Climate Change Summit',
    description: 'A critical summit is underway as nations attempt to negotiate new binding targets for carbon emission reductions.',
    body: 'Delegates from nearly 200 countries have gathered for a high-stakes climate summit. The talks are focused on creating more aggressive and legally binding targets to limit global warming. Tensions are high as developing nations call for more financial support from wealthier countries to aid in their green transitions. Activists are staging large-scale protests outside the venue, urging leaders to take decisive action. The outcome of this summit could determine the course of global climate policy for the next decade.',
    author: 'David Wallace',
    publishedAt: '2024-07-12T18:00:00Z',
    source: { name: 'Global Affairs' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1200',
    category: 'World'
  },
  {
    id: '5',
    title: 'The Rise of AI in Modern Politics',
    description: 'Political campaigns are increasingly leveraging AI for everything from voter targeting to policy analysis.',
    body: 'Artificial intelligence is no longer just a buzzword in the political arena; it\'s a powerful tool being deployed in modern campaigns. AI algorithms are used to analyze vast amounts of voter data to create highly personalized outreach messages. They also help in sentiment analysis of social media to gauge public opinion in real-time. While proponents argue it makes campaigning more efficient, critics raise concerns about privacy, manipulation, and the potential for AI-generated misinformation to influence elections.',
    author: 'Sophia Rodriguez',
    publishedAt: '2024-07-11T11:45:00Z',
    source: { name: 'Political Insight' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200',
    category: 'Politics'
  },
  {
    id: '6',
    title: 'European Union Agrees on New Tech Regulation Package',
    description: 'The EU has passed a landmark set of regulations aimed at curbing the power of big tech companies.',
    body: 'After months of intense negotiations, European Union lawmakers have agreed on a comprehensive package of new rules for the digital economy. The regulations will impose stricter controls on how large technology companies operate, with new obligations related to content moderation, data privacy, and interoperability. Companies that fail to comply could face massive fines. The move is seen as one of the most significant attempts by a government body to regulate the tech industry and is expected to have a global impact.',
    author: 'Pierre Dubois',
    publishedAt: '2024-07-10T16:20:00Z',
    source: { name: 'EuroNews' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200',
    category: 'Europe'
  },
  {
    id: '7',
    title: 'How Innovation is Reshaping the Global Economy',
    description: 'From fintech to biotech, technological innovation is the primary driver of economic growth and disruption in the 21st century.',
    body: 'The global economy is in a state of constant flux, driven by rapid technological innovation. Industries that have existed for centuries are being upended by nimble startups leveraging new technologies. This wave of disruption is creating new markets and opportunities but also presents challenges, such as job displacement and increasing inequality. Economists argue that for countries to remain competitive, they must invest heavily in education, research, and development to foster a culture of continuous innovation.',
    author: 'Michael Chan',
    publishedAt: '2024-07-09T08:00:00Z',
    source: { name: 'Economic Times' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200',
    category: 'Economy'
  }
];

export const getArticles = async (category: string = 'World'): Promise<Article[]> => {
    console.log(`Fetching articles for category: ${category}`);
    const lowerCategory = category.toLowerCase();
    const filtered = mockArticles.filter(article => {
        if (lowerCategory === 'world') return ['world', 'europe', 'asia', 'americas', 'africa'].includes(article.category.toLowerCase());
        if (lowerCategory === 'business') return ['business', 'markets', 'companies', 'economy'].includes(article.category.toLowerCase());
        if (lowerCategory === 'technology') return ['technology', 'ai', 'gadgets', 'innovation'].includes(article.category.toLowerCase());
        return article.category.toLowerCase() === lowerCategory;
    });
    return Promise.resolve(filtered.length > 0 ? filtered : mockArticles.slice(0, 5));
};

export const getFeaturedArticleForCategory = (category: string): Article | null => {
    return mockArticles.find(a => a.category.toLowerCase() === category.toLowerCase()) || mockArticles[0] || null;
};

export const summarizeArticle = async (body: string, title: string): Promise<string> => {
    const prompt = `Summarize the following news article in 3-4 concise sentences, focusing on the main points.
    Title: ${title}
    Article: ${body}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // FIX: Using .text property to get the response text, as per guidelines
        return response.text;
    } catch (error) {
        console.error("Error summarizing article:", error);
        return "Sorry, we couldn't generate a summary at this time.";
    }
};

export const getKeyPoints = async (body: string): Promise<string[]> => {
    const prompt = `Extract the 3 to 5 most important key points from the following article. Present them as a list. Do not use markdown like '*' or '-'. Each point should be a separate line.
    Article: ${body}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // FIX: Using .text property to get the response text and parsing it, as per guidelines
        const text = response.text;
        return text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    } catch (error) {
        console.error("Error getting key points:", error);
        return ["Could not extract key points at this time."];
    }
};

export const searchArticles = async (query: string): Promise<Article[]> => {
    console.log(`Searching for: ${query}`);
    if (!query) return [];
    const lowercasedQuery = query.toLowerCase();
    return Promise.resolve(mockArticles.filter(a => 
        a.title.toLowerCase().includes(lowercasedQuery) || 
        a.description.toLowerCase().includes(lowercasedQuery) ||
        a.body.toLowerCase().includes(lowercasedQuery)
    ));
};

export const getRelatedArticles = async (currentArticleId: string, category: string): Promise<Article[]> => {
    const relatedInCategory = mockArticles.filter(a =>
        a.id !== currentArticleId && a.category.toLowerCase() === category.toLowerCase()
    );

    if (relatedInCategory.length >= 4) {
        return Promise.resolve(relatedInCategory.slice(0, 4));
    }

    // Get other articles to fill up, excluding current article and ones already selected.
    const otherArticles = mockArticles.filter(a => {
        if (a.id === currentArticleId) return false;
        if (relatedInCategory.some(r => r.id === a.id)) return false;
        return true;
    });
    
    const combined = [...relatedInCategory, ...otherArticles];
    return Promise.resolve(combined.slice(0, 4));
};
