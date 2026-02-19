/**
 * Display user-friendly error message
 */
export const handleAPIError = (error: unknown, context: string): string => {
    console.error(`[${context}] Error:`, error);

    if (error instanceof Error) {
        // Handle specific Google AI errors
        if (error.message.includes('API_KEY')) {
            return '⚠️ API key not configured. Please add your key to .env.local';
        }
        if (error.message.includes('quota')) {
            return '⚠️ API quota exceeded. Please check your usage limits.';
        }
        if (error.message.includes('SAFETY')) {
            return '🛡️ Content filtered by safety systems. Try rephrasing your request.';
        }
        return `❌ ${error.message}`;
    }

    return `❌ ${context} failed. Please try again.`;
};

/**
 * Convert File to Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

/**
 * Build professional campaign image prompt
 */
export const buildCampaignPrompt = (params: {
    subject: string;
    environment: string;
    style: string;
    party: string;
    candidateName: string;
}): string => {
    const partyColors = {
        'D': 'modern blue and white tones, professional democratic branding',
        'R': 'patriotic red and blue accents, conservative aesthetic',
        'I': 'independent slate and emerald tones, non-partisan design'
    };

    const colorScheme = partyColors[params.party as keyof typeof partyColors] || partyColors['I'];

    return `Professional political campaign photography: ${params.style}. Subject: ${params.subject}. Setting: ${params.environment}. Style: High-quality, cinematic lighting, sharp focus, ${colorScheme}. Campaign-ready, publication quality. For candidate ${params.candidateName}.`;
};
