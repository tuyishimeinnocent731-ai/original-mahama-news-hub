import { GoogleGenAI } from "@google/genai";
import { Article, GroundingChunk } from '../types';

// The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
// Assume this variable is pre-configured, valid, and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseArticlesFromResponse = (text: string, groundingChunks: GroundingChunk[] | undefined): Article[] => {
    try {
        const cleanedText = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        
        if (!Array.isArray(parsed.articles)) {
            console.error("Parsed response is not in the expected format:", parsed);
            return [];
        }
        
        return parsed.articles.map((article: any, index: number) => ({
            id: article.title + index,
            title: article.title || "No title",
            description: article.description || "No description",
            body: article.body || article.content || "Full content not available.",
            author: article.author || "Unknown",
            publishedAt: article.publishedAt || new Date().toISOString(),
            source: {
                name: article.source?.name || "Unknown Source"
            },
            url: article.url || groundingChunks?.[index]?.web?.uri || "#",
            urlToImage: article.urlToImage || `https://picsum.photos/seed/${encodeURIComponent(article.title || index)}/800/400`,
            category: 'search',
            keyPoints: article.keyPoints || [],
        }));
    } catch (error) {
        console.error("Error parsing articles from AI response:", error);
        console.error("Original response text:", text);
        return [{
            id: 'fallback-1',
            title: "AI Response",
            description: text.substring(0, 150) + '...',
            body: text,
            author: "Gemini",
            publishedAt: new Date().toISOString(),
            source: { name: "Google Search" },
            url: groundingChunks?.[0]?.web?.uri || "#",
            urlToImage: `https://picsum.photos/seed/fallback/800/400`,
            category: 'search',
            keyPoints: ["The AI returned a non-JSON response.", "This content is a fallback representation."],
        }];
    }
};

export const fetchNews = async (query: string): Promise<{articles: Article[]}> => {
  try {
    const prompt = `Fetch the latest top 10 news articles about "${query}". For each article, provide:
    1. title
    2. description (a concise summary)
    3. body (a full, multi-paragraph article body, at least 3-4 paragraphs long)
    4. keyPoints (an array of 3-4 short, bulleted strings summarizing the key takeaways)
    5. author
    6. source name
    7. publication date
    8. URL
    9. image URL.
    Format the output as a JSON object with a single key "articles" which is an array of article objects.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const articles = parseArticlesFromResponse(text, groundingChunks);

    return { articles };
  } catch (error) {
    console.error("Error fetching news from Gemini API:", error);
    return { articles: [] };
  }
};
