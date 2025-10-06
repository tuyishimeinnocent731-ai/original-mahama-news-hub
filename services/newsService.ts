import { GoogleGenAI, Type } from '@google/genai';
import { Article, GroundingChunk, SearchResult } from '../types';
import { NEWS_CATEGORIES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const articleSchema = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING, description: 'A compelling news headline, 7-12 words long.' },
        summary: { type: Type.STRING, description: 'A brief summary of the article, 2-3 sentences.' },
        category: { type: Type.STRING, description: 'The category of the news article.'},
        imageUrl: { type: Type.STRING, description: 'A placeholder image URL from https://picsum.photos of size 800x600.'}
    },
    required: ['headline', 'summary', 'category', 'imageUrl']
};

export const getInitialNews = async (): Promise<{ topStory: Article; secondaryStories: Article[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a set of diverse, realistic news articles in the style of a major international news outlet. Provide one top story and 8 secondary stories covering these categories: ${NEWS_CATEGORIES.join(', ')}. Ensure all image URLs are from picsum.photos with size 800/600.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topStory: articleSchema,
                        secondaryStories: {
                            type: Type.ARRAY,
                            items: articleSchema,
                            description: "An array of 8 secondary news articles."
                        }
                    },
                    required: ['topStory', 'secondaryStories']
                }
            }
        });
        
        const jsonResponse = JSON.parse(response.text);
        
        // Data validation
        if (!jsonResponse.topStory || !jsonResponse.secondaryStories || jsonResponse.secondaryStories.length === 0) {
            throw new Error("Invalid data structure received from API.");
        }

        return {
            topStory: jsonResponse.topStory,
            secondaryStories: jsonResponse.secondaryStories,
        };
    } catch (error) {
        console.error("Error fetching initial news:", error);
        throw new Error("Could not fetch news from the Gemini API.");
    }
};

export const searchNews = async (query: string): Promise<SearchResult> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide a concise, neutral news summary about: "${query}".`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const summary = response.text;
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

        const sources = groundingChunks
            .map(chunk => chunk.web)
            .filter(web => web?.uri); // Filter out any undefined/null chunks

        return {
            summary,
            sources
        };

    } catch (error) {
        console.error("Error searching news:", error);
        throw new Error("Could not perform search with the Gemini API.");
    }
};