import { GoogleGenAI, Type } from "@google/genai";
import { Article, GroundingChunk } from '../types';

// Fix: Initialize the Gemini AI client according to guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mockArticles: Article[] = [
  {
    id: 'tech-1',
    title: 'Future of AI: What to Expect in the Next Decade',
    description: 'Experts weigh in on the transformative potential of artificial intelligence, from autonomous vehicles to personalized medicine.',
    body: 'The field of Artificial Intelligence is evolving at an unprecedented pace. In the coming decade, we can expect AI to become even more integrated into our daily lives. Advancements in machine learning, natural language processing, and computer vision will drive innovation across various sectors. Self-driving cars will become more common, healthcare will be revolutionized by AI-powered diagnostics, and our homes will become smarter and more intuitive. However, with great power comes great responsibility. Ethical considerations, job displacement, and data privacy are challenges that must be addressed as we move forward.',
    author: 'Alex Johnson',
    publishedAt: '2024-07-20T10:00:00Z',
    source: { name: 'Tech Today' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1677756119517-756a1b9d2b2c?q=80&w=2070&auto=format&fit=crop',
    category: 'Technology'
  },
  {
    id: 'business-1',
    title: 'Global Markets React to New Economic Policies',
    description: 'Investors are closely watching as new trade agreements and fiscal policies are implemented, causing ripples across the global economy.',
    body: 'Recent economic policies have sent shockwaves through global markets. A new set of trade agreements has been signed, aiming to foster international cooperation but also introducing new tariffs that have some industries concerned. Central banks are adjusting their interest rates in response to inflationary pressures. Analysts are divided on the long-term impact, with some predicting a period of growth and others warning of potential volatility. Companies are re-evaluating their supply chains and investment strategies to navigate this changing landscape.',
    author: 'Maria Garcia',
    publishedAt: '2024-07-19T14:30:00Z',
    source: { name: 'Financial Times' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1665686306574-1ace09918530?q=80&w=1974&auto=format&fit=crop',
    category: 'Business'
  },
  {
    id: 'world-1',
    title: 'Diplomatic Talks Aim to Resolve International Tensions',
    description: 'Leaders from several nations have gathered for a high-stakes summit, hoping to find common ground and de-escalate recent conflicts.',
    body: 'A critical summit is underway as world leaders convene to address rising international tensions. The agenda is packed with complex issues, from territorial disputes to climate change commitments. The primary goal is to foster dialogue and prevent conflicts from escalating further. Behind closed doors, negotiators are working tirelessly to draft resolutions that are acceptable to all parties. The outcome of this summit could have a lasting impact on global stability and cooperation for years to come.',
    author: 'David Chen',
    publishedAt: '2024-07-21T08:00:00Z',
    source: { name: 'Global News Network' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?q=80&w=2070&auto=format&fit=crop',
    category: 'World'
  },
  {
      id: 'sport-1',
      title: 'Underdogs Triumph in Championship Final',
      description: 'In a stunning upset, the city\'s local team clinched the championship title in a nail-biting final match.',
      body: 'It was a victory for the ages. The local team, considered the underdogs throughout the tournament, defied all odds to win the championship. The final match was an edge-of-your-seat thriller, going into overtime before a dramatic last-minute goal sealed the win. Fans erupted in celebration, flooding the streets in a sea of team colors. The team\'s captain credited their success to teamwork, perseverance, and the unwavering support of their fans.',
      author: 'Ben Carter',
      publishedAt: '2024-07-20T18:45:00Z',
      source: { name: 'Sports Weekly' },
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop',
      category: 'Sport'
  },
  {
      id: 'ai-1',
      title: 'New AI Model Can Write Code Like a Human',
      description: 'A breakthrough in generative AI could revolutionize software development, with a new model capable of writing complex and efficient code.',
      body: 'Researchers have unveiled a new AI model that can understand natural language prompts and generate high-quality code in various programming languages. This could significantly speed up the software development process, allowing developers to focus on high-level design and problem-solving. The model was trained on a massive dataset of open-source code and can handle a wide range of tasks, from creating simple scripts to building entire applications. While it\'s not meant to replace human developers, it promises to be a powerful tool that will augment their capabilities.',
      author: 'Samantha Lee',
      publishedAt: '2024-07-22T11:20:00Z',
      source: { name: 'AI Insider' },
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
      category: 'AI'
  },
  {
      id: 'economy-1',
      title: 'Inflation Concerns Grow as Prices Continue to Rise',
      description: 'Economists are raising alarms about inflation as consumer prices have seen their steepest increase in over a year.',
      body: 'The latest consumer price index report has shown a significant jump in the cost of goods and services, fueling concerns about inflation. Rising energy costs, supply chain disruptions, and increased consumer demand are all contributing factors. The central bank is now under pressure to take action, with many expecting an interest rate hike in the near future. How this will affect the average consumer\'s wallet and the broader economic recovery remains a key question.',
      author: 'John Miller',
      publishedAt: '2024-07-18T09:00:00Z',
      source: { name: 'The Economist' },
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1559526324-c1f275fbfa32?q=80&w=2070&auto=format&fit=crop',
      category: 'Economy'
  },
   {
    id: 'politics-1',
    title: 'Parliament Passes Landmark Climate Bill',
    description: 'After months of debate, a new bill aimed at tackling climate change has been passed, setting ambitious targets for carbon emission reductions.',
    body: 'In a historic vote, parliament has passed a comprehensive climate bill that sets some of the most ambitious environmental targets in the world. The bill mandates a significant reduction in carbon emissions over the next decade and invests heavily in renewable energy sources. The legislation was met with both praise from environmental groups and criticism from some industries concerned about the economic impact. The government has promised support for businesses to transition to greener technologies.',
    author: 'Emily Davis',
    publishedAt: '2024-07-21T16:00:00Z',
    source: { name: 'The Political Reporter' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1974&auto=format&fit=crop',
    category: 'Politics'
  },
  {
    id: 'history-1',
    title: 'Ancient Shipwreck Discovered Off the Coast',
    description: 'Marine archaeologists have discovered a remarkably well-preserved shipwreck dating back over 2,000 years, offering new insights into ancient trade routes.',
    body: 'A team of marine archaeologists has made a stunning discovery: a shipwreck from the classical era, lying in deep water off the coast. The ship\'s cargo, including pottery and other artifacts, is remarkably intact, preserved by the cold, dark depths. This find is expected to provide invaluable information about ancient maritime trade and the cultures that thrived along these routes. Researchers are now planning a careful excavation to recover and study the artifacts.',
    author: 'Dr. Eleanor Vance',
    publishedAt: '2024-07-17T12:00:00Z',
    source: { name: 'Archaeology Journal' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1578889587088-999311f79b6c?q=80&w=1974&auto=format&fit=crop',
    category: 'History'
  },
];

// Shuffle array to make article order seem more dynamic
const shuffleArray = (array: Article[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


export const getArticlesByCategory = async (category: string): Promise<Article[]> => {
    await delay(500);
    if (category.toLowerCase() === 'all') {
        return shuffleArray([...mockArticles]).slice(0, 9);
    }
    const filtered = mockArticles.filter(article => article.category.toLowerCase() === category.toLowerCase());
    return shuffleArray([...filtered]);
};

export const getTopStories = async (): Promise<Article[]> => {
    await delay(300);
    // Return a few consistently "top" stories
    return [...mockArticles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4);
};

export const getRelatedArticles = async (category: string, currentArticleId: string): Promise<Article[]> => {
    await delay(400);
    return mockArticles.filter(article => 
        article.category.toLowerCase() === category.toLowerCase() && article.id !== currentArticleId
    ).slice(0, 3);
};

export const getFeaturedArticleForCategory = (category: string): Article | null => {
    return mockArticles.find(article => article.category.toLowerCase() === category.toLowerCase()) || null;
};

export const summarizeArticle = async (body: string, title: string): Promise<string> => {
    try {
        const prompt = `Provide a concise, professional summary of the following news article. The summary should be one to two paragraphs long.
        
        Title: "${title}"
        
        Article Body:
        ${body}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error summarizing article:', error);
        throw new Error('Failed to generate summary.');
    }
};

export const getKeyPoints = async (body: string): Promise<string[]> => {
    try {
        const prompt = `Extract the most important key points from this article. Return them as a JSON object with a single key "keyPoints" which is an array of strings. Each string should be a single, complete sentence.

        Article Body:
        ${body}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keyPoints: {
                            type: Type.ARRAY,
                            description: 'A list of key points from the article.',
                            items: {
                                type: Type.STRING,
                                description: 'A single key point sentence.'
                            }
                        }
                    },
                    required: ['keyPoints']
                }
            }
        });

        const result = JSON.parse(response.text);
        return result.keyPoints || [];
    } catch (error) {
        console.error('Error getting key points:', error);
        throw new Error('Failed to extract key points.');
    }
};

export const searchArticles = async (query: string): Promise<{ articles: Article[], sources: GroundingChunk[] }> => {
    try {
        const prompt = `Based on the latest information from Google Search, write a neutral, informative news report about "${query}". The report should be well-structured, starting with an introduction, followed by key details, and a concluding paragraph.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources: GroundingChunk[] = groundingMetadata?.groundingChunks || [];
        
        const articleText = response.text;
        
        if (!articleText) {
             return { articles: [], sources };
        }
        
        const article: Article = {
            id: `search-${query.replace(/\s/g, '-')}-${Date.now()}`,
            title: `A Report on: ${query}`,
            description: articleText.substring(0, 150).replace(/\n/g, ' ') + '...',
            body: articleText,
            author: 'Gemini News Assistant',
            source: { name: 'Web Search' },
            publishedAt: new Date().toISOString(),
            url: sources[0]?.web?.uri || '#',
            urlToImage: `https://source.unsplash.com/random/800x400?query=${encodeURIComponent(query)}`,
            category: 'Search',
        };

        return { articles: [article], sources };
    } catch (error) {
        console.error('Error searching articles:', error);
        throw new Error('Search failed. Please try again.');
    }
};
