
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Article, GroundingChunk } from '../types';

// Mock Data
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Breakthrough in AI Could Change How We Code',
    description: 'Researchers have developed a new AI model that can write and debug code with unprecedented accuracy, potentially revolutionizing software development.',
    body: 'A team of scientists at a leading tech firm announced a significant advancement in artificial intelligence today. Their new model, dubbed "CodeWeaver," demonstrates a remarkable ability to understand natural language instructions and translate them into functional, efficient code across multiple programming languages. Unlike previous models, CodeWeaver can also identify and fix complex bugs in existing codebases, a task that has traditionally required significant human expertise. The implications are vast, promising to accelerate development cycles, lower the barrier to entry for new programmers, and fundamentally alter the role of human developers, shifting their focus from line-by-line coding to high-level system design and problem-solving.',
    author: 'Jane Doe',
    publishedAt: '2023-10-27T10:00:00Z',
    source: { name: 'Tech Chronicle' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop',
    category: 'Technology',
  },
  {
    id: '2',
    title: 'Global Markets Rally on Positive Economic Outlook',
    description: 'Stock markets around the world saw a significant surge today as new data suggests a stronger-than-expected global economic recovery.',
    body: 'Investor confidence soared on Tuesday, driving major indices to new highs across Europe, Asia, and the Americas. The rally was fueled by a batch of positive economic indicators, including lower inflation figures and robust manufacturing output from key economies. Analysts believe this could signal an end to the recent period of market volatility. Central banks are now under less pressure to raise interest rates, which could further stimulate economic growth. While some experts remain cautious, the general sentiment is one of optimistic relief, with sectors like technology and renewable energy leading the gains.',
    author: 'John Smith',
    publishedAt: '2023-10-27T09:30:00Z',
    source: { name: 'Financial Times' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop',
    category: 'Business',
  },
  {
      id: '3',
      title: 'The Great Wall of China: A Journey Through History',
      description: 'Exploring the rich history and architectural marvel of one of the world\'s most iconic landmarks.',
      body: 'The Great Wall of China is not a single wall but a series of fortifications built over centuries by various Chinese dynasties. Its primary purpose was to protect Chinese states and empires against raids and invasions from nomadic groups of the Eurasian Steppe. Construction began as early as the 7th century BC, but the most famous sections were built by the Ming dynasty (1368–1644). Stretching over 13,000 miles, the wall is a testament to immense human effort and engineering prowess. Today, it stands as a symbol of China\'s enduring strength and is a UNESCO World Heritage site, attracting millions of visitors who walk its ancient stones and ponder the history it has witnessed.',
      author: 'Chen Wei',
      publishedAt: '2023-10-26T14:00:00Z',
      source: { name: 'History Today' },
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1508804185883-2a4870753b21?q=80&w=1991&auto=format&fit=crop',
      category: 'History',
  },
  {
    id: '4',
    title: 'Europe Pledges Billions for Green Energy Transition',
    description: 'European leaders have announced a landmark investment package aimed at accelerating the continent\'s shift to renewable energy sources.',
    body: 'In a united front against climate change, European nations have committed to a multi-billion euro fund dedicated to green energy projects. The initiative will support the development of wind, solar, and hydrogen power, aiming to make Europe the first climate-neutral continent by 2050. The plan includes significant investments in infrastructure, research, and subsidies to help businesses and citizens transition away from fossil fuels. "This is a pivotal moment for our planet and our economy," said one official. "We are not just building a greener future, but also creating jobs and ensuring our energy independence."',
    author: 'Isabelle Dubois',
    publishedAt: '2023-10-26T11:45:00Z',
    source: { name: 'Reuters' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1623352763619-8b5cc1380901?q=80&w=2070&auto=format&fit=crop',
    category: 'Europe'
  },
  {
    id: '5',
    title: '"The Crown" Sweeps Major Awards at TV Gala',
    description: 'The historical drama series about the British royal family has once again dominated at the annual television awards, taking home several key prizes.',
    body: 'It was a night of triumph for the creators and cast of "The Crown" at the Primetime Emmy Awards. The series was honored with the award for Outstanding Drama Series, while its stars secured wins in the lead acting categories. Critics have praised the show for its meticulous historical detail, compelling performances, and high production values. The wins solidify its status as one of the most prestigious and popular television shows of the modern era, captivating audiences worldwide with its intimate portrayal of public figures.',
    author: 'Michael Lee',
    publishedAt: '2023-10-25T21:00:00Z',
    source: { name: 'Variety' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1594998893922-32a2f8836e4f?q=80&w=1974&auto=format&fit=crop',
    category: 'Entertainment'
  },
  {
      id: '6',
      title: 'African Nations Launch Joint Satellite to Monitor Climate Change',
      description: 'A coalition of African countries has successfully launched their first shared satellite, a major step for the continent\'s space ambitions and climate research.',
      body: 'In a landmark collaboration, several African nations celebrated the successful launch of a satellite designed to monitor weather patterns and the effects of climate change across the continent. The project, led by scientists and engineers from across Africa, aims to provide crucial data for agriculture, disaster management, and environmental protection. "This is Africa\'s eye in the sky," said the project director. "It empowers us to make informed decisions to protect our people and our natural resources." The launch is seen as a significant milestone in fostering scientific collaboration and technological independence in Africa.',
      author: 'Femi Adebayo',
      publishedAt: '2023-10-27T08:00:00Z',
      source: { name: 'BBC World' },
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=1918&auto=format&fit=crop',
      category: 'Africa'
  },
  {
      id: '7',
      title: 'The Unseen World: New Deep-Sea Species Discovered',
      description: 'A marine biology expedition has returned from the Pacific Ocean with footage and samples of several previously unknown species from the deep-sea abyss.',
      body: 'Scientists are celebrating the discovery of a host of bizarre and wonderful creatures from one of the deepest trenches in the Pacific Ocean. Using a remotely operated vehicle (ROV), the team explored depths of over 7,000 meters, revealing a vibrant ecosystem. Among the discoveries are a translucent snailfish, a species of giant isopod, and several bioluminescent organisms that light up the perpetual darkness. These findings provide valuable insights into how life can thrive in extreme environments and highlight how much of our own planet remains to be explored.',
      author: 'Dr. Aris Thorne',
      publishedAt: '2023-10-24T18:30:00Z',
      source: { name: 'National Geographic' },
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1578798543329-55963a35b1b2?q=80&w=1968&auto=format&fit=crop',
      category: 'Science'
  },
  // Add more articles to populate other categories
  {
    id: '8',
    title: 'Political Shake-Up Following Surprise Election Results',
    description: 'The nation\'s political landscape is in turmoil after a snap election delivered unexpected gains for opposition parties, leading to a hung parliament.',
    body: 'The ruling party was left reeling after voters delivered a stunning rebuke in yesterday\'s election. Pundits had predicted a comfortable majority, but a late surge in support for opposition groups resulted in no single party commanding control of the legislature. Frantic negotiations have now begun to form a coalition government. Key issues that influenced the vote included the rising cost of living, healthcare reform, and environmental policies. The result signals a period of political uncertainty and potential policy shifts.',
    author: 'Susan Richards',
    publishedAt: '2023-10-27T07:00:00Z',
    source: { name: 'The Guardian' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1560513524-8b5e283f3638?q=80&w=1974&auto=format&fit=crop',
    category: 'Politics',
  },
  {
    id: '9',
    title: 'Is Gadget Fatigue a Real Thing? Consumers Weigh In',
    description: 'As new devices are released at a dizzying pace, some consumers report feeling overwhelmed by the constant pressure to upgrade.',
    body: 'From smartphones to smart watches, the tech industry thrives on a cycle of innovation and upgrades. However, a growing number of consumers are expressing a sense of "gadget fatigue." They cite the high cost, the minimal improvements between generations, and the environmental impact of constantly replacing devices as reasons for sticking with their older tech for longer. This emerging trend could challenge the business models of major tech companies and push them to focus more on longevity and meaningful innovation rather than incremental updates.',
    author: 'Alex Carter',
    publishedAt: '2023-10-26T15:00:00Z',
    source: { name: 'Wired' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1587397845856-e6cf4917638c?q=80&w=2070&auto=format&fit=crop',
    category: 'Gadgets',
  },
  {
    id: '10',
    title: 'Underdog Team Claims Championship in Stunning Upset',
    description: 'In a classic David vs. Goliath story, the league\'s lowest-ranked team has won the championship in a final match that will be talked about for years.',
    body: 'Nobody gave them a chance, but the Rovers have defied all odds to become national champions. They defeated the reigning champions, the Titans, in a nail-biting final that went into overtime. The winning goal was scored in the final seconds by rookie striker Leo Finn, cementing his place in the team\'s history. The victory is a culmination of a fairytale season, marked by incredible teamwork, resilience, and a belief that anything is possible. The city has erupted in celebration as their unlikely heroes bring home the trophy.',
    author: 'Tom Reilly',
    publishedAt: '2023-10-26T22:15:00Z',
    source: { name: 'ESPN' },
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop',
    category: 'Sport',
  },
];

const simulateDelay = (data: any) => new Promise(resolve => setTimeout(() => resolve(data), 500 + Math.random() * 500));

export const getTopHeadlines = async (): Promise<Article[]> => {
  return simulateDelay([...mockArticles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())) as Promise<Article[]>;
};

export const getArticlesByCategory = async (category: string): Promise<Article[]> => {
  const filtered = mockArticles.filter(a => a.category.toLowerCase() === category.toLowerCase());
  return simulateDelay(filtered) as Promise<Article[]>;
};

export const searchArticles = async (query: string): Promise<Article[]> => {
  const lowercasedQuery = query.toLowerCase();
  const results = mockArticles.filter(a =>
    a.title.toLowerCase().includes(lowercasedQuery) ||
    a.description.toLowerCase().includes(lowercasedQuery) ||
    a.body.toLowerCase().includes(lowercasedQuery)
  );
  return simulateDelay(results) as Promise<Article[]>;
};

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const summarizeArticleWithGemini = async (article: Article): Promise<string[]> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    return ["API key not configured. Summary feature disabled."];
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following article into a few key bullet points. Extract the most important information. The response must be in JSON format. Article Title: "${article.title}". Article Body: "${article.body}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                keyPoints: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: "A single key point summarizing a part of the article."
                    },
                    description: "An array of key points from the article."
                }
            },
            required: ["keyPoints"]
        }
      }
    });
    
    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    return result.keyPoints || [];
  } catch (error) {
    console.error("Error summarizing article with Gemini:", error);
    throw new Error("Failed to generate summary.");
  }
};


export const searchNewsWithGrounding = async (query: string): Promise<{ text: string; chunks: GroundingChunk[] }> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const text = response.text;
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { text, chunks };

    } catch(error) {
        console.error("Error with grounded search:", error);
        throw new Error("Failed to perform grounded search.");
    }
};
