import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useCampaign } from '../../context/CampaignContext';
import { useGemini } from '../../hooks/useGemini';
import { ResearchMode, ResearchSnapshot } from '../../types';
import { handleAPIError } from '../../utils/helpers';

export const IntelligenceDashboard: React.FC = () => {
    const {
        profile,
        loadingStates,
        setLoading,
        activeResearchMode: researchMode,
        setActiveResearchMode: setResearchMode,
        researchVault,
        setResearchVault,
        addChatMessage
    } = useCampaign();

    const { generateText } = useGemini();
    const [activeResearchId, setActiveResearchId] = useState<string | null>(null);

    // Modal States
    const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
    const [dossierTarget, setDossierTarget] = useState<any | null>(null);
    const [isReviewRivalsModalOpen, setIsReviewRivalsModalOpen] = useState(false);

    const activeResearch = researchVault.find(v => v.id === activeResearchId);

    // Constants
    const criticalModes = [
        { id: 'FUNDRAISING', label: 'Fundraising', icon: 'fa-money-bill-wave', color: 'emerald' },
        { id: 'OPPOSITION', label: 'Opposition', icon: 'fa-user-ninja', color: 'red' },
        { id: 'ECONOMIC', label: 'Economic', icon: 'fa-money-bill-trend-up', color: 'blue' },
    ];

    const tacticalModes = [
        { id: 'SENTIMENT', label: 'Sentiment', icon: 'fa-face-smile-wink', color: 'purple' },
        { id: 'MEDIA', label: 'Media', icon: 'fa-newspaper', color: 'slate' },
        { id: 'SOCIAL', label: 'Social Media', icon: 'fa-hashtag', color: 'cyan' },
        { id: 'REGISTRATION', label: 'Voter Data', icon: 'fa-users-line', color: 'indigo' },
    ];

    const strategicModes = [
        { id: 'POLICY', label: 'Policy', icon: 'fa-bridge', color: 'teal' },
        { id: 'GEOGRAPHY', label: 'Geography', icon: 'fa-map-location-dot', color: 'orange' },
        { id: 'ETHICS', label: 'Compliance', icon: 'fa-shield-halved', color: 'amber' },
    ];

    const runNeuralProbe = async (mode: ResearchMode) => {
        setLoading('probe', true);
        setResearchMode(mode);

        const researchPrompts: Record<ResearchMode, string> = {
            ECONOMIC: `Analyze the economic landscape of ${profile.district_id}. Focus on: median income trends, major employers, unemployment rates, property values, and how economic issues might impact the ${profile.office_sought} race. Provide specific data points and strategic implications.`,
            SENTIMENT: `Analyze voter sentiment in ${profile.district_id}. What are voters most concerned about? What's the mood toward incumbents? Are there signs of change-seeking behavior? Provide sentiment score and tactical recommendations.`,
            POLICY: `Identify the top 5 policy issues in ${profile.district_id}. For each issue: describe the problem, voter intensity, political divisions, and recommend a position for ${profile.candidate_name}.`,
            OPPOSITION: `Research opponent ${profile.metadata.opponents[0]?.name || 'the incumbent'}. Find: voting record vulnerabilities, controversial statements, funding sources, and weaknesses ${profile.candidate_name} can exploit.`,
            MEDIA: `Analyze media landscape in ${profile.district_id}. Identify: key local news outlets, influential journalists, social media influencers, and opportunities for ${profile.candidate_name} to gain coverage.`,
            REGISTRATION: `Analyze voter registration trends in ${profile.district_id}. Track: party registration changes, demographic shifts, new voter registrations, and turnout patterns. Identify persuadable voter segments.`,
            SOCIAL: `Scan social media conversations about ${profile.district_id} politics. What hashtags are trending? What issues are going viral? Where is ${profile.candidate_name}'s name appearing? Sentiment analysis required.`,
            FUNDRAISING: `Identify fundraising opportunities for ${profile.candidate_name}. Research: local donors, PACs, industry groups, wealthy individuals aligned with Democratic values. Provide contact strategies.`,
            GEOGRAPHY: `Analyze ${profile.district_id} geographic and precinct data. Identify: high-turnout precincts, swing precincts, areas needing field investment, and geographic voting patterns.`,
            ETHICS: `Research ethics and compliance requirements for ${profile.office_sought}. Identify: contribution limits, reporting deadlines, disclaimer requirements, and common compliance mistakes to avoid.`
        };

        addChatMessage('ai', `📡 Initiating ${mode} probe for ${profile.district_id}... Scanning intelligence sources...`);

        try {
            const text = await generateText(researchPrompts[mode]);

            // Create research snapshot
            const snapshot: ResearchSnapshot = {
                id: 'research-' + Date.now(),
                mode,
                timestamp: new Date().toISOString(),
                text,
                sources: [],
                signalStrength: Math.floor(Math.random() * 30) + 70 // 70-100 signal strength
            };

            setResearchVault(prev => [snapshot, ...prev]);
            setActiveResearchId(snapshot.id);

            addChatMessage('ai', `✅ ${mode} probe complete. Intelligence snapshot saved to vault. Signal strength: ${snapshot.signalStrength}%`);
        } catch (error) {
            const errorMsg = handleAPIError(error, `${mode} Probe`);
            addChatMessage('ai', errorMsg);

            // Save error to vault for debugging
            const errorSnapshot: ResearchSnapshot = {
                id: 'research-error-' + Date.now(),
                mode,
                timestamp: new Date().toISOString(),
                text: 'Research probe failed. Please try again.',
                sources: [],
                error: errorMsg
            };
            setResearchVault(prev => [errorSnapshot, ...prev]);
        } finally {
            setLoading('probe', false);
        }
    };

    const startSyncRivals = async () => {
        if (!activeResearch) {
            addChatMessage('ai', '⚠️ No active research selected. Please run a probe first.');
            return;
        }

        setLoading('extractRivals', true);
        addChatMessage('ai', '🕵️‍♀️ Extracting rival intelligence from current snapshot...');

        // Placeholder logic since the original used detailed parsing which we might want to move to useGemini later
        // For now, simpler simulation or we need to implement the full extraction logic
        setTimeout(() => {
            addChatMessage('ai', '⚠️ Rival extraction logic pending migration. Please view the raw report.');
            setLoading('extractRivals', false);
        }, 1000);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
                        Intelligence Command Center
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
                        Multi-Modal District Intelligence & Opposition Research
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-600">
                            {researchVault.length} Intel Reports
                        </span>
                    </div>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <i className="fas fa-crosshairs text-red-500"></i>
                        <span className="text-xs font-bold text-slate-600">
                            {profile.metadata.opponents.length} Targets
                        </span>
                    </div>
                </div>
            </div>

            {/* Intelligence Command Dashboard */}
            <Card
                title="Intelligence Operations"
                subtitle="Prioritized Research Modes"
                icon="fa-radar"
            >
                <div className="space-y-8 pt-6">

                    {/* CRITICAL Priority */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-black uppercase tracking-wider text-red-700">Critical Priority</span>
                            </div>
                            <p className="text-xs text-slate-500">Run first - highest impact on campaign</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {criticalModes.map(mode => (
                                <button
                                    key={mode.id}
                                    disabled={loadingStates.probe}
                                    onClick={() => runNeuralProbe(mode.id as ResearchMode)}
                                    className={`group relative p-6 rounded-2xl border-2 transition-all overflow-hidden ${researchMode === mode.id
                                        ? `bg-${mode.color}-600 border-${mode.color}-600 shadow-xl scale-[1.02]`
                                        : `bg-white border-slate-200 hover:border-${mode.color}-400 hover:shadow-lg`
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {/* Background gradient on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br from-${mode.color}-500 to-${mode.color}-700 opacity-0 group-hover:opacity-100 transition-opacity ${researchMode === mode.id ? 'opacity-100' : ''}`}></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${researchMode === mode.id
                                                ? 'bg-white/20'
                                                : `bg-${mode.color}-50 group-hover:bg-white`
                                                } transition-all`}>
                                                <i className={`fas ${mode.icon} text-xl ${researchMode === mode.id
                                                    ? 'text-white'
                                                    : `text-${mode.color}-600 group-hover:text-${mode.color}-600`
                                                    }`}></i>
                                            </div>
                                            {researchVault.some(r => r.mode === mode.id) && (
                                                <span className={`text-xs font-bold ${researchMode === mode.id ? 'text-white/70' : 'text-emerald-600'
                                                    }`}>
                                                    ✓ Scanned
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`font-black text-sm uppercase tracking-tight mb-2 ${researchMode === mode.id ? 'text-white' : 'text-slate-800 group-hover:text-white'
                                            }`}>
                                            {mode.label}
                                        </h3>
                                        <p className={`text-xs ${researchMode === mode.id ? 'text-white/80' : 'text-slate-500 group-hover:text-white/90'
                                            }`}>
                                            {loadingStates.probe ? 'Scanning...' : 'Click to scan'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TACTICAL Operations */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span className="text-xs font-black uppercase tracking-wider text-amber-700">Tactical Operations</span>
                            </div>
                            <p className="text-xs text-slate-500">Regular monitoring - run weekly</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {tacticalModes.map(mode => (
                                <button
                                    key={mode.id}
                                    disabled={loadingStates.probe}
                                    onClick={() => runNeuralProbe(mode.id as ResearchMode)}
                                    className={`group relative p-5 rounded-xl border-2 transition-all ${researchMode === mode.id
                                        ? `bg-${mode.color}-600 border-${mode.color}-600 shadow-lg`
                                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                        } disabled:opacity-50`}
                                >
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${researchMode === mode.id ? 'bg-white/20' : `bg-${mode.color}-50`
                                            }`}>
                                            <i className={`fas ${mode.icon} ${researchMode === mode.id ? 'text-white' : `text-${mode.color}-600`
                                                }`}></i>
                                        </div>
                                        <span className={`text-xs font-bold ${researchMode === mode.id ? 'text-white' : 'text-slate-700'
                                            }`}>
                                            {mode.label}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* STRATEGIC Analysis */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-black uppercase tracking-wider text-blue-700">Strategic Analysis</span>
                            </div>
                            <p className="text-xs text-slate-500">Deep research - run monthly</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {strategicModes.map(mode => (
                                <button
                                    key={mode.id}
                                    disabled={loadingStates.probe}
                                    onClick={() => runNeuralProbe(mode.id as ResearchMode)}
                                    className={`group p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${researchMode === mode.id
                                        ? `bg-${mode.color}-600 border-${mode.color}-600 text-white shadow-lg`
                                        : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700'
                                        } disabled:opacity-50`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${researchMode === mode.id ? 'bg-white/20' : `bg-${mode.color}-50`
                                        }`}>
                                        <i className={`fas ${mode.icon} ${researchMode === mode.id ? 'text-white' : `text-${mode.color}-600`
                                            }`}></i>
                                    </div>
                                    <span className="text-xs font-bold">{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Threat Matrix - UPGRADED TACTICAL DASHBOARD */}
            <Card
                title="Threat Matrix"
                icon="fa-crosshairs"
                subtitle="Opposition Intelligence & Target Tracking"
                className="border-red-500/30 overflow-visible"
                action={
                    <div className="flex gap-3">
                        <button
                            onClick={startSyncRivals}
                            disabled={!activeResearch || loadingStates.extractRivals}
                            className={`bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-3 border border-indigo-100 disabled:opacity-50 ${loadingStates.extractRivals ? 'animate-pulse' : ''
                                }`}
                        >
                            <i className={`fas ${loadingStates.extractRivals ? 'fa-circle-notch fa-spin' : 'fa-robot'}`}></i>
                            {loadingStates.extractRivals ? 'Scanning...' : 'Auto-Extract Rivals'}
                        </button>
                        <button
                            onClick={() => setIsCompetitorModalOpen(true)}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Register Target
                        </button>
                        <button
                            onClick={() => setIsReviewRivalsModalOpen(true)}
                            className="bg-white text-slate-700 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border-2 border-slate-200"
                        >
                            <i className="fas fa-list mr-2"></i>
                            Review All
                        </button>
                    </div>
                }
            >
                {
                    profile.metadata.opponents.length > 0 ? (
                        <>
                            {/* Threat Level Summary */}
                            <div className="grid grid-cols-3 gap-4 mb-8 pt-4">
                                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-2xl border-2 border-red-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                                            <i className="fas fa-exclamation-triangle text-white"></i>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-red-700">
                                                {profile.metadata.opponents.filter(o => o.incumbent || o.weaknesses.length < 3).length}
                                            </p>
                                            <p className="text-xs font-black uppercase tracking-wider text-red-600">High Threat</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                                            <i className="fas fa-shield-halved text-white"></i>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-amber-700">
                                                {profile.metadata.opponents.filter(o => !o.incumbent && o.weaknesses.length >= 3 && o.weaknesses.length < 5).length}
                                            </p>
                                            <p className="text-xs font-black uppercase tracking-wider text-amber-600">Medium Threat</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border-2 border-emerald-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                                            <i className="fas fa-check-circle text-white"></i>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-emerald-700">
                                                {profile.metadata.opponents.filter(o => o.weaknesses.length >= 5).length}
                                            </p>
                                            <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Low Threat</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Opponent Cards - Enhanced */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {profile.metadata.opponents.map((o, i) => {
                                    // Calculate threat level
                                    const isHighThreat = o.incumbent || o.weaknesses.length < 3;
                                    const isMediumThreat = !o.incumbent && o.weaknesses.length >= 3 && o.weaknesses.length < 5;
                                    const threatColor = isHighThreat ? 'red' : isMediumThreat ? 'amber' : 'emerald';
                                    const threatLabel = isHighThreat ? 'HIGH THREAT' : isMediumThreat ? 'MEDIUM THREAT' : 'LOW THREAT';

                                    return (
                                        <div
                                            key={i}
                                            className={`group relative bg-white rounded-3xl border-2 overflow-hidden transition-all hover:shadow-2xl ${isHighThreat ? 'border-red-300 hover:border-red-500' :
                                                isMediumThreat ? 'border-amber-300 hover:border-amber-500' :
                                                    'border-emerald-300 hover:border-emerald-500'
                                                }`}
                                        >
                                            {/* Threat Level Banner */}
                                            <div className={`px-6 py-3 flex items-center justify-between ${isHighThreat ? 'bg-gradient-to-r from-red-600 to-red-700' :
                                                isMediumThreat ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                                                    'bg-gradient-to-r from-emerald-600 to-emerald-700'
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isHighThreat ? 'bg-red-500' : isMediumThreat ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}>
                                                        <i className={`fas ${isHighThreat ? 'fa-exclamation-triangle' :
                                                            isMediumThreat ? 'fa-shield-halved' :
                                                                'fa-check-circle'
                                                            } text-white text-sm`}></i>
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-white">
                                                        {threatLabel}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold text-white/80">
                                                    {o.party} • {o.incumbent ? 'INCUMBENT' : 'CHALLENGER'}
                                                </span>
                                            </div>

                                            {/* Main Content */}
                                            <div className="p-6 space-y-6">
                                                {/* Name & Status */}
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-slate-800 mb-1">
                                                            {o.name}
                                                        </h3>
                                                        {o.incumbent && (
                                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg">
                                                                <i className="fas fa-crown text-amber-400 text-xs"></i>
                                                                <span className="text-xs font-black uppercase tracking-wider">Incumbent</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Intelligence Stats Grid */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                                        <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Strengths</p>
                                                        <p className="text-2xl font-black text-indigo-600">{o.strengths.length}</p>
                                                    </div>
                                                    <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                                                        <p className="text-xs font-black uppercase tracking-wider text-red-600 mb-1">Weaknesses</p>
                                                        <p className="text-2xl font-black text-red-600">{o.weaknesses.length}</p>
                                                    </div>
                                                </div>

                                                {/* Latest Intel Highlight */}
                                                {o.weaknesses.length > 0 && (
                                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                                                        <div className="flex items-start gap-3">
                                                            <i className="fas fa-bolt text-amber-600 mt-1"></i>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-black uppercase tracking-wider text-amber-800 mb-1">
                                                                    Latest Intel
                                                                </p>
                                                                <p className="text-sm text-slate-700 font-medium">
                                                                    "{o.weaknesses[0]}" - Exploit in contrast messaging
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Top Weaknesses */}
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                                                        Exploitable Weaknesses
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {o.weaknesses.slice(0, 3).map((w, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200"
                                                            >
                                                                {w}
                                                            </span>
                                                        ))}
                                                        {o.weaknesses.length > 3 && (
                                                            <span className="text-slate-500 text-xs font-bold py-1.5">
                                                                +{o.weaknesses.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); runNeuralProbe('OPPOSITION'); }}
                                                        disabled={loadingStates.probe}
                                                        className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        <i className="fas fa-magnifying-glass-chart"></i>
                                                        Deep Scan
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDossierTarget(o); }}
                                                        className="px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                                    >
                                                        <i className="fas fa-folder-open"></i>
                                                        Full Dossier
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="py-20">
                            <div className="max-w-md mx-auto text-center">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <i className="fas fa-crosshairs text-4xl text-slate-300"></i>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-3">
                                    No Opposition Targets Registered
                                </h3>
                                <p className="text-sm text-slate-500 mb-8">
                                    Start tracking your competition to build tactical advantages
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => setIsCompetitorModalOpen(true)}
                                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg"
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        Register First Target
                                    </button>
                                    <button
                                        onClick={startSyncRivals}
                                        disabled={!activeResearch || loadingStates.extractRivals}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all disabled:opacity-50"
                                    >
                                        <i className="fas fa-robot mr-2"></i>
                                        Auto-Extract from Intel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </Card >

            {/* Intelligence Vault Display */}
            < div className="grid grid-cols-1 lg:grid-cols-3 gap-10" >
                {/* Left: Vault Selector */}
                < div className="lg:col-span-1 space-y-6" >
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 italic">
                        Intelligence Vault
                    </h4>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {researchVault.length === 0 ? (
                            <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center opacity-30">
                                <i className="fas fa-database text-5xl text-slate-300 mb-4"></i>
                                <p className="text-[9px] font-black uppercase tracking-widest">Vault Empty</p>
                            </div>
                        ) : (
                            researchVault.map(snap => (
                                <button
                                    key={snap.id}
                                    onClick={() => setActiveResearchId(snap.id)}
                                    className={`w-full p-6 rounded-2xl border text-left transition-all ${activeResearchId === snap.id
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]'
                                            : 'bg-white border-slate-100 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${activeResearchId === snap.id ? 'text-indigo-200' : 'text-slate-400'
                                            }`}>
                                            {snap.mode}
                                        </span>
                                        {snap.signalStrength && (
                                            <span className={`text-[10px] font-black ${activeResearchId === snap.id ? 'text-white' : 'text-indigo-600'
                                                }`}>
                                                {snap.signalStrength}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[9px] font-bold opacity-70 line-clamp-2">
                                        {new Date(snap.timestamp).toLocaleString()}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div >

                {/* Right: Active Research Display */}
                < div className="lg:col-span-2" >
                    {
                        activeResearch ? (
                            <Card
                                title={activeResearch.mode + ' Intelligence Report'}
                                subtitle={new Date(activeResearch.timestamp).toLocaleString()}
                                icon="fa-brain"
                                action={
                                    < button className="text-slate-400 hover:text-indigo-600 transition-colors" >
                                        <i className="fas fa-download"></i>
                                    </button>
                                }
                            >
                                <div className="prose prose-sm max-w-none">
                                    {/* Key Findings */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200 mb-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-lightbulb text-white"></i>
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-wider text-indigo-900">
                                                Key Findings
                                            </h3>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm">
                                            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                                {activeResearch.text.split('\n\n')[0]}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Full Report */}
                                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 leading-relaxed text-slate-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                        {activeResearch.text}
                                    </div>
                                    {activeResearch.error && (
                                        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                            <p className="text-xs font-bold text-red-700">
                                                ⚠️ {activeResearch.error}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card >
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-32 border-8 border-dashed border-slate-50 rounded-[4rem] opacity-20">
                                <i className="fas fa-satellite-dish text-8xl mb-12"></i>
                                <p className="text-xl font-black uppercase tracking-[0.5em] text-center">
                                    Select Research Snapshot
                                </p>
                            </div>
                        )}
                </div >
            </div >
        </div >
    );
};
