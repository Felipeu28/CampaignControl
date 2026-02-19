import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useCampaign } from '../../context/CampaignContext';
import { useGemini } from '../../hooks/useGemini';
import { handleAPIError } from '../../utils/helpers';

export const CampaignDNA: React.FC = () => {
    const {
        profile,
        loadingStates,
        setLoading,
        updateMetadata,
        addChatMessage
    } = useCampaign();

    const { generateText } = useGemini();
    const [activeTab, setActiveTab] = useState<'core' | 'narrative'>('core');

    const dna = profile.metadata.dna;

    const runNarrativeSynthesis = async () => {
        setLoading('narrativeSynth', true);
        addChatMessage('ai', '🧬 Synthesizing campaign master narrative...');

        try {
            const synthPrompt = `Synthesize a Master Campaign Narrative for ${profile.candidate_name}.

INPUT DATA:
- Bio: ${dna?.personal_story || 'Not provided'}
- Reason for Running: ${dna?.reason_for_running || 'Not provided'}
- Key Issues: ${profile.voter_research}
- Core Values: ${dna?.core_values?.join(', ') || 'Not provided'}
- District Context: ${profile.district_id} (Demographics: ${JSON.stringify(profile.district_demographics)})

OUTPUT STRUCTURE:
1. The Hook (Emotional connection)
2. The Problem (What's wrong)
3. The Solution (Candidate's vision)
4. The Stakes (Why now?)
5. The Call to Action

Tone: Inspiring, authentic, strength-based.`;

            const narrative = await generateText(synthPrompt);

            updateMetadata({
                dna: {
                    ...dna,
                    master_narrative: narrative
                }
            });

            addChatMessage('ai', `✅ Master Narrative synthesized and saved to Campaign DNA.`);

        } catch (error) {
            const errorMsg = handleAPIError(error, 'Narrative Synthesis');
            addChatMessage('ai', errorMsg);
        } finally {
            setLoading('narrativeSynth', false);
        }
    };

    if (!dna) return <div>Loading DNA...</div>;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
                        Campaign DNA
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
                        Core Identity & Narrative Engine
                    </p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('core')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'core'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Core Identity
                    </button>
                    <button
                        onClick={() => setActiveTab('narrative')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'narrative'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Master Narrative
                    </button>
                </div>
            </div>

            {activeTab === 'core' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card title="Candidate Profile" icon="fa-fingerprint">
                        <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Name</label>
                                    <p className="font-bold text-slate-700">{profile.candidate_name}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Party</label>
                                    <p className="font-bold text-slate-700">{profile.party === 'D' ? 'Democrat' : profile.party === 'R' ? 'Republican' : 'Independent'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Office</label>
                                    <p className="font-bold text-slate-700">{profile.office_sought}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">District</label>
                                    <p className="font-bold text-slate-700">{profile.district_id}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Core Values" icon="fa-heart">
                        <div className="space-y-4 pt-4">
                            <div className="flex flex-wrap gap-2">
                                {dna.core_values?.map((val, i) => (
                                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                                        {val}
                                    </span>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Reason for Running</label>
                                <p className="text-sm font-medium text-slate-600 italic">"{dna.reason_for_running}"</p>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="space-y-6">
                    <Card title="Master Narrative Synthesis" icon="fa-book-open">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                            <p className="text-xs text-slate-500 leading-relaxed italic">
                                "I can analyze your bio, issues, and district data to synthesize a compelling Master Narrative needed for all campaign communications."
                            </p>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={runNarrativeSynthesis}
                                disabled={loadingStates.narrativeSynth}
                                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loadingStates.narrativeSynth ? (
                                    <><i className="fas fa-circle-notch fa-spin"></i> Synthesizing...</>
                                ) : (
                                    <><i className="fas fa-wand-magic-sparkles"></i> Synthesize Narrative</>
                                )}
                            </button>
                            {dna.master_narrative && (
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(dna.master_narrative || '');
                                        addChatMessage('ai', '✅ Narrative copied to clipboard!');
                                    }}
                                    className="w-16 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    <i className="fas fa-copy"></i>
                                </button>
                            )}
                        </div>

                        {dna.master_narrative ? (
                            <div className="bg-white border-l-4 border-indigo-500 pl-6 py-4 pr-4 rounded-r-xl shadow-sm">
                                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-serif">
                                    <div className="whitespace-pre-wrap">{dna.master_narrative}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-12 border-4 border-dashed border-slate-100 rounded-3xl opacity-40">
                                <p className="font-bold text-slate-300">No Narrative Generated Yet</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};
