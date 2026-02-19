import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate images using Gemini 2.5 Flash Image or equivalent
 */
export async function generateCampaignImage(opts: {
    apiKey: string;
    prompt: string;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
}): Promise<string> {
    const { apiKey, prompt, aspectRatio = '1:1' } = opts;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Using the model specified in the original App.tsx
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp" // Falling back to known model if 2.5 is not available or just using what was there
            // The original code said "gemini-2.5-flash-image" but finding that might be tricky if it's preview.
            // I will stick to what the user had in the view_file if it was indeed 2.5
        });

        // Wait, the viewed file said: model: "gemini-2.5-flash-image"
        // I should use that.
        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        // Actually, let's stick to a safe default or what was there.
        // The user's code had "gemini-2.5-flash-image". I'll use it but wrap in try-catch fallback?
        // No, let's copy exactly what they had.

        const targetModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        // Note: The original code I viewed had "gemini-2.5-flash-image" in the comment but "gemini-2.0-flash-exp" in other places.
        // Wait, let's re-read line 934 of App.tsx from standard log.
        // Line 934: model: "gemini-2.5-flash-image"
        // Okay, I will use that.

        const realModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        const result = await realModel.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { text: `${prompt}. Image aspect ratio: ${aspectRatio}` }
                ]
            }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 8192,
            }
        });

        const response = await result.response;

        if (!response.candidates || !response.candidates[0].content.parts) {
            throw new Error('Invalid response structure from Image API');
        }

        // Extract image from response parts
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64Image = part.inlineData.data;
                return `data:image/png;base64,${base64Image}`;
            }
        }

        throw new Error('No image data returned from API');

    } catch (error) {
        console.error('Image generation error:', error);
        throw error;
    }
}
