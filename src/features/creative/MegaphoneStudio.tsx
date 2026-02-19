import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useCampaign } from '../../context/CampaignContext';
import { useGemini } from '../../hooks/useGemini';
import { CreativeAsset } from '../../types';
import { handleAPIError } from '../../utils/helpers';

export const MegaphoneStudio: React.FC = () => {
    const {
        profile,
        loadingStates,
        setLoading,
        creativeAssets,
        setCreativeAssets,
        activeCreativeAsset,
        setActiveCreativeAsset,
        addChatMessage,
        setChatMessages // Need this? No, we have addChatMessage
    } = useCampaign();

    const { generateText } = useGemini();
    const [previewMode, setPreviewMode] = useState<'raw' | 'social' | 'email' | 'print'>('raw');

    const generateCreative = async (type: string) => {
        setLoading('generateCreative', true);
        addChatMessage('ai', `📣 Megaphone active. Generating ${type}...`);

        try {
            const contentPrompts: Record<string, string> = {
                'Canvassing Script': `Create a persuasive door-to-door canvassing script for ${profile.candidate_name} running for ${profile.office_sought}.

Campaign Context:
- District: ${profile.district_id}
- Key Issues: ${profile.voter_research}
- Opponents: ${profile.metadata.opponents.map(o => o.name).join(', ')}
- Vote Goal: ${profile.metadata.vote_goal.target_vote_goal}

The script should:
1. Opening (introduction and ice breaker)
2. Issue identification (ask about their concerns)
3. Pitch (why ${profile.candidate_name} is the solution)
4. Ask (volunteer, lawn sign, vote commitment)
5. Closing (thank you and next steps)

Make it conversational, authentic, and persuasive. Include response handling for common objections.`,

                'Social Media Post': `Create viral-ready social media content for ${profile.candidate_name}'s ${profile.office_sought} campaign.

Campaign Context:
- District: ${profile.district_id}
- Party: ${profile.party}
- Key Issues: ${profile.voter_research}
- Master Narrative: ${profile.metadata.dna?.master_narrative || 'Fighting for our community'}

Create 3 social media posts:
1. Facebook post (longer form, community-focused)
2. Twitter/X post (punchy, shareable, with hashtags)
3. Instagram caption (visual-friendly, inspiring)

Each should be authentic, engaging, and drive action (donate, volunteer, vote).`,

                'Email Campaign': `Create a compelling email blast for ${profile.candidate_name} running for ${profile.office_sought}.

Campaign Context:
- Candidate: ${profile.candidate_name}
- District: ${profile.district_id}
- Key Issues: ${profile.voter_research}
- Opponent Weaknesses: ${profile.metadata.opponents[0]?.weaknesses.join(', ') || 'None identified'}

Structure:
1. Subject Line (High open rate optimization)
2. Personal Opening
3. The Problem (Urgency)
4. The Solution (Candidate's plan)
5. Call to Action (Donate/Volunteer)

Write in a personal, urgent tone.`,

                'Press Release': `Draft a formal press release for ${profile.candidate_name}.
Topic: Campaign Launch or Major Policy Announcement.
Include standard press release formatting, dateline, and contact info placeholder.`,

                'SMS Campaign': `Write a sequence of 3 SMS messages for ${profile.candidate_name}.
1. Introduction/Survey
2. Event Invitation
3. Donation Appeal
Keep them under 160 characters where possible or clearly mark segments.`,

                'Video Script': `Write a logic and script for a 60-second campaign launch video.
Include visual direction [bracketed] and spoken audio.
Focus on the candidate's story and vision for ${profile.district_id}.`
            };

            const prompt = contentPrompts[type] || `Generate ${type} content for ${profile.candidate_name}'s campaign.`;

            const content = await generateText(prompt);

            const newAsset: CreativeAsset = {
                id: 'creative-' + Date.now(),
                type: type,
                title: `${type} - ${new Date().toLocaleDateString()}`,
                content,
                status: 'draft',
                mediaType: 'text'
            };

            setCreativeAssets(prev => [newAsset, ...prev]);
            setActiveCreativeAsset(newAsset);

            addChatMessage('ai', `✅ ${type} generated successfully! Review in the Megaphone editor.`);

        } catch (error) {
            const errorMsg = handleAPIError(error, 'Content Generation');
            addChatMessage('ai', errorMsg);
        } finally {
            setLoading('generateCreative', false);
        }
    };

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
                        The Megaphone Studio
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
                        Professional Campaign Messaging Pipeline
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <i className="fas fa-sparkles text-amber-500"></i>
                    <span className="text-xs font-bold text-slate-600">
                        {creativeAssets.length} Active Messages
                    </span>
                </div>
            </div>

            {/* Content Type Gallery */}
            <Card title="Content Generator" subtitle="Professional Campaign Materials" icon="fa-wand-magic-sparkles">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                    {[
                        {
                            label: 'Social Media Post',
                            icon: 'fa-share-nodes',
                            desc: 'Viral content for Facebook, Twitter, Instagram',
                            color: 'from-blue-500 to-cyan-500',
                            iconBg: 'bg-blue-500',
                            estimatedReach: '2,500+ voters',
                            charLimit: '280 characters'
                        },
                        {
                            label: 'Email Campaign',
                            icon: 'fa-envelope-open-text',
                            desc: 'Persuasive emails that convert supporters',
                            color: 'from-purple-500 to-pink-500',
                            iconBg: 'bg-purple-500',
                            estimatedReach: '1,200+ subscribers',
                            charLimit: '500-800 words'
                        },
                        {
                            label: 'Canvassing Script',
                            icon: 'fa-door-open',
                            desc: 'Proven face-to-face conversation guide',
                            color: 'from-emerald-500 to-teal-500',
                            iconBg: 'bg-emerald-500',
                            estimatedReach: 'Personal touch',
                            charLimit: '2-3 minutes'
                        },
                        {
                            label: 'Press Release',
                            icon: 'fa-newspaper',
                            desc: 'Media-ready statements for journalists',
                            color: 'from-slate-600 to-slate-800',
                            iconBg: 'bg-slate-700',
                            estimatedReach: 'Media coverage',
                            charLimit: '300-500 words'
                        },
                        {
                            label: 'SMS Campaign',
                            icon: 'fa-mobile-screen-button',
                            desc: 'Mobile-first messages that drive action',
                            color: 'from-orange-500 to-red-500',
                            iconBg: 'bg-orange-500',
                            estimatedReach: '5,000+ contacts',
                            charLimit: '160 characters'
                        },
                        {
                            label: 'Video Script',
                            icon: 'fa-video',
                            desc: 'Broadcast-ready talking points',
                            color: 'from-indigo-500 to-purple-500',
                            iconBg: 'bg-indigo-500',
                            estimatedReach: 'Broadcast reach',
                            charLimit: '30-60 seconds'
                        }
                    ].map((contentType, i) => (
                        <button
                            key={i}
                            disabled={loadingStates.generateCreative}
                            onClick={() => generateCreative(contentType.label)}
                            className="group relative p-8 bg-white border-2 border-slate-200 rounded-3xl hover:border-transparent hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${contentType.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Icon */}
                                <div className={`w-16 h-16 ${contentType.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:bg-white transition-all`}>
                                    <i className={`fas ${contentType.icon} text-2xl text-white group-hover:${contentType.iconBg.replace('bg-', 'text-')}`}></i>
                                </div>

                                {/* Title */}
                                <h3 className="font-black text-sm uppercase tracking-tight text-slate-800 mb-2 group-hover:text-white transition-colors">
                                    {contentType.label}
                                </h3>

                                {/* Description */}
                                <p className="text-xs text-slate-500 leading-relaxed mb-4 group-hover:text-white/90 transition-colors">
                                    {contentType.desc}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 group-hover:border-white/20">
                                    <div className="text-left">
                                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 group-hover:text-white/70">
                                            Reach
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-600 group-hover:text-white">
                                            {contentType.estimatedReach}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 group-hover:text-white/70">
                                            Format
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-600 group-hover:text-white">
                                            {contentType.charLimit}
                                        </p>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 group-hover:text-white">
                                    <i className="fas fa-wand-magic-sparkles"></i>
                                    <span>Generate</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Quick Action Bar */}
                <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-lightbulb text-indigo-600 text-xl"></i>
                            <div>
                                <p className="text-sm font-black text-indigo-900">Need inspiration?</p>
                                <p className="text-xs text-indigo-600">Try our proven templates below</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => generateCreative('Social Media Post')}
                                className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all border border-indigo-200"
                            >
                                Quick Social Post
                            </button>
                            <button
                                onClick={() => generateCreative('Email Campaign')}
                                className="px-4 py-2 bg-white text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-600 hover:text-white transition-all border border-purple-200"
                            >
                                Fundraising Email
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Left Sidebar: Content Stack */}
                <div className="lg:col-span-1 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 italic">
                        Active Content Stack
                    </h4>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                        {creativeAssets.length === 0 ? (
                            <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center opacity-30">
                                <p className="text-[9px] font-black uppercase tracking-widest">Studio Empty</p>
                            </div>
                        ) : (
                            creativeAssets.map(asset => (
                                <button
                                    key={asset.id}
                                    disabled={loadingStates.generateCreative}
                                    onClick={() => setActiveCreativeAsset(asset)}
                                    className={`w-full p-6 rounded-3xl border text-left transition-all flex justify-between items-center ${activeCreativeAsset?.id === asset.id
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]'
                                            : 'bg-white border-slate-100 hover:border-indigo-300'
                                        } disabled:opacity-50`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-black uppercase tracking-tighter truncate leading-none mb-2">
                                            {asset.title}
                                        </p>
                                        <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${activeCreativeAsset?.id === asset.id ? 'text-indigo-200' : 'text-slate-400'
                                            }`}>
                                            {asset.type}
                                        </p>
                                    </div>
                                    <i className="fas fa-chevron-right text-[9px] opacity-30"></i>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Active Asset Editor */}
                <div className="lg:col-span-3 h-full">
                    {activeCreativeAsset ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative h-full">
                            <Card
                                title={activeCreativeAsset.title}
                                subtitle={activeCreativeAsset.type}
                                icon="fa-file-signature"
                                action={
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(activeCreativeAsset.content || '');
                                                addChatMessage('ai', '✅ Content copied to clipboard!');
                                            }}
                                            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200"
                                        >
                                            <i className="fas fa-copy mr-2"></i>
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCreativeAssets(prev => prev.filter(a => a.id !== activeCreativeAsset.id));
                                                setActiveCreativeAsset(null);
                                            }}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-200"
                                        >
                                            <i className="fas fa-trash-alt mr-2"></i>
                                            Delete
                                        </button>
                                    </div>
                                }
                            >
                                <div className="relative group/editor h-full flex flex-col">

                                    {/* Preview Mode Selector */}
                                    <div className="mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 mr-2">
                                            View As:
                                        </span>
                                        {[
                                            { id: 'raw', label: 'Raw Text', icon: 'fa-file-lines' },
                                            { id: 'social', label: 'Social Post', icon: 'fa-share-nodes' },
                                            { id: 'email', label: 'Email', icon: 'fa-envelope' },
                                            { id: 'print', label: 'Print', icon: 'fa-print' }
                                        ].map(mode => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setPreviewMode(mode.id as any)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${previewMode === mode.id
                                                        ? 'bg-indigo-600 text-white shadow-lg'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <i className={`fas ${mode.icon} mr-1.5`}></i>
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Content Display with Preview Mode - Simplified for now to just show text */}
                                    <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 italic text-xl leading-relaxed text-slate-700 font-medium mb-10 whitespace-pre-wrap shadow-inner border-l-8 border-indigo-600 flex-1">
                                        {activeCreativeAsset.content}
                                    </div>

                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-32 border-8 border-dashed border-slate-50 rounded-[4rem] opacity-20">
                            <i className="fas fa-pen-nib text-8xl mb-12"></i>
                            <p className="text-xl font-black uppercase tracking-[0.5em] text-center">
                                Select or Generate Content
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
