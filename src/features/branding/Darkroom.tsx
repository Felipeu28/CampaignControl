import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useCampaign } from '../../context/CampaignContext';
import { useGemini } from '../../hooks/useGemini';
import { EnhancedCreativeAsset } from '../../types';
import { handleAPIError, buildCampaignPrompt } from '../../utils/helpers';
import { generateCampaignImage } from '../../services/imageService';

export const Darkroom: React.FC = () => {
    const {
        profile,
        loadingStates,
        setLoading,
        brandingAssets,
        setBrandingAssets,
        addChatMessage
    } = useCampaign();

    const { generateText } = useGemini();

    const [imagePrompt, setImagePrompt] = useState({
        subject: '',
        env: '',
        style: 'Cinematic'
    });
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3'>('1:1');
    const [highQualityMode, setHighQualityMode] = useState(false);
    const [activeAssetId, setActiveAssetId] = useState<string | null>(null);

    const activeAsset = brandingAssets.find(a => a.id === activeAssetId);

    const generateVisual = async () => {
        if (!imagePrompt.subject) {
            addChatMessage('ai', '⚠️ Please enter a subject description for image generation.');
            return;
        }

        setLoading('generateImage', true);
        addChatMessage('ai', `🎨 Darkroom active. Generating visual for: "${imagePrompt.subject}"...`);

        try {
            // Build professional campaign prompt
            const fullPrompt = buildCampaignPrompt({
                subject: imagePrompt.subject,
                environment: imagePrompt.env,
                style: imagePrompt.style,
                party: profile.party,
                candidateName: profile.candidate_name
            });

            // Enhance prompt using Gemini (using useGemini hook logic manually or via generateText)
            // Since generateText returns string, we can use it directly.
            const enhancementPrompt = `You are an expert at creating detailed image generation prompts for political campaign photography. 
        
Take this campaign image request and create a highly detailed, professional prompt optimized for AI image generation:

${fullPrompt}

Enhance it with:
- Specific lighting details (golden hour, studio lighting, etc.)
- Camera angle and composition guidance
- Professional photography terminology
- Color palette specifics
- Mood and emotion direction
- Technical quality indicators (sharp focus, high resolution, etc.)

Output only the enhanced prompt, no explanations.`;

            const enhancedPrompt = await generateText(enhancementPrompt);

            // Generate REAL image using service
            // We need API Key here. In a real app we might not want to pass it from env to client like this if not using proxy, 
            // but sticking to existing pattern where we likely have access to it or the service handles it.
            // Wait, the service needs apiKey passed to it.
            // useGemini hook creates the client but doesn't expose key.
            // I need to get the key. `import.meta.env.VITE_GOOGLE_AI_API_KEY`.

            const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
            if (!apiKey) throw new Error('API Key missing');

            const dataUrl = await generateCampaignImage({
                apiKey,
                prompt: enhancedPrompt,
                aspectRatio: aspectRatio,
            });

            const newAsset: EnhancedCreativeAsset = {
                id: 'branding-' + Date.now(),
                type: 'PHOTO',
                title: imagePrompt.subject.slice(0, 40),
                mediaUrl: dataUrl,
                mediaType: 'image',
                status: 'draft',
                prompt: enhancedPrompt,
                content: enhancedPrompt, // Storing prompt as content for now
                metadata: {
                    aspectRatio,
                    quality: highQualityMode ? 'hd' : 'standard',
                    generatedAt: new Date().toISOString()
                }
            };

            // Add to branding assets (cap at 12 to prevent storage issues)
            setBrandingAssets(prev => [newAsset, ...prev].slice(0, 12));
            setActiveAssetId(newAsset.id);

            addChatMessage('ai', `✅ Visual generated! Image created with Gemini 2.5 Flash at ${highQualityMode ? "HD" : "standard"} quality.`);

        } catch (error) {
            const errorMsg = handleAPIError(error, 'Image Generation');
            addChatMessage('ai', errorMsg);
        } finally {
            setLoading('generateImage', false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
                        Campaign Darkroom
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
                        AI-Powered Visual Asset Generation
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <i className="fas fa-camera text-indigo-500"></i>
                    <span className="text-xs font-bold text-slate-600">
                        {brandingAssets.length} Assets
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Studio Controls" icon="fa-sliders">
                        <div className="space-y-5 pt-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Subject</label>
                                <input
                                    type="text"
                                    value={imagePrompt.subject}
                                    onChange={e => setImagePrompt({ ...imagePrompt, subject: e.target.value })}
                                    placeholder="e.g., Candidate talking to seniors"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Environment</label>
                                <input
                                    type="text"
                                    value={imagePrompt.env}
                                    onChange={e => setImagePrompt({ ...imagePrompt, env: e.target.value })}
                                    placeholder="e.g., Local park, town hall"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Style</label>
                                    <select
                                        value={imagePrompt.style}
                                        onChange={e => setImagePrompt({ ...imagePrompt, style: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option>Cinematic</option>
                                        <option>Candid</option>
                                        <option>Studio Portrait</option>
                                        <option>Political Rally</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Aspect</label>
                                    <select
                                        value={aspectRatio}
                                        onChange={e => setAspectRatio(e.target.value as any)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="1:1">Square (1:1)</option>
                                        <option value="16:9">Wide (16:9)</option>
                                        <option value="4:3">Standard (4:3)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={generateVisual}
                                disabled={loadingStates.generateImage || !imagePrompt.subject}
                                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loadingStates.generateImage ? (
                                    <><i className="fas fa-circle-notch fa-spin"></i> Developing...</>
                                ) : (
                                    <><i className="fas fa-camera-flash"></i> Generate Photo</>
                                )}
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Gallery / Preview */}
                <div className="lg:col-span-2">
                    {activeAsset ? (
                        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xl h-full flex flex-col">
                            <img
                                src={activeAsset.mediaUrl}
                                alt={activeAsset.title}
                                className="w-full h-auto rounded-2xl shadow-sm object-cover"
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800">{activeAsset.title}</h3>
                                    <p className="text-xs text-slate-500 font-mono">{activeAsset.prompt?.slice(0, 60)}...</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = activeAsset.mediaUrl || '';
                                        link.download = `campaign-viz-${activeAsset.id}.png`;
                                        link.click();
                                    }}
                                    className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    <i className="fas fa-download text-slate-600"></i>
                                </button>
                            </div>
                        </div>
                    ) : brandingAssets.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {brandingAssets.map(asset => (
                                <button
                                    key={asset.id}
                                    onClick={() => setActiveAssetId(asset.id)}
                                    className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all"
                                >
                                    <img
                                        src={asset.mediaUrl}
                                        alt={asset.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-bold uppercase tracking-wider">View</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 border-4 border-dashed border-slate-100 rounded-[3rem] opacity-40">
                            <i className="fas fa-images text-6xl text-slate-300 mb-6"></i>
                            <p className="text-lg font-black uppercase tracking-[0.2em] text-slate-400">Darkroom Empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
