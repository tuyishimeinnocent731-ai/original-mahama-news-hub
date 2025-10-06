import { GoogleGenAI } from "@google/genai";
import { Article, GroundingChunk } from '../types';

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const mockArticles: Article[] = [
    {
        id: '1', title: 'Global Tech Summit 2024 Highlights Future of AI',
        description: 'Leaders from around the world gathered to discuss advancements in artificial intelligence and its impact on society.',
        body: 'The Global Tech Summit 2024 concluded yesterday, leaving attendees with a sense of awe and excitement for the future. Keynote speakers emphasized the responsible development of AI, highlighting potential breakthroughs in medicine, climate change, and education. A major theme was the collaboration between public and private sectors to ensure AI benefits all of humanity. Several startups showcased groundbreaking applications, from autonomous drones for agriculture to AI-powered diagnostic tools that can detect diseases earlier than ever before.',
        author: 'Jane Doe', publishedAt: '2024-07-15T10:00:00Z', source: { name: 'Tech Chronicle' }, url: '#', urlToImage: 'https://images.unsplash.com/photo-1620712943543-95fc6961452f?q=80&w=2070&auto=format&fit=crop',
        category: 'Technology'
    },
    {
        id: '2', title: 'Stock Market Reaches All-Time High Amidst Economic Optimism',
        description: 'The S&P 500 and Dow Jones Industrial Average both closed at record highs today, driven by strong corporate earnings and positive economic data.',
        body: 'Investors showed strong confidence in the market this week, pushing major indices to unprecedented levels. The rally was broad-based, with technology, healthcare, and financial sectors leading the gains. Analysts attribute the optimism to a combination of factors, including lower-than-expected inflation figures, a robust job market, and promising earnings reports from several blue-chip companies. While some experts caution about a potential correction, the general sentiment remains bullish for the near future.',
        author: 'John Smith', publishedAt: '2024-07-14T15:30:00Z', source: { name: 'Financial Times' }, url: '#', urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
        category: 'Business'
    },
    {
        id: '3', title: 'Breakthrough in Fusion Energy Could Power the Future',
        description: 'Scientists announce a major milestone in nuclear fusion research, achieving a net energy gain for a sustained period.',
        body: 'In a landmark experiment, a team of international scientists has successfully generated more energy from a fusion reaction than was required to initiate it, a long-sought goal known as ignition. This breakthrough could pave the way for clean, virtually limitless energy. The experiment, conducted at the National Ignition Facility, used powerful lasers to heat and compress a small pellet of hydrogen fuel, triggering the fusion process. While commercial fusion power plants are still decades away, this achievement marks a critical step forward in the quest for a sustainable energy source.',
        author: 'Emily Carter', publishedAt: '2024-07-13T11:45:00Z', source: { name: 'Science Today' }, url: '#', urlToImage: 'https://images.unsplash.com/photo-1633681920205-23133149d3b3?q=80&w=2070&auto=format&fit=crop',
        category: 'Technology'
    },
    {
        id: '4', title: 'World Leaders Agree on New Climate Accord',
        description: 'A historic agreement has been reached to accelerate the transition to renewable energy and provide more support for developing nations.',
        body: 'After weeks of intense negotiations, nations from across the globe have signed the "Paris II Accord," a new climate agreement aimed at drastically cutting greenhouse gas emissions by 2040. The deal includes binding commitments for developed countries to phase out fossil fuels and increased financial aid for developing nations to adapt to climate change and build green infrastructure. Environmental groups have praised the accord as a significant step forward, but stress that immediate and decisive action is needed to meet its ambitious targets.',
        author: 'David Chen', publishedAt: '2024-07-12T20:00:00Z', source: { name: 'Global News Network' }, url: '#', urlToImage: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=2070&auto=format&fit=crop',
        category: 'World'
    },
    {
        id: '5', title: 'The Rise of Vertical Farming in Urban Centers',
        description: 'Vertical farms are sprouting up in cities worldwide, promising to deliver fresh produce locally and sustainably.',
        body: 'As urban populations grow, so does the challenge of feeding them. Vertical farming, the practice of growing crops in stacked layers indoors, is emerging as a viable solution. These high-tech farms use LED lighting and hydroponic systems to cultivate produce year-round, regardless of weather conditions. By locating farms within cities, they significantly reduce transportation costs and carbon emissions, while also providing consumers with fresher, more nutritious food. Companies in this space are attracting significant investment and are poised to revolutionize the agriculture industry.',
        author: 'Maria Garcia', publishedAt: '2024-07-11T09:00:00Z', source: { name: 'Modern Farmer' }, url: '#', urlToImage: 'https://images.unsplash.com/photo-1598439210625-5067a54817e4?q=80&w=1974&auto=format&fit=crop',
        category: 'Innovation'
    },
    { id: '6', category: 'Politics', title: 'Election Season Kicks Off with Heated Debates', author: 'Tom Howard', publishedAt: '2024-07-10T19:00:00Z', source: { name: 'The Political Insider' }, description: 'Candidates clash on key issues as the presidential election campaign officially begins.', body: 'The first primary debate of the season saw candidates from all parties laying out their platforms and taking shots at their rivals. Key topics included economic policy, healthcare reform, and foreign relations. Pundits are already analyzing the performances, with no clear frontrunner emerging yet. The coming months are expected to be filled with rallies, town halls, and more debates as candidates vie for their party\'s nomination.', url: '#', urlToImage: 'https://images.unsplash.com/photo-1551843236-c675555a6a48?q=80&w=2070&auto=format&fit=crop' },
    { id: '7', category: 'Sport', title: 'Titans Win Championship in a Thrilling Final Match', author: 'Michael Lee', publishedAt: '2024-07-09T22:00:00Z', source: { name: 'ESPN' }, description: 'A last-minute goal secured the victory for the Titans in what is being called the most exciting final in a decade.', body: 'In a game that will be remembered for years to come, the Titans defeated the Giants to claim the league championship. The match was a back-and-forth affair, with both teams displaying incredible skill and determination. With seconds left on the clock and the score tied, Titans\' star player Alex Johnson scored a spectacular goal, sending the stadium into a frenzy. The victory marks the team\'s first championship in over twenty years.', url: '#', urlToImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop' },
];

export const getTopStories = async (): Promise<Article[]> => {
    await new Promise(res => setTimeout(res, 500));
    return [...mockArticles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 5);
};

export const getArticlesByCategory = async (category: string): Promise<Article[]> => {
    await new Promise(res => setTimeout(res, 1000));
    const lowerCategory = category.toLowerCase();
    if (lowerCategory === 'all') return mockArticles;
    return mockArticles.filter(a => a.category.toLowerCase() === lowerCategory);
};

export const searchArticles = async (query: string): Promise<{articles: Article[], sources: GroundingChunk[]}> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find recent news articles about "${query}". For each article, provide the title, a brief description, the source name, and the URL.`,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const text = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        const articles: Article[] = groundingChunks
            .filter(chunk => chunk.web?.uri && chunk.web?.title)
            .map((chunk, index) => ({
                id: `search-${query.replace(/\s/g, '-')}-${index}`,
                title: chunk.web!.title!,
                description: `A search result for your query: "${query}". Click to read more.`,
                body: `Content for "${chunk.web!.title!}" would be displayed here. The original article can be found at ${chunk.web!.uri!}.`,
                author: 'Various',
                publishedAt: new Date().toISOString(),
                source: { name: new URL(chunk.web!.uri!).hostname.replace('www.', '') },
                url: chunk.web!.uri!,
                urlToImage: ``,
                category: 'Search',
        }));

        if (!articles.length && text) {
             articles.push({
                 id: 'gemini-response',
                 title: `AI Summary for "${query}"`,
                 description: text,
                 body: text,
                 author: 'Gemini',
                 publishedAt: new Date().toISOString(),
                 source: { name: 'Google Search' },
                 url: '#',
                 urlToImage: '',
                 category: 'Search',
             });
        }
        
        return { articles: articles.slice(0, 10), sources: groundingChunks };
    } catch (error) {
        console.error("Error searching articles with Gemini:", error);
        // Fallback to mock search on error
        return { 
            articles: mockArticles.filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase())), 
            sources: [] 
        };
    }
};

export const summarizeArticle = async (articleBody: string, title: string): Promise<string> => {
    if (!articleBody) return "This article has no content to summarize.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize the following news article titled "${title}" in three concise paragraphs:\n\n${articleBody}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing article:", error);
        return "Could not generate a summary for this article.";
    }
};

export const getKeyPoints = async (articleBody: string): Promise<string[]> => {
    if (!articleBody) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Extract the three most important key points from this article as a bulleted list. Each point should be a single sentence. Use '*' for bullets.\n\n${articleBody}`,
        });
        return response.text.split('*').map(p => p.trim()).filter(Boolean);
    } catch (error) {
        console.error("Error getting key points:", error);
        return [];
    }
};