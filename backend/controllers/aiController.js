const { GoogleGenAI, Type } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const summarize = async (req, res) => {
    const { body, title } = req.body;
    const prompt = `Summarize the following news article in 3-4 concise sentences, focusing on the main points.
    Title: ${title}
    Article: ${body}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        res.json({ summary: response.text });
    } catch (error) {
        console.error("Error summarizing article:", error);
        res.status(500).json({ message: "Sorry, we couldn't generate a summary at this time." });
    }
};

const getKeyPoints = async (req, res) => {
    const { body } = req.body;
    const prompt = `Extract the 3 to 5 most important key points from the following article. Present them as a list. Do not use markdown like '*' or '-'. Each point should be a separate line.
    Article: ${body}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = response.text;
        const points = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        res.json({ keyPoints: points });
    } catch (error) {
        console.error("Error getting key points:", error);
        res.status(500).json({ message: "Could not extract key points at this time." });
    }
};

const askAboutArticle = async (req, res) => {
    const { body, title, question } = req.body;
    const prompt = `Based on the following article, please answer the user's question. If the answer is not in the article, say that you cannot find the information in the provided text.
    
    Title: ${title}
    Article: ${body}
    
    Question: ${question}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        res.json({ answer: response.text });
    } catch (error) {
        console.error("Error answering question:", error);
        res.status(500).json({ message: "Sorry, I encountered an error while trying to answer your question." });
    }
};

const generateImage = async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `News article illustration, professional digital art style. ${prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            res.json({ imageUrl });
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ message: "Sorry, we couldn't generate an image at this time." });
    }
};

const translate = async (req, res) => {
    const { body, title, targetLanguage } = req.body;
    const prompt = `Translate the following news article into ${targetLanguage}. Return a JSON object with two keys: "translatedTitle" and "translatedBody". Do not add any other text or markdown formatting outside of the JSON object.
    Original Title: ${title}
    Original Body: ${body}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translatedTitle: { type: Type.STRING },
                        translatedBody: { type: Type.STRING }
                    },
                    required: ["translatedTitle", "translatedBody"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        res.json({
            title: parsed.translatedTitle,
            body: parsed.translatedBody,
        });
    } catch (error) {
        console.error(`Error translating article:`, error);
        res.status(500).json({ title: "Translation Failed", body: "We couldn't translate this article at the moment." });
    }
};

module.exports = { summarize, getKeyPoints, askAboutArticle, generateImage, translate };