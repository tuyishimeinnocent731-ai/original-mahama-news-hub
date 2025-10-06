import { GoogleGenAI } from "@google/genai";
import { Article, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY" });

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
            body: article.body || article.content || "Full content not available.", // Prioritize 'body'
            author: article.author || "Unknown",
            publishedAt: article.publishedAt || new Date().toISOString(),
            source: {
                name: article.source?.name || "Unknown Source"
            },
            url: article.url || groundingChunks?.[index]?.web?.uri || "#",
            urlToImage: article.urlToImage || `https://picsum.photos/seed/${encodeURIComponent(article.title || index)}/400/200`,
            category: 'search'
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
            urlToImage: `https://picsum.photos/seed/fallback/400/200`,
            category: 'search'
        }];
    }
};

export const fetchNews = async (query: string): Promise<{articles: Article[], sources: GroundingChunk[]}> => {
  try {
    const prompt = `Fetch the latest top 10 news articles about "${query}". For each article, provide:
    1. title
    2. description (a concise summary)
    3. body (a full, multi-paragraph article body, at least 3-4 paragraphs long)
    4. author
    5. source name
    6. publication date
    7. URL
    8. image URL.
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

    return { articles, sources: groundingChunks || [] };
  } catch (error) {
    console.error("Error fetching news from Gemini API:", error);
    return { articles: [], sources: [] };
  }
};
