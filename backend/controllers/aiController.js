const { GoogleGenAI, Type } = require('@google/genai');
require('dotenv').config();
const multer = require('multer');
const fetch = require('node-fetch');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Multer storage config for video generation image
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 16 * 1024 * 1024 } // 16MB limit for VEO
});

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

const generateVideo = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required.' });
        }

        const videoParams = {
            model: 'veo-2.0-generate-001',
            prompt,
            config: { numberOfVideos: 1 }
        };

        if (req.file) {
            videoParams.image = {
                imageBytes: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype,
            };
        }
        
        const operation = await ai.models.generateVideos(videoParams);
        res.json(operation);

    } catch (error) {
        console.error("Error generating video:", error);
        next(error);
    }
};

const getVideoOperation = async (req, res, next) => {
    try {
        const { operation } = req.body;
        if (!operation) {
            return res.status(400).json({ message: 'Operation object is required.' });
        }

        let updatedOp = await ai.operations.getVideosOperation({ operation });

        if (updatedOp.done && !updatedOp.error) {
            const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if (!videoResponse.ok) {
                    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
                }
                const videoBuffer = await videoResponse.buffer();
                const base64Video = videoBuffer.toString('base64');
                const dataUrl = `data:video/mp4;base64,${base64Video}`;
                
                if (updatedOp.response.generatedVideos[0].video) {
                    updatedOp.response.generatedVideos[0].video.dataUrl = dataUrl;
                }
            }
        }
        
        res.json(updatedOp);
    } catch (error) {
        console.error("Error getting video operation status:", error);
        next(error);
    }
};


module.exports = { 
    summarize, 
    getKeyPoints, 
    askAboutArticle, 
    generateImage, 
    translate,
    generateVideo,
    getVideoOperation,
    upload
};
