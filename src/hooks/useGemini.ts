import { GoogleGenerativeAI } from "@google/generative-ai";
import { useCallback } from "react";

const getApiKey = () => {
    const key = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!key || key === 'your_google_ai_key_here') {
        console.error('⚠️ VITE_GOOGLE_AI_API_KEY not configured in .env.local');
        return null;
    }
    return key;
};

// Singleton-ish pattern for the client to avoid re-initialization
let genAIInstance: GoogleGenerativeAI | null = null;

const getGenAI = () => {
    if (!genAIInstance) {
        const key = getApiKey();
        if (key) {
            genAIInstance = new GoogleGenerativeAI(key);
        }
    }
    return genAIInstance;
};

export const useGemini = () => {

    const generateText = useCallback(async (prompt: string, modelName: string = "gemini-2.0-flash-exp") => {
        const genAI = getGenAI();
        if (!genAI) throw new Error("API Key missing");

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Text Generation Error:", error);
            throw error;
        }
    }, []);

    const generateJSON = useCallback(async (prompt: string, modelName: string = "gemini-2.0-flash-exp") => {
        const genAI = getGenAI();
        if (!genAI) throw new Error("API Key missing");

        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini JSON Generation Error:", error);
            throw error;
        }
    }, []);

    return {
        generateText,
        generateJSON
    };
};
