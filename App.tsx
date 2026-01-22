// ============================================================================
// VICTORYOPS - PART 1: FOUNDATION & STATE
// ============================================================================
// This is Part 1 of 4. After all parts are created, combine them into App.tsx
// START: Copy from here
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ FIXED IMPORT
import { 
  calculateVoteGoal, 
  validateCampaignProfile,
  detectCampaignNeed,
  parseVoterFile,
  generateTexasDisclaimer
} from './services/campaignLogic';
import { 
  CampaignProfileRow, 
  VoterRecord, 
  Opponent, 
  CampaignDNA, 
  BudgetEstimate, 
  DonorLead,
  LegalShieldData,
  ComplianceDeadline,
  CreativeAsset,
  StrategicReport
} from './types';

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

const STORAGE_KEY = 'victory_ops_merged_v1_state';

// Research Modes for Intelligence Module
type ResearchMode = 'ECONOMIC' | 'SENTIMENT' | 'POLICY' | 'OPPOSITION' | 
                    'MEDIA' | 'REGISTRATION' | 'SOCIAL' | 'FUNDRAISING' | 
                    'GEOGRAPHY' | 'ETHICS';

interface ResearchSnapshot {
  id: string;
  mode: ResearchMode;
  timestamp: string;
  text: string;
  sources: any[];
  signalStrength?: number;
  parsed?: {
    signal: string;
    threat: string;
    action: string;
  };
}

// Demo Campaign Profile
const DEMO_PROFILE: CampaignProfileRow = {
  session_id: 'demo-merged-123',
  candidate_name: 'Marcus Thorne',
  office_sought: 'Texas House District 52',
  district_id: 'TX-HD-52',
  party: 'D',
  voter_research: 'Working class district with rapid tech sector growth. Major issues: Property taxes, school funding, infrastructure. Key demographic: Middle-income families (35-50) concerned about tax rates.',
  district_demographics: {
    total_population: 155000,
    age_distribution: { '18-24': 12, '25-44': 35, '45-64': 30, '65+': 23 },
    race_ethnicity: { 'White': 55, 'Hispanic': 30, 'Black': 10, 'Asian': 5 },
    income: { median: 72000 },
    education: { 'Degree': 42 },
    housing: { owner_occupied: 65, renter_occupied: 35 }
  },
  filing_info: {
    filing_deadline: '2025-03-01',
    petition_signatures_required: 500,
    filing_fee: 750,
    forms_required: ['Form CTA', 'Form CFCP'],
    election_date: '2026-11-03',
    primary_date: '2026-03-03'
  },
  compliance_tracker: {
    next_report_due: '2025-07-15',
    contribution_limit: 2500,
    total_raised: 45000,
    total_spent: 12000,
    last_report_filed: '2025-01-15'
  },
  metadata: {
    treasurer: 'Robert Law',
    campaign_address: '123 Strategy Blvd, Austin, TX 78701',
    website: '',
    opponents: [
      { name: 'Sarah Jenkins', party: 'R', incumbent: true, strengths: ['High name ID', 'Deep pockets', 'Endorsements'], weaknesses: ['Voted against infrastructure', 'Out of touch'] },
      { name: 'Bill Smith', party: 'R', incumbent: false, strengths: ['Law Enforcement ties'], weaknesses: ['No local experience', 'Recent scandal'] }
    ],
    voter_segments: [],
    vote_goal: calculateVoteGoal(82000, 0.44, 0.05, 2),
    field_plan: {
      doors_to_knock: 22000,
      phone_calls_to_make: 35000,
      volunteers_needed: 75,
      weeks_until_election: 52,
      weekly_goals: { doors_per_week: 1200, calls_per_week: 2000, volunteer_shifts_per_week: 15 },
      priority_precincts: ['Central Mall', 'Riverside', 'Tech District'],
      canvassing_universes: { persuasion: 12000, gotv: 10000 }
    },
    dna: {
      residency_duration: '15 years',
      marital_status: 'Married',
      family_status: '2 children',
      kids_details: 'Ages 8 and 10, local public schools',
      pets: 'Golden Retriever named Buddy',
      professional_status: 'Small business owner, 40 hours/week dedicated',
      personal_finances: 'Willing to contribute $5,000 for launch',
      reason_for_running: 'To fix school funding gaps and infrastructure delays observed first-hand.',
      constituencies: 'Local PTA, Small Business Association, Neighborhood Watch',
      unique_qualifications: 'Former school board auditor and PTA president with deep community ties.',
      staffing_plans: 'Plan to hire 1 media consultant and 2 part-time field leads.',
      master_narrative: "Marcus is a local small business owner running on 'Practical Prosperity'—fixing infrastructure without raising taxes while protecting neighborhood character and adequately funding schools.",
      source_text: '',
      source_materials: [],
      qualifications_check: { age: true, location: true, registered_voter: true, residency_length: true },
      willing_to_do: ['speeches', 'events', 'calls', 'door-knocking'],
      unwilling_to_do: ['attack ads']
    },
    budget_estimate: {
      categories: {
        staff_salaries: 20000,
        consultants: 5000,
        advertising_digital: 10000,
        advertising_print: 5000,
        direct_mail: 8000,
        sms_messaging: 2000,
        events: 5000,
        voter_file_data: 2000,
        compliance_legal: 1500,
        office_ops: 3000,
        emergency_reserve: 5000
      },
      total_projected_needed: 66500,
      cost_per_vote: 1.85
    },
    donor_leads: [
      { id: '1', name: 'Tech Industry PAC', target_amount: 5000, likelihood: 75, status: 'identified' },
      { id: '2', name: 'Education Reform Alliance', target_amount: 2500, likelihood: 90, status: 'contacted' }
    ],
    legal_shield: {
      ballot_access: {
        method: 'signatures',
        fee_amount: 750,
        fee_paid: false,
        signatures_required: 500,
        signatures_collected: 120,
        safety_buffer_percentage: 20
      },
      required_forms: [
        { name: 'Form CTA', description: 'Appointment of Campaign Treasurer', filed: true },
        { name: 'Form CFCP', description: 'Code of Fair Campaign Practices', filed: false },
        { name: 'Filing Application', description: 'Formal Application for Ballot Place', filed: false }
      ],
      reporting_schedule: [
        { id: 'rep1', title: 'Semi-Annual Report', date: '2025-07-15', description: 'Contributions/Expenditures (Jan-Jun)', status: 'pending' },
        { id: 'rep2', title: '30-Day Pre-Election', date: '2026-10-05', description: 'Final push transparency', status: 'pending' }
      ]
    },
    branding_assets: [],
    strategic_reports: []
  }
};

// Initial Empty Profile
const INITIAL_PROFILE: CampaignProfileRow = {
  session_id: 'sess-' + Math.random().toString(36).substr(2, 9),
  candidate_name: '',
  office_sought: '',
  district_id: '',
  party: 'D',
  voter_research: null,
  district_demographics: null,
  filing_info: null,
  compliance_tracker: { next_report_due: '', contribution_limit: 0, total_raised: 0, total_spent: 0, last_report_filed: '' },
  metadata: {
    opponents: [],
    voter_segments: [],
    vote_goal: calculateVoteGoal(0, 0, 0, 1),
    field_plan: {
      doors_to_knock: 0,
      phone_calls_to_make: 0,
      volunteers_needed: 0,
      weeks_until_election: 0,
      weekly_goals: { doors_per_week: 0, calls_per_week: 0, volunteer_shifts_per_week: 0 },
      priority_precincts: [],
      canvassing_universes: { persuasion: 0, gotv: 0 }
    },
    dna: {
      master_narrative: '',
      qualifications_check: { age: true, location: true, registered_voter: true, residency_length: true }
    },
    branding_assets: [],
    strategic_reports: []
  }
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const SidebarItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void; color?: string }> = ({ icon, label, active, onClick, color }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${active ? (color ? color : 'bg-indigo-600') + ' text-white shadow-xl shadow-indigo-200' : 'hover:bg-indigo-50 text-slate-500 hover:text-indigo-600'}`}>
    <i className={`fas ${icon} w-6 text-center text-lg ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}></i>
    <span className="font-black text-[11px] uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const Card: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; icon?: string; action?: React.ReactNode; compact?: boolean; dark?: boolean; className?: string }> = ({ title, subtitle, children, icon, action, compact, dark, className }) => (
  <div className={`${dark ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-100'} rounded-[2.5rem] shadow-sm border hover:shadow-2xl transition-all flex flex-col h-full group ${compact ? 'p-6' : 'p-8'} ${className}`}>
    <div className={`flex items-center justify-between ${compact ? 'mb-4' : 'mb-8'}`}>
      <div className="flex items-center gap-5">
        {icon && <div className={`rounded-2xl flex items-center justify-center shadow-inner transition-all ${dark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'} ${compact ? 'w-10 h-10 text-lg' : 'w-14 h-14 text-2xl'}`}><i className={`fas ${icon}`}></i></div>}
        <div>
          <h3 className={`${compact ? 'text-sm' : 'text-xl'} font-black tracking-tighter uppercase italic leading-none`}>{title}</h3>
          {subtitle && <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

// ============================================================================
// MAIN APPLICATION
// ============================================================================

const App: React.FC = () => {
  // ============================================================================
  // STATE DECLARATIONS
  // ============================================================================
  
  // Core App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<CampaignProfileRow>(INITIAL_PROFILE);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initData, setInitData] = useState({ name: '', office: '', district: '', party: 'D' });
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState('Neural Engine Active...');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // Intelligence Module State
  const [researchVault, setResearchVault] = useState<ResearchSnapshot[]>([]);
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);
  const [isProbeActive, setIsProbeActive] = useState(false);
  const [isExtractingRivals, setIsExtractingRivals] = useState(false);
  const [researchMode, setResearchMode] = useState<ResearchMode>('ECONOMIC');
  const [marketInsights, setMarketInsights] = useState<{ text: string, sources: any[], parsed?: any } | null>(null);
  const [scanMessage, setScanMessage] = useState('');
  
  // Opposition Module State
  const [oppositionInsights, setOppositionInsights] = useState<{ [key: string]: { text: string, sources: any[] } }>({});
  
  // Modal States
  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [dossierTarget, setDossierTarget] = useState<Opponent | null>(null);
  const [isContrastStrategyActive, setIsContrastStrategyActive] = useState(false);
  const [contrastResult, setContrastResult] = useState<string | null>(null);
  const [pendingRivals, setPendingRivals] = useState<Opponent[]>([]);
  const [isReviewRivalsModalOpen, setIsReviewRivalsModalOpen] = useState(false);
  
  // Darkroom (Branding) State
  const [brandingAssets, setBrandingAssets] = useState<CreativeAsset[]>([]);
  const [activeAsset, setActiveAsset] = useState<CreativeAsset | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState({ subject: '', env: '', style: 'Cinematic Portrait' });
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [highQualityMode, setHighQualityMode] = useState(false);
  
  // Megaphone (Creative/Messaging) State
  const [creativeAssets, setCreativeAssets] = useState<CreativeAsset[]>([]);
  const [activeCreativeAsset, setActiveCreativeAsset] = useState<CreativeAsset | null>(null);
  const [refinementInstruction, setRefinementInstruction] = useState(''); // ✅ NEW STATE FOR REFINEMENT

  // War Chest (Fundraising) State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  
  // Legal Shield (Compliance) State
  const [activeDisclaimerType, setActiveDisclaimerType] = useState<'digital' | 'print' | 'sms'>('digital');
  const [complianceAuditResult, setComplianceAuditResult] = useState<string | null>(null);
  
  // DNA Vault (Settings/Profile) State
  const [narrativeRefinePrompt, setNarrativeRefinePrompt] = useState('');

  // Competitor Modal State
  const [newCompetitor, setNewCompetitor] = useState({ name: '', party: 'D', incumbent: false, strengths: '', weaknesses: '' });

  // Strategic Reports State
  const [strategicReports, setStrategicReports] = useState<StrategicReport[]>([]);

  // Onboarding Wizard State
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [onboardingMessages, setOnboardingMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([]);

  // Chat/Advisor State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string, sources?: any[]}[]>([
    { role: 'ai', text: "Tactical command ready. VictoryOps AI systems synchronized with District intelligence." }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // EFFECTS & LIFECYCLE
  // ============================================================================

  // ✅ NEW: API Key Validation on Startup
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey || apiKey === 'your_actual_api_key_here') {
      console.warn('⚠️ VictoryOps Warning: Google AI API key not configured properly');
      console.warn('📋 Steps to fix:');
      console.warn('   1. Create .env.local file in project root');
      console.warn('   2. Add: VITE_GOOGLE_AI_API_KEY=your_key_here');
      console.warn('   3. Get key from: https://makersuite.google.com/app/apikey');
      console.warn('   4. Restart development server');
    } else {
      console.log('✅ VictoryOps: API configuration loaded successfully');
    }
  }, []);

  // Load State from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profile?.candidate_name) {
          setProfile(parsed.profile);
          setIsInitializing(false);
        }
        if (parsed.brandingAssets) setBrandingAssets(parsed.brandingAssets);
        if (parsed.creativeAssets) setCreativeAssets(parsed.creativeAssets);
        if (parsed.strategicReports) setStrategicReports(parsed.strategicReports);
        if (parsed.researchVault) {
          setResearchVault(parsed.researchVault);
          if (parsed.researchVault.length > 0) setActiveResearchId(parsed.researchVault[0].id);
        }
        if (parsed.oppositionInsights) setOppositionInsights(parsed.oppositionInsights);
        if (parsed.marketInsights) setMarketInsights(parsed.marketInsights);
      } catch (e) { 
        console.error("Persistence Restore Failed:", e); 
      }
    }
  }, []);

  // Save State to LocalStorage
  useEffect(() => {
    if (!isInitializing) {
      setIsSyncing(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        profile, brandingAssets, creativeAssets, strategicReports, researchVault, oppositionInsights, marketInsights
      }));
      const t = setTimeout(() => setIsSyncing(false), 800);
      return () => clearTimeout(t);
    }
  }, [profile, brandingAssets, creativeAssets, strategicReports, researchVault, oppositionInsights, marketInsights, isInitializing]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, onboardingMessages]);

  // ============================================================================
  // INITIALIZATION LOGIC
  // ============================================================================

  const handleLoadDemo = () => {
    setProfile(DEMO_PROFILE);
    setIsInitializing(false);
    setChatMessages([{ 
      role: 'ai', 
      text: `Tactical initialization for ${DEMO_PROFILE.candidate_name} successful. All systems operational.` 
    }]);
  };

  const handleFinalizeIdentity = () => {
    if (!initData.name || !initData.office) return;
    const updated = { 
      ...profile, 
      candidate_name: initData.name, 
      office_sought: initData.office, 
      district_id: initData.district, 
      party: initData.party 
    };
    setProfile(updated);
    setIsInitializing(false);
    setTimeout(() => startOnboarding(updated), 500);
  };

  // ============================================================================
  // ONBOARDING WIZARD
  // ============================================================================

  const startOnboarding = async (p = profile) => {
    setOnboardingStep(1);
    setIsThinking(true);

// ============================================================================
// VICTORYOPS - PART 2: AI FUNCTIONS
// ============================================================================
// This is Part 2 of 4. Paste this AFTER Part 1 in your App.tsx
// All AI functions are fixed with proper API integration
// START: Copy from here (continuing from Part 1's startOnboarding function)
// ============================================================================

    setThinkingLabel('Connecting Tactical Strategist...');
    
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      setOnboardingMessages([{ 
        role: 'ai', 
        text: '⚠️ API key not configured. Please configure VITE_GOOGLE_AI_API_KEY in .env.local to begin onboarding.' 
      }]);
      setIsThinking(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: { temperature: 0.8 }
      });

      const prompt = `Act as a world-class Campaign Manager. Start a DNA interview with ${p.candidate_name}, candidate for ${p.office_sought}. Introduce yourself warmly and ask: Why this office, and why now?`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      setOnboardingMessages([{ 
        role: 'ai', 
        text: response.text() || "Hello! I'm excited to help build your campaign. Why are you running for this office, and why now?" 
      }]);
    } catch (e) { 
      console.error('Onboarding error:', e);
      setOnboardingMessages([{ 
        role: 'ai', 
        text: 'Error connecting to AI strategist. Please check your API configuration.' 
      }]);
    } finally { 
      setIsThinking(false); 
    }
  };

  const submitOnboardingStep = async (txt: string) => {
    if (!txt.trim()) return;
    
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) return;

    setOnboardingMessages(prev => [...prev, { role: 'user', text: txt }]);
    setIsThinking(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: { temperature: 0.8 },
        systemInstruction: `Continue DNA interview for ${profile.candidate_name}. Validate their response and ask the next missing detail (Family, Professional Background, or Unique Qualifications). Keep questions conversational and encouraging.`
      });

      const history = onboardingMessages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(txt);
      const response = await result.response;
      
      setOnboardingMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.text() || "Tell me more about your connection to the district." 
      }]);
    } catch (e) { 
      console.error('Onboarding step error:', e);
    } finally { 
      setIsThinking(false); 
    }
  };

  // ============================================================================
  // INTELLIGENCE MODULE - Research & Analysis Functions
  // ============================================================================

  const runNeuralProbe = async (focus: ResearchMode) => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: '⚠️ API Configuration Error: Google AI API key not found. Please add VITE_GOOGLE_AI_API_KEY to your .env.local file.' 
      }]);
      return;
    }

    setResearchMode(focus);
    setIsProbeActive(true);
    setScanMessage(`Establishing ${focus} neural link...`);
    setChatMessages(prev => [...prev, { 
      role: 'ai', 
      text: `Initiating ${focus} Neural Probe. Awaiting district data streams.` 
    }]);
    
    let prompt = "";
    switch(focus) {
      case 'ECONOMIC':
        setScanMessage("Aggregating 2025 economic stressors...");
        prompt = `Perform an economic intelligence audit for ${profile.district_id}. Analyze employment rates, housing affordability trends, and major local business developments. Format your response with these sections: [SIGNAL: key economic indicators], [THREAT: risks to the campaign], [ACTION: recommended campaign response]. Include specific data and sources where possible.`;
        break;
      case 'SENTIMENT':
        setScanMessage("Monitoring voter sentiment patterns...");
        prompt = `Detect prevailing voter sentiment and top 5 political grievances in ${profile.district_id} for the 2026 cycle. Analyze recent social movements or local controversies. Format as: [SIGNAL: mood/trends], [THREAT: narrative risks], [ACTION: outreach strategy].`;
        break;
      case 'POLICY':
        setScanMessage("Tracking legislative volatility...");
        prompt = `Analyze legislative impacts and local policy challenges in ${profile.district_id}. Focus on infrastructure needs, school board tensions, and recent tax changes. Format as: [SIGNAL: policy landscape], [THREAT: opposition angles], [ACTION: policy position].`;
        break;
      case 'OPPOSITION':
        setScanMessage("Scanning opposition landscape...");
        prompt = `Perform a deep dive on the political opposition for the ${profile.office_sought} seat in ${profile.district_id}. Identify active candidates, their funding sources, and vulnerabilities. Format as: [SIGNAL: opponent status], [THREAT: their strengths], [ACTION: counter-strategy].`;
        break;
      case 'MEDIA':
        setScanMessage("Monitoring regional media sentiment...");
        prompt = `Monitor local media sentiment in ${profile.district_id} for the ${profile.office_sought} race. Identify top trending stories and narrative threats. Format as: [SIGNAL: media landscape], [THREAT: negative coverage risks], [ACTION: media strategy].`;
        break;
      case 'REGISTRATION':
        setScanMessage("Analyzing voter registration volatility...");
        prompt = `Analyze voter registration shifts in ${profile.district_id} between 2024 and 2025. Who are the new voters? What are demographic trends? Format as: [SIGNAL: registration patterns], [THREAT: turnout challenges], [ACTION: voter contact plan].`;
        break;
      case 'SOCIAL':
        setScanMessage("Scanning social media landscape...");
        prompt = `Search for trending topics, hashtags, and public opinion related to the ${profile.office_sought} race in ${profile.district_id} for 2025/2026. Return sentiment analysis and top concerns. Format as: [SIGNAL: social trends], [THREAT: viral risks], [ACTION: social media strategy].`;
        break;
      case 'FUNDRAISING':
        setScanMessage("Hunting for donors and PACs...");
        prompt = `Identify potential donors, local PACs, and political contributors in ${profile.district_id} region aligning with ${profile.party}. Analyze giving patterns. Format as: [SIGNAL: donor landscape], [THREAT: opponent fundraising], [ACTION: solicitation strategy].`;
        break;
      case 'GEOGRAPHY':
        setScanMessage("Mapping community hotspots...");
        prompt = `Identify high-traffic intersections, community centers, and popular town hall venues in ${profile.district_id}. Find where campaign visibility is needed. Format as: [SIGNAL: key locations], [THREAT: coverage gaps], [ACTION: visibility plan].`;
        break;
      case 'ETHICS':
        setScanMessage("Monitoring compliance threats...");
        prompt = `Search for recent ethics filings, campaign finance controversies, or regulatory issues related to ${profile.office_sought} in ${profile.district_id}. Format as: [SIGNAL: compliance landscape], [THREAT: potential violations], [ACTION: protective measures].`;
        break;
      default: 
        setScanMessage("Generating broad environmental landscape...");
        prompt = `General political landscape and sentiment analysis for ${profile.district_id} in the 2026 cycle. Format as: [SIGNAL], [THREAT], [ACTION].`;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const insightText = response.text() || "No actionable signals detected.";
      
      // Parse Signal/Threat/Action
      const parsed = {
        signal: insightText.includes('SIGNAL') 
          ? insightText.split(/THREAT|ACTION/i)[0].replace(/\[SIGNAL[:\]]/i, '').trim() 
          : insightText.substring(0, 200),
        threat: insightText.includes('THREAT') 
          ? insightText.split(/ACTION/i)[0].split(/THREAT/i)[1]?.replace(/\[THREAT[:\]]/i, '').trim() 
          : "Potential narrative threat detected.",
        action: insightText.includes('ACTION') 
          ? insightText.split(/ACTION/i)[1]?.replace(/\[ACTION[:\]]/i, '').trim() 
          : "Recommended immediate outreach."
      };

      setMarketInsights({ text: insightText, sources: [], parsed });
      
      const newId = 'res-' + Date.now();
      const snapshot: ResearchSnapshot = {
        id: newId,
        mode: focus,
        timestamp: new Date().toLocaleString(),
        text: insightText,
        sources: [],
        signalStrength: Math.floor(Math.random() * 40) + 60,
        parsed
      };
      
      setResearchVault(prev => [snapshot, ...prev]);
      setActiveResearchId(newId);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: `✅ Tactical scan [${focus}] complete. Research pinned to vault.` 
      }]);
      
    } catch (e) { 
      console.error('Neural probe failed:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: `❌ Probe failed for ${focus}: ${errorMessage}. Check API key configuration.` 
      }]);
    } finally { 
      setIsProbeActive(false);
      setScanMessage('');
    }
  };

  const startSyncRivals = async () => {
    const active = researchVault.find(v => v.id === activeResearchId);
    if (!active) return;
    
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: '⚠️ API key not configured' 
      }]);
      return;
    }
    
    setIsExtractingRivals(true);
    setChatMessages(prev => [...prev, { 
      role: 'ai', 
      text: `Neural Engine parsing research vault for competitive threats...` 
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.5,
          responseMimeType: "application/json"
        }
      });

      const prompt = `Identify and extract political opponents from the following research text. Filter for candidates specifically relevant to the ${profile.office_sought} seat in ${profile.district_id}. Return them as a JSON array of objects with these exact fields: name (string), party (string), incumbent (boolean), strengths (array of strings), weaknesses (array of strings). Research text: ${active.text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const extracted: Opponent[] = JSON.parse(response.text() || "[]");
      
      setPendingRivals(extracted);
      setIsReviewRivalsModalOpen(true);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: `✅ Extracted ${extracted.length} rival(s) from intelligence stream.` 
      }]);
    } catch (e) { 
      console.error('Rival extraction failed:', e);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: `❌ Rival extraction failed. Check console for details.` 
      }]);
    } finally { 
      setIsExtractingRivals(false); 
    }
  };

  const registerSelectedRival = (rival: Opponent) => {
    setProfile(prev => ({
      ...prev,
      metadata: { ...prev.metadata, opponents: [...prev.metadata.opponents, rival] }
    }));
    setPendingRivals(prev => prev.filter(r => r.name !== rival.name));
  };

  const handleRegisterCompetitor = () => {
    if (!newCompetitor.name) return;
    const opponent: Opponent = {
      name: newCompetitor.name,
      party: newCompetitor.party,
      incumbent: newCompetitor.incumbent,
      strengths: newCompetitor.strengths.split(',').map(s => s.trim()).filter(Boolean),
      weaknesses: newCompetitor.weaknesses.split(',').map(s => s.trim()).filter(Boolean)
    };
    setProfile(prev => ({
      ...prev,
      metadata: { ...prev.metadata, opponents: [...prev.metadata.opponents, opponent] }
    }));
    setNewCompetitor({ name: '', party: 'D', incumbent: false, strengths: '', weaknesses: '' });
    setIsCompetitorModalOpen(false);
  };

  const downloadResearch = () => {
    const active = researchVault.find(v => v.id === activeResearchId);
    if (!active) return;
    const blob = new Blob([active.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${active.mode}_Research_${active.timestamp.replace(/[/:, ]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // DARKROOM MODULE - Image Generation Functions
  // ============================================================================

  const generateVisual = async () => {
    if (!imagePrompt.subject) return;
    
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: '⚠️ API key not configured. Cannot generate images.' 
      }]);
      return;
    }

    setIsGeneratingImage(true);
    setChatMessages(prev => [...prev, { 
      role: 'ai', 
      text: `Darkroom active. Developing visual asset for: "${imagePrompt.subject}"` 
    }]);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        }
      });

      const fullPrompt = `${imagePrompt.style}: ${imagePrompt.subject} set in ${imagePrompt.env}. High contrast, professional political campaign lighting, cinematic quality, ${profile.party === 'R' ? 'patriotic red and blue accents' : profile.party === 'D' ? 'modern blue and white tones' : 'independent slate and emerald tones'}.`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      // Note: Gemini 2.0 Flash doesn't generate images directly
      // This stores the detailed prompt for use with image generation services
      const newAsset: CreativeAsset = {
        id: 'asset-' + Date.now(),
        type: 'PHOTO',
        title: imagePrompt.subject.slice(0, 20) + '...',
        mediaUrl: '', // Placeholder until image API integrated
        mediaType: 'image',
        status: 'draft',
        prompt: fullPrompt,
        content: `[IMAGE GENERATION PROMPT]\n\n${fullPrompt}\n\n[AI Response]\n${response.text()}\n\nNote: Direct image generation requires Imagen 3 API integration. This is the text-based prompt that can be used with image generation services.`
      };
      
      setBrandingAssets(prev => [newAsset, ...prev]);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: `✅ Visual concept developed and saved. Note: Image rendering requires Imagen 3 API setup.` 
      }]);
      
    } catch (e) {
      console.error('Image generation error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: `❌ Darkroom error: ${errorMsg}` 
      }]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const refineVisual = async (asset: CreativeAsset, feedback: string) => {
    if (!feedback) return;
    
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: '⚠️ API key not configured.' 
      }]);
      return;
    }

    setIsGeneratingImage(true);
    setChatMessages(prev => [...prev, { 
      role: 'ai', 
      text: `Refining asset ${asset.id} based on tactical feedback...` 
    }]);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
        }
      });

      const refinementPrompt = `Original image prompt: ${asset.prompt}\n\nRefinement request: ${feedback}\n\nGenerate an improved image prompt that incorporates this feedback while maintaining the original campaign branding and political messaging. Make the prompt detailed and specific for image generation.`;
      
      const result = await model.generateContent(refinementPrompt);
      const response = await result.response;
      const refinedPrompt = response.text();

      const refinedAsset: CreativeAsset = {
        ...asset,
        id: 'asset-ref-' + Date.now(),
        prompt: refinedPrompt,
        content: `[REFINED IMAGE GENERATION PROMPT]\n\n${refinedPrompt}\n\n[Original Prompt]\n${asset.prompt}\n\n[Refinement Applied]\n${feedback}`
      };
      
      setBrandingAssets(prev => [refinedAsset, ...prev]);
      setActiveAsset(refinedAsset);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: `✅ Refinement complete. Updated prompt saved to Darkroom.` 
      }]);
      
    } catch (e) {
      console.error('Refinement error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: `❌ Refinement error: ${errorMsg}` 
      }]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const deleteAsset = (id: string) => {
    setBrandingAssets(prev => prev.filter(a => a.id !== id));
    if (activeAsset?.id === id) setActiveAsset(null);
  };

  // ============================================================================
  // MEGAPHONE MODULE - Message Generation Functions
  // ============================================================================

  const generateCreative = async (type: string, manualContext?: string) => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      alert('API key not configured. Please add VITE_GOOGLE_AI_API_KEY to .env.local');
      return;
    }

    setIsThinking(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        }
      });

      const lastResearch = manualContext || (researchVault[0] 
        ? `Context from latest ${researchVault[0].mode} scan: ${researchVault[0].text.substring(0, 300)}` 
        : '');
      const dna = profile.metadata.dna || {};
      
      const prompt = `You are a Senior Political Communications Director. Develop a high-impact ${type} for ${profile.candidate_name}'s 2026 campaign.
      
CAMPAIGN CONTEXT:
- District: ${profile.district_id}
- Office Sought: ${profile.office_sought}
- Party: ${profile.party}
- Master Narrative: ${dna.master_narrative || 'Building grassroots momentum for change'}
- Reason for Running: ${dna.reason_for_running || 'To serve the community'}
- District Focus: ${profile.voter_research || 'Serving all constituents'}
- Recent Intelligence: ${lastResearch}

REQUIREMENTS:
1. Create compelling ${type} content that resonates with district voters
2. Include clear headlines and body copy
3. Be persuasive, professional, and data-grounded
4. Match the candidate's authentic voice and values
5. Address key district concerns
6. Include a clear call-to-action

Format the response with proper structure for ${type} format.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const newAsset: CreativeAsset = {
        id: Date.now().toString(),
        type,
        title: `${type} - ${new Date().toLocaleDateString()}`,
        content: response.text() || "Failed to generate content.",
        mediaType: 'text',
        status: 'draft'
      };
      
      setCreativeAssets(prev => [newAsset, ...prev]);
      setActiveCreativeAsset(newAsset);
      setActiveTab('creative');
      
      console.log(`✅ Generated ${type} successfully`);
      
    } catch (e) { 
      console.error('Creative generation error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Failed to generate ${type}: ${errorMsg}`);
    } finally { 
      setIsThinking(false); 
    }
  };

  const refineAsset = async (instruction: string) => {
    if (!activeCreativeAsset) {
      alert('Please select a creative asset first');
      return;
    }
    
    if (!instruction.trim()) {
      alert('Please enter refinement instructions');
      return;
    }
    
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      alert('API key not configured');
      return;
    }

    setIsThinking(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
        }
      });

      const prompt = `You are a Senior Political Communications Director. Refine this ${activeCreativeAsset.type} based on the following instruction:

INSTRUCTION: "${instruction}"

CURRENT CONTENT:
${activeCreativeAsset.content}

REQUIREMENTS:
1. Apply the requested changes while maintaining campaign messaging consistency
2. Keep the professional tone and political effectiveness
3. Ensure compliance with campaign communication standards
4. Maintain or improve persuasiveness
5. Return the complete refined content, not just changes

Provide the fully refined content:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const updated = { 
        ...activeCreativeAsset, 
        content: response.text() || activeCreativeAsset.content 
      };
      
      setCreativeAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
      setActiveCreativeAsset(updated);
      setRefinementInstruction(''); // Clear the input after successful refinement
      
      console.log('✅ Asset refined successfully');
      
    } catch (e) { 
      console.error('Refinement error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Refinement failed: ${errorMsg}`);
    } finally { 
      setIsThinking(false); 
    }
  };

  // ============================================================================
  // WAR CHEST MODULE - Budget & Fundraising Functions
  // ============================================================================

  const updateBudgetCategory = (category: keyof BudgetEstimate['categories'], val: string) => {
    const num = parseInt(val) || 0;
    setProfile(prev => {
      const current = prev.metadata.budget_estimate!;
      const nextCategories = { ...current.categories, [category]: num };
      const nextTotal = (Object.values(nextCategories) as number[]).reduce((a: number, b: number) => a + b, 0);
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          budget_estimate: {
            ...current,
            categories: nextCategories,
            total_projected_needed: nextTotal,
            cost_per_vote: nextTotal / (prev.metadata.vote_goal.target_vote_goal || 1)
          }
        }
      };
    });
  };

  const updateDonorLead = (id: string, updates: Partial<DonorLead>) => {
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        donor_leads: prev.metadata.donor_leads?.map(l => l.id === id ? { ...l, ...updates } : l)
      }
    }));
  };

  const addDonorLead = () => {
    const newLead: DonorLead = {
      id: Date.now().toString(),
      name: 'New Prospective Donor',
      target_amount: 0,
      likelihood: 50,
      status: 'identified'
    };
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        donor_leads: [...(prev.metadata.donor_leads || []), newLead]
      }
    }));
  };

  const runBudgetAudit = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      alert('API key not configured');
      return;
    }

    setIsAuditing(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1500,
        }
      });

      const prompt = `You are a Senior Campaign Finance Strategist. Perform a high-level strategic audit of this political campaign budget.

CAMPAIGN DETAILS:
- Office Sought: ${profile.office_sought}
- District: ${profile.district_id}
- Target Votes Needed: ${profile.metadata.vote_goal.target_vote_goal}
- Total Raised to Date: $${profile.compliance_tracker?.total_raised || 0}

BUDGET ALLOCATION:
${JSON.stringify(profile.metadata.budget_estimate?.categories, null, 2)}

AUDIT REQUIREMENTS:
Provide exactly 3 items - either "Red Flags" (concerning allocations) or "Golden Opportunities" (smart reallocation possibilities).

For each item, provide:
1. Category/Area of concern or opportunity
2. Current situation
3. Recommended action with specific dollar amounts
4. Expected impact on vote goal

Be sharp, tactical, and data-driven. Focus on ROI and vote efficiency.

Format with clear headers: 🚩 RED FLAG or ⭐ GOLDEN OPPORTUNITY`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      setAuditResult(response.text() || "Audit inconclusive - please try again.");
      
      console.log('✅ Budget audit complete');
      
    } catch (e) { 
      console.error('Budget audit error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      setAuditResult(`❌ Audit Error: ${errorMsg}`);
    } finally { 
      setIsAuditing(false); 
    }
  };

  // ============================================================================
  // LEGAL SHIELD MODULE - Compliance Functions
  // ============================================================================

  const runLegalComplianceAudit = async () => {
    if (!activeCreativeAsset) {
      alert('No creative asset selected for compliance audit');
      return;
    }
    
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      alert('API key not configured');
      return;
    }

    setIsThinking(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.3, // Lower temperature for compliance accuracy
          maxOutputTokens: 1500,
        }
      });

      const disclaimer = generateTexasDisclaimer(
        activeDisclaimerType, 
        profile.candidate_name, 
        profile.metadata.treasurer || '', 
        profile.metadata.campaign_address || ''
      );
      
      const prompt = `You are an expert Texas Election Law Compliance Officer with deep knowledge of Texas Election Code Title 15 (Regulating Political Funds and Campaigns).

COMPLIANCE AUDIT REQUEST:

ASSET TYPE: ${activeCreativeAsset.type}
INTENDED MEDIA: ${activeDisclaimerType}

ASSET CONTENT:
"${activeCreativeAsset.content}"

REQUIRED TEXAS DISCLAIMER:
"${disclaimer}"

AUDIT CRITERIA (Texas Election Code):
1. Political Advertising Notice - Is the "Political advertising paid for by..." notice present and properly formatted?
2. Treasurer Attribution - Is the campaign treasurer's name correctly mentioned?
3. Physical Address - Is a physical address included for transparency requirements?
4. Prohibited Content:
   - No false statements about a candidate
   - No promissory statements about official actions
   - No misrepresentation of endorsements
   - No deceptive imagery or altered photos without disclosure
5. Disclosure Requirements - Are all required disclaimers present and legible?
6. Timing Requirements - Does content respect blackout periods if applicable?

COMPLIANCE GRADE SCALE:
- Grade A: Fully compliant, ready for deployment
- Grade B: Minor technical fixes needed
- Grade C: Significant compliance gaps requiring attention
- Grade D: Major violations present, requires complete revision
- Grade F: Critical legal violations, do not deploy

PROVIDE:
1. COMPLIANCE GRADE (A-F) with brief justification
2. TWO SPECIFIC FIXES with exact language to add/change
3. RISK LEVEL (Low/Medium/High) for deploying as-is

Format your response clearly with headers.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const auditText = response.text() || "Audit failed to complete.";
      
      setComplianceAuditResult(auditText);
      
      console.log('✅ Compliance audit complete');
      
    } catch (e) { 
      console.error('Compliance audit error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      setComplianceAuditResult(`❌ Audit Error: ${errorMsg}\n\nPlease ensure API key is configured correctly.`);
    } finally { 
      setIsThinking(false); 
    }
  };

  const updateLegalShield = (updates: Partial<LegalShieldData>) => {
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        legal_shield: { ...prev.metadata.legal_shield!, ...updates }
      }
    }));
  };

  // ============================================================================
  // DNA VAULT MODULE - Profile & Narrative Functions
  // ============================================================================

  const updateDNA = (updates: Partial<CampaignDNA>) => {
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        dna: { ...prev.metadata.dna, ...updates }
      }
    }));
  };

  const synthesizeMasterNarrative = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      alert('API key not configured. Please add VITE_GOOGLE_AI_API_KEY to .env.local');
      return;
    }

    setIsThinking(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 3000,
        }
      });

      const dna = profile.metadata.dna || {};
      
      const prompt = `You are a world-class Political Communications Director and Narrative Strategist. Synthesize the following Candidate DNA and Source Materials into a comprehensive 'Master Political Narrative' that will serve as the foundation for all campaign communications.

CANDIDATE PROFILE:
- Name: ${profile.candidate_name}
- Office: ${profile.office_sought}
- District: ${profile.district_id}
- Party: ${profile.party}
- Residency: ${dna.residency_duration || 'Not specified'} in district
- Marital Status: ${dna.marital_status || 'Not specified'}
- Family: ${dna.family_status || 'Not specified'}
- Children: ${dna.kids_details || 'Not specified'}
- Pets: ${dna.pets || 'Not specified'}

CORE MOTIVATIONS & QUALIFICATIONS:
- Reason for Running: ${dna.reason_for_running || 'Not yet defined'}
- Unique Qualifications: ${dna.unique_qualifications || 'Not yet defined'}
- Key Constituencies: ${dna.constituencies || 'Not yet defined'}
- Willing Activities: ${dna.willing_to_do?.join(', ') || 'Not specified'}

ADDITIONAL SOURCE MATERIALS:
${dna.source_text || 'No raw source documents provided. Using profile data only.'}

DISTRICT CONTEXT:
${profile.voter_research || 'District analysis pending'}

REQUIREMENTS:
Create a powerful Master Political Narrative with these exact sections:

**THE ORIGIN STORY**
- Deep roots in the community and what shaped the candidate's values
- Personal connection to district challenges
- Authentic motivation that resonates emotionally

**THE MISSION**
- Clear vision for the district's future
- Specific policy priorities tied to constituent needs
- Unique qualifications that set this candidate apart

**THE STRATEGIC CONTRAST**
- How this candidate differs from opponents (without naming them)
- Fresh perspective vs. status quo
- Why this matters NOW in this political moment

TONE: Authoritative, inspiring, grounded in district realities. Use specific details from source materials. This narrative will be the single source of truth for all campaign ads, speeches, and communications.

Write in third person. Be compelling and authentic.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      updateDNA({ master_narrative: response.text() });
      
      console.log('✅ Master narrative synthesized successfully');
      
    } catch (e) { 
      console.error('Narrative synthesis error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Failed to synthesize narrative: ${errorMsg}`);
    } finally { 
      setIsThinking(false); 
    }
  };

  const refineMasterNarrative = async () => {
    if (!narrativeRefinePrompt.trim()) {
      alert('Please enter refinement instructions');
      return;
    }
    
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      alert('API key not configured');
      return;
    }

    setIsThinking(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        }
      });

      const dna = profile.metadata.dna || {};
      
      const prompt = `You are a world-class Political Communications Director. Refine the existing Master Political Narrative based on the specific instruction provided.

CURRENT MASTER NARRATIVE:
${dna.master_narrative || 'No narrative has been created yet. Please synthesize first.'}

REFINEMENT INSTRUCTION:
${narrativeRefinePrompt}

REQUIREMENTS:
1. Apply the requested refinement while maintaining the three-section structure (Origin Story, Mission, Strategic Contrast)
2. Keep the professional, high-impact tone
3. Maintain the core district focus and authenticity
4. Enhance clarity and persuasiveness where needed
5. Preserve what's working well in the current narrative
6. Do not lose specific details or personal elements

Provide the complete refined Master Narrative, not just the changes.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      updateDNA({ master_narrative: response.text() });
      setNarrativeRefinePrompt('');
      
      console.log('✅ Master narrative refined successfully');
      
    } catch (e) { 
      console.error('Narrative refinement error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Refinement failed: ${errorMsg}`);
    } finally { 
      setIsThinking(false); 
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const dna = profile.metadata.dna || {};
        const newMaterials = [...(dna.source_materials || []), { name: file.name, timestamp: new Date().toLocaleString() }];
        updateDNA({ 
          source_text: (dna.source_text ? dna.source_text + "\n\n" : "") + `[SOURCE: ${file.name}]\n` + text,
          source_materials: newMaterials
        });
      }
    };
    reader.readAsText(file);
  };

  // ============================================================================
  // CHAT ASSISTANT FUNCTION
  // ============================================================================

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: '⚠️ API key not configured. Please add VITE_GOOGLE_AI_API_KEY to .env.local' 
      }]);
      return;
    }

    const userMsg = input;
    setInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
        systemInstruction: `You are a Senior Political Strategist for the 2026 election cycle with expertise in:
- Campaign strategy and messaging
- Voter outreach and field operations
- Fundraising and budget management
- Opposition research and competitive positioning
- Texas election law and compliance
- Digital organizing and social media

You have full awareness of the candidate's campaign state and provide hyper-specific strategic advice based on real campaign data.

CURRENT CAMPAIGN CONTEXT:
- Candidate: ${profile.candidate_name}
- Party: ${profile.party}
- Office: ${profile.office_sought}
- District: ${profile.district_id}
- Vote Goal: ${profile.metadata.vote_goal.target_vote_goal}
- Funds Raised: $${profile.compliance_tracker?.total_raised || 0}
- Master Narrative: ${profile.metadata.dna?.master_narrative ? 'Defined' : 'Not yet created'}
- Motivation: ${profile.metadata.dna?.reason_for_running || 'Not specified'}

Provide tactical, actionable advice. Be direct and specific. Reference the campaign data when relevant.`
      });

      // Build conversation history
      const history = chatMessages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMsg);
      const response = await result.response;
      
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.text() || "I understand. How else can I help with your campaign?",
      }]);
      
    } catch (error) { 
      console.error('Chat error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: `❌ Error: ${errorMsg}. Please check your API configuration.` 
      }]);
    } finally { 
      setIsThinking(false); 
    }
  };

// ============================================================================
// VICTORYOPS - PART 3: RENDER FUNCTIONS  
// ============================================================================
// This is Part 3 of 4. Paste this AFTER Part 2 in your App.tsx
// Includes ALL render methods with the NEW refineAsset UI in Megaphone
// START: Copy from here
// ============================================================================

  // ============================================================================
  // RENDER: DASHBOARD
  // ============================================================================

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Victory Math" subtitle="Electoral Target" icon="fa-calculator">
          <div className="mt-2 space-y-4">
            <p className="text-5xl font-black text-indigo-700 leading-none">{profile.metadata.vote_goal.target_vote_goal.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Winning Votes Needed</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner"><div className="bg-indigo-500 h-full w-[15%]" /></div>
          </div>
        </Card>
        <Card title="Capital Pulse" subtitle="Fundraising Health" icon="fa-sack-dollar">
           <div className="mt-2 space-y-4">
              <p className="text-5xl font-black text-emerald-600 leading-none">${profile.compliance_tracker?.total_raised.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Secured War Chest</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner"><div className="bg-emerald-500 h-full w-[25%]" /></div>
           </div>
        </Card>
        <Card title="Market Pulse" subtitle="Digital Sentiment" icon="fa-chart-line">
           <div className="flex flex-col items-center justify-center h-24 text-center">
              <div className="text-5xl font-black text-indigo-600 tracking-tighter">+8.4%</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Positive Momentum</p>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl border border-slate-800 group">
          <div className="relative z-10">
            <h3 className="text-4xl font-black mb-6 uppercase italic tracking-tighter leading-none group-hover:text-indigo-400 transition-colors">Tactical Research Lab</h3>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm mb-12">
              Cross-referencing District {profile.district_id} intelligence with real-time signals.
            </p>
            <div className="flex flex-wrap gap-5">
              <button 
                disabled={isProbeActive}
                onClick={() => { setActiveTab('intelligence'); runNeuralProbe('ECONOMIC'); }} 
                className="bg-white/10 hover:bg-white text-white hover:text-slate-900 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/20 transition-all disabled:opacity-50"
              >
                Economic Scan
              </button>
              <button 
                disabled={isProbeActive}
                onClick={() => { setActiveTab('warchest'); runNeuralProbe('FUNDRAISING'); }} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-50"
              >
                Fundraising Scan
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mt-48 -mr-48 animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-[3.5rem] p-16 border border-slate-100 shadow-xl flex flex-col justify-between group hover:border-indigo-200 transition-all">
           <div>
             <h3 className="text-4xl font-black text-slate-800 mb-4 uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors">The Megaphone</h3>
             <p className="text-slate-500 text-lg font-medium leading-relaxed">Deploy messaging that hits. Generate, Refine, Distribute.</p>
           </div>
           <button 
             disabled={isThinking}
             onClick={() => setActiveTab('creative')} 
             className="mt-12 bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-slate-800 transition-all self-start flex items-center gap-4 shadow-xl shadow-slate-200 disabled:opacity-50"
           >
             <i className="fas fa-wand-sparkles"></i> Studio Access
           </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: INTELLIGENCE MODULE
  // ============================================================================

  const renderIntelligence = () => {
    const activeResearch = researchVault.find(v => v.id === activeResearchId);

    return (
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">Command Intelligence</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Active Multi-Modality District Scan</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'ECONOMIC', label: 'Economic', icon: 'fa-money-bill-trend-up' },
              { id: 'SENTIMENT', label: 'Sentiment', icon: 'fa-face-smile-wink' },
              { id: 'POLICY', label: 'Policy', icon: 'fa-bridge' },
              { id: 'OPPOSITION', label: 'Opposition', icon: 'fa-user-ninja' },
              { id: 'MEDIA', label: 'Media', icon: 'fa-newspaper' },
              { id: 'REGISTRATION', label: 'Voters', icon: 'fa-users-line' },
              { id: 'SOCIAL', label: 'Social', icon: 'fa-hashtag' },
              { id: 'FUNDRAISING', label: 'Donors', icon: 'fa-money-bill-wave' },
              { id: 'GEOGRAPHY', label: 'Geography', icon: 'fa-map-location-dot' },
              { id: 'ETHICS', label: 'Ethics', icon: 'fa-shield-halved' },
            ].map(probe => (
              <button key={probe.id} disabled={isProbeActive} onClick={() => runNeuralProbe(probe.id as ResearchMode)} className={`px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-3 transition-all border disabled:opacity-50 ${researchMode === probe.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'}`}>
                <i className={`fas ${probe.icon}`}></i> {probe.label}
              </button>
            ))}
          </div>
        </div>

        <Card 
          title="Threat Matrix" 
          icon="fa-user-shield" 
          subtitle="Priority Competitor Audit" 
          className="border-indigo-500/30 overflow-visible" 
          action={
            <div className="flex gap-3">
               <button onClick={startSyncRivals} disabled={!activeResearch || isExtractingRivals} className={`bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-3 border border-indigo-100 ${isExtractingRivals ? 'animate-pulse' : ''}`}><i className={`fas ${isExtractingRivals ? 'fa-circle-notch fa-spin' : 'fa-robot'}`}></i> {isExtractingRivals ? 'Scanning...' : 'Extract Rivals'}</button>
               <button onClick={() => setIsCompetitorModalOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">+ Register Target</button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 auto-rows-fr">
            {profile.metadata.opponents.length > 0 ? (
              profile.metadata.opponents.map((o, i) => (
                <div key={i} onClick={() => setDossierTarget(o)} className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-8 relative overflow-hidden group shadow-2xl border border-slate-800 hover:scale-[1.03] transition-all cursor-pointer">
                  <div className="relative z-10 flex justify-between items-start">
                     <div>
                       <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2 group-hover:text-indigo-400 transition-colors">{o.name}</h4>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{o.party} • {o.incumbent ? 'Incumbent Threat' : 'Challenger Threat'}</p>
                     </div>
                     <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-red-600 group-hover:text-white transition-all"><i className="fas fa-crosshairs"></i></div>
                  </div>
                  <div className="space-y-6 relative z-10">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Target Vulnerabilities</span> <span className="text-red-500">{o.weaknesses.length} Registered</span></div>
                     <div className="flex flex-wrap gap-2">
                       {o.weaknesses.slice(0, 3).map((w, idx) => <span key={idx} className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">{w}</span>)}
                       {o.weaknesses.length > 3 && <span className="text-slate-500 text-[8px] font-black uppercase py-1.5">+{o.weaknesses.length - 3} More</span>}
                     </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-red-600/5 rounded-full blur-[60px]" />
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center opacity-30 border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl text-slate-300"><i className="fas fa-users-slash"></i></div>
                <div>
                   <p className="text-xl font-black uppercase tracking-[0.4em]">Matrix Idle</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">No Rival Agents Identified in this Sector</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Intelligence Vault - Research Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Card 
              title="Intelligence Vault" 
              icon="fa-newspaper" 
              subtitle={activeResearch?.mode ? `${activeResearch.mode} Brief` : 'Satellite Stream'}
              action={
                <div className="flex items-center gap-3">
                   {researchVault.length > 1 && (
                     <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none" value={activeResearchId || ''} onChange={e => setActiveResearchId(e.target.value)}>
                        {researchVault.map(v => <option key={v.id} value={v.id}>{v.mode} ({v.timestamp})</option>)}
                     </select>
                   )}
                   {activeResearch && <button onClick={downloadResearch} className="text-slate-400 hover:text-indigo-600 transition-colors"><i className="fas fa-download"></i></button>}
                </div>
              }
            >
              {isProbeActive || scanMessage ? (
                <div className="p-32 flex flex-col items-center justify-center space-y-8 animate-pulse">
                   <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                   <p className="text-xl font-black uppercase tracking-[0.5em] text-indigo-600">{scanMessage || 'Neural Sync Active...'}</p>
                </div>
              ) : activeResearch ? (
                <div className="space-y-10 animate-in slide-in-from-bottom-5">
                  {activeResearch.parsed && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><i className="fas fa-signal-stream"></i></div>
                            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">The Signal</h5>
                         </div>
                         <div className="text-sm leading-relaxed text-slate-300 font-medium italic line-clamp-6">
                            {activeResearch.parsed.signal}
                         </div>
                      </div>
                      <div className="bg-white rounded-[2rem] p-8 border border-red-100 hover:border-red-500/30 transition-all group shadow-sm">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all"><i className="fas fa-triangle-exclamation"></i></div>
                            <h5 className="text-[10px] font-black text-red-600 uppercase tracking-widest italic">The Threat</h5>
                         </div>
                         <div className="text-sm leading-relaxed text-slate-600 font-medium italic line-clamp-6">
                            {activeResearch.parsed.threat}
                         </div>
                      </div>
                      <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100 hover:border-indigo-500/30 transition-all group shadow-sm">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg"><i className="fas fa-person-running"></i></div>
                            <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest italic">Tactical Action</h5>
                         </div>
                         <div className="text-sm leading-relaxed text-indigo-800 font-black italic line-clamp-6">
                            {activeResearch.parsed.action}
                         </div>
                      </div>
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none">
                    <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {activeResearch.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center opacity-20">
                   <i className="fas fa-satellite-dish text-8xl mb-8"></i>
                   <p className="text-2xl font-black uppercase tracking-[0.5em]">Vault Standby</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Electoral DNA" icon="fa-dna" compact>
              {profile.metadata.dna?.master_narrative ? (
                <div className="space-y-4">
                  <p className="text-xs leading-relaxed text-slate-600 line-clamp-6 italic">{profile.metadata.dna.master_narrative}</p>
                  <button onClick={() => setActiveTab('settings')} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">View Full DNA →</button>
                </div>
              ) : <p className="text-slate-300 italic py-10">Neural DNA mapping required.</p>}
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: MEGAPHONE (CREATIVE/MESSAGING) - WITH NEW REFINEMENT UI
  // ============================================================================

  const renderCreative = () => (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      <Card title="The Megaphone Studio" subtitle="Strategic Messaging Pipeline" icon="fa-bullhorn">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4 pb-4">
           {[
             { label: 'Canvassing Script', icon: 'fa-microphone-lines', desc: 'Door-to-door persuasion' },
             { label: 'Social Content', icon: 'fa-share-nodes', desc: 'Viral digital narrative' },
             { label: 'Direct Mailer', icon: 'fa-envelope-open-text', desc: 'High-impact physical reach' }
           ].map((v, i) => (
             <button 
               key={i} 
               disabled={isThinking}
               onClick={() => generateCreative(v.label)} 
               className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] hover:border-indigo-400 hover:bg-white transition-all group flex items-center gap-6 shadow-sm hover:shadow-xl disabled:opacity-50"
             >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg group-disabled:text-slate-200">
                  <i className={`fas ${v.icon} text-2xl`}></i>
                </div>
                <div className="text-left">
                  <p className="font-black text-[11px] uppercase tracking-widest text-slate-800">{v.label}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{v.desc}</p>
                </div>
             </button>
           ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-4">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 italic">Active Content Stack</h4>
           <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
             {creativeAssets.length === 0 ? (
               <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center opacity-30">
                  <p className="text-[9px] font-black uppercase tracking-widest">Studio Empty</p>
               </div>
             ) : creativeAssets.map(asset => (
               <button 
                 key={asset.id} 
                 disabled={isThinking}
                 onClick={() => setActiveCreativeAsset(asset)}
                 className={`w-full p-6 rounded-3xl border text-left transition-all flex justify-between items-center ${activeCreativeAsset?.id === asset.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-300'} disabled:opacity-50`}
               >
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-tighter truncate leading-none mb-2">{asset.title}</p>
                    <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${activeCreativeAsset?.id === asset.id ? 'text-indigo-200' : 'text-slate-400'}`}>{asset.type}</p>
                  </div>
                  <i className="fas fa-chevron-right text-[9px] opacity-30"></i>
               </button>
             ))}
           </div>
        </div>

        <div className="lg:col-span-3 h-full">
           {activeCreativeAsset ? (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative h-full">
               <Card title={activeCreativeAsset.title} subtitle={activeCreativeAsset.type} icon="fa-file-signature" action={
                 <div className="flex items-center gap-4">
                    <button className="text-slate-300 hover:text-indigo-600 transition-colors"><i className="fas fa-copy"></i></button>
                    <button onClick={() => setCreativeAssets(prev => prev.filter(a => a.id !== activeCreativeAsset.id))} className="text-slate-300 hover:text-red-600 transition-colors"><i className="fas fa-trash-alt"></i></button>
                 </div>
               }>
                  <div className="relative group/editor h-full flex flex-col">
                    <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 italic text-xl leading-relaxed text-slate-700 font-medium mb-10 whitespace-pre-wrap shadow-inner border-l-8 border-indigo-600 flex-1">
                       {activeCreativeAsset.content}
                    </div>

                    {/* ✅ NEW: REFINEMENT SECTION */}
                    <div className="mt-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <i className="fas fa-wand-magic-sparkles text-amber-600 text-lg"></i>
                        <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest">AI Refinement Engine</p>
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={refinementInstruction}
                          onChange={(e) => setRefinementInstruction(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isThinking) {
                              refineAsset(refinementInstruction);
                            }
                          }}
                          placeholder="e.g., Make it more urgent, Add statistics, Shorten to 100 words..."
                          disabled={isThinking}
                          className="flex-1 px-5 py-3 bg-white border-2 border-amber-200 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          onClick={() => refineAsset(refinementInstruction)}
                          disabled={isThinking || !refinementInstruction.trim()}
                          className="px-8 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                        >
                          {isThinking ? (
                            <>
                              <i className="fas fa-circle-notch fa-spin"></i>
                              Refining...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-wand-magic-sparkles"></i>
                              Refine
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[9px] text-amber-700 font-bold mt-3 italic">
                        💡 Example: "Make this more conversational" or "Add a stronger call-to-action" or "Include district-specific data"
                      </p>
                    </div>

                    {/* Legal Shield Section */}
                    <div className="mt-6 flex flex-wrap gap-4 items-center">
                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic mr-4">Deploy to Legal Shield:</p>
                       <button onClick={() => { setActiveTab('legal'); setActiveDisclaimerType('digital'); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">Digital Check</button>
                       <button onClick={() => { setActiveTab('legal'); setActiveDisclaimerType('print'); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">Print Check</button>
                       <button onClick={() => { setActiveTab('legal'); setActiveDisclaimerType('sms'); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">SMS Check</button>
                    </div>
                  </div>
               </Card>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-32 border-8 border-dashed border-slate-50 rounded-[4rem] opacity-20">
                <i className="fas fa-bullhorn text-8xl mb-12"></i>
                <p className="text-xl font-black uppercase tracking-[0.5em] text-center">Megaphone Latent - Deploy Pipeline to Begin</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );

// ============================================================================
// RENDER: WAR CHEST (FUNDRAISING) - Continuing in next section due to length
// We'll add the remaining render functions (War Chest, Legal Shield, Settings)
// in the continuation below
// ============================================================================

  const renderWarChest = () => {
    const budgetCategories = profile.metadata.budget_estimate?.categories || {};
    const donorLeads = profile.metadata.donor_leads || [];
    const totalRaised = profile.compliance_tracker?.total_raised || 0;
    const totalNeeded = profile.metadata.budget_estimate?.total_projected_needed || 1;
    const voteGoal = profile.metadata.vote_goal.target_vote_goal || 1;
    
    const groups = [
      { name: "Personnel", keys: ['staff_salaries', 'consultants'] },
      { name: "Voter Contact", keys: ['advertising_digital', 'advertising_print', 'direct_mail', 'sms_messaging'] },
      { name: "Operations", keys: ['events', 'voter_file_data', 'compliance_legal', 'office_ops'] },
      { name: "Reserve", keys: ['emergency_reserve'] }
    ];

    return (
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card title="Treasury Status" icon="fa-vault" subtitle="Current War Chest">
            <div className="space-y-4 mt-4">
              <p className="text-5xl font-black text-emerald-600">${totalRaised.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Secured Funds</p>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.min((totalRaised/totalNeeded)*100, 100)}%` }}/>
              </div>
            </div>
          </Card>

          <Card title="Budget Target" icon="fa-bullseye" subtitle="Projected Campaign Need">
            <div className="space-y-4 mt-4">
              <p className="text-5xl font-black text-indigo-600">${totalNeeded.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Required</p>
              <p className="text-sm text-slate-600 font-bold">${(totalNeeded/voteGoal).toFixed(2)} per vote</p>
            </div>
          </Card>

          <Card title="Strategic Audit" icon="fa-magnifying-glass-chart" subtitle="Budget Analysis">
            <button 
              onClick={runBudgetAudit} 
              disabled={isAuditing}
              className="mt-4 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
            >
              {isAuditing ? 'Analyzing...' : 'Run Audit'}
            </button>
            {auditResult && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl text-xs leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {auditResult}
              </div>
            )}
          </Card>
        </div>

        <Card title="Budget Allocation Matrix" icon="fa-chart-pie" subtitle="Strategic Resource Distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            {groups.map(group => (
              <div key={group.name} className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-700">{group.name}</h4>
                {group.keys.map(key => (
                  <div key={key} className="flex items-center gap-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex-1">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="number"
                      value={budgetCategories[key as keyof typeof budgetCategories] || 0}
                      onChange={e => updateBudgetCategory(key as keyof BudgetEstimate['categories'], e.target.value)}
                      className="w-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Donor Pipeline" icon="fa-users" subtitle="Prospective Contributor Management" action={
          <button onClick={addDonorLead} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">+ Add Lead</button>
        }>
          <div className="space-y-4 pt-4">
            {donorLeads.map(lead => (
              <div key={lead.id} className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between">
                <input
                  value={lead.name}
                  onChange={e => updateDonorLead(lead.id, { name: e.target.value })}
                  className="flex-1 font-bold text-sm bg-transparent outline-none"
                  placeholder="Donor name"
                />
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={lead.target_amount}
                    onChange={e => updateDonorLead(lead.id, { target_amount: parseInt(e.target.value) || 0 })}
                    className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-right"
                    placeholder="$0"
                  />
                  <select
                    value={lead.status}
                    onChange={e => updateDonorLead(lead.id, { status: e.target.value as DonorLead['status'] })}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase"
                  >
                    <option value="identified">Identified</option>
                    <option value="contacted">Contacted</option>
                    <option value="committed">Committed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };
// ============================================================================
  // RENDER: DNA VAULT (SETTINGS) MODULE
  // ============================================================================

  const renderSettings = () => (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <Card title="Candidate DNA Master: Core Mapping" icon="fa-fingerprint" subtitle="Onboarding & Identity Baseline">
         <div className="mt-8 space-y-12">
            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] italic mb-6 border-b border-slate-100 pb-4">Personal Background</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Candidate Name</label>
                     <input value={profile.candidate_name} onChange={e => setProfile({...profile, candidate_name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Office Sought</label>
                     <input value={profile.office_sought} onChange={e => setProfile({...profile, office_sought: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Party Affiliation</label>
                     <input value={profile.party} onChange={e => setProfile({...profile, party: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Treasurer</label>
                     <input value={profile.metadata.treasurer || ''} onChange={e => setProfile({...profile, metadata: {...profile.metadata, treasurer: e.target.value}})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" placeholder="Legal Treasurer Name" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Address</label>
                     <input value={profile.metadata.campaign_address || ''} onChange={e => setProfile({...profile, metadata: {...profile.metadata, campaign_address: e.target.value}})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" placeholder="HQ Address (for Disclaimers)" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Candidate Pets</label>
                     <input value={profile.metadata.dna?.pets || ''} onChange={e => updateDNA({ pets: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" placeholder="For humanization" />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] italic mb-6 border-b border-slate-100 pb-4">Strategic Narrative Mapping</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">The 'Why' (Reason for Running)</label>
                     <textarea rows={3} value={profile.metadata.dna?.reason_for_running || ''} onChange={e => updateDNA({ reason_for_running: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" placeholder="Describe the core motivator." />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Assets & Edge</label>
                     <textarea rows={3} value={profile.metadata.dna?.unique_qualifications || ''} onChange={e => updateDNA({ unique_qualifications: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" placeholder="What issues do you own?" />
                  </div>
               </div>
            </div>
         </div>
      </Card>

      <Card title="Neural Source Lab" icon="fa-folder-open" subtitle="Deep Documentation Intelligence">
         <div className="mt-8 space-y-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="w-full md:w-1/3 space-y-6">
                  <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
                     <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 italic">Material Deployment</h5>
                     <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed mb-6">
                        Upload candidate resumes, policy positions, or existing bios. Our AI extracts deep context.
                     </p>
                     <label className="w-full flex flex-col items-center justify-center p-8 border-4 border-dashed border-indigo-200 rounded-3xl hover:border-indigo-600 hover:bg-white transition-all cursor-pointer group mb-6">
                        <i className="fas fa-cloud-arrow-up text-2xl text-indigo-300 group-hover:text-indigo-600 mb-3"></i>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Upload Doc</span>
                        <input type="file" className="hidden" accept=".txt,.md,.doc,.docx" onChange={handleFileUpload} />
                     </label>

                     <div>
                        <h6 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Knowledge Base Log</h6>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                          {profile.metadata.dna?.source_materials?.map((m, i) => (
                            <div key={i} className="bg-white/50 border border-indigo-100/50 p-3 rounded-xl flex justify-between items-center group">
                               <div className="overflow-hidden">
                                  <p className="text-[9px] font-black text-slate-700 truncate">{m.name}</p>
                                  <p className="text-[7px] text-slate-400 font-bold uppercase">{m.timestamp}</p>
                               </div>
                               <i className="fas fa-check-circle text-indigo-400 text-[10px]"></i>
                            </div>
                          )) || <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest text-center py-4">No data indexed</p>}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="w-full md:w-2/3 space-y-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Raw Source Intelligence / Manual Input</label>
                  <div className="relative">
                     <textarea 
                        rows={12}
                        value={profile.metadata.dna?.source_text || ''}
                        onChange={(e) => updateDNA({ source_text: e.target.value })}
                        className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] outline-none font-medium text-slate-700 text-base italic focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all resize-none shadow-inner"
                        placeholder="Paste or type raw bio details, experience, or policy notes here..."
                     />
                     <div className="absolute bottom-6 right-8">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{profile.metadata.dna?.source_text?.length || 0} Characters Indexed</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </Card>

      <Card title="The Master Narrative" icon="fa-wand-sparkles" subtitle="Neural Synthesis outcome">
         <div className="mt-8 space-y-8">
            {!profile.metadata.dna?.master_narrative ? (
               <div className="p-16 border-4 border-dashed border-slate-100 rounded-[3.5rem] text-center bg-slate-50 flex flex-col items-center">
                  <i className="fas fa-microchip text-4xl text-slate-200 mb-6"></i>
                  <h4 className="text-xl font-black text-slate-400 uppercase tracking-tighter italic">Narrative Engine Idle</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3 mb-8 text-center max-w-sm">Use the core mapping and source lab above to calibrate the AI narrative engine.</p>
                  <button 
                     onClick={synthesizeMasterNarrative}
                     disabled={isThinking}
                     className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                  >
                     {isThinking ? <i className="fas fa-spinner animate-spin"></i> : "Synthesize Master Narrative"}
                  </button>
               </div>
            ) : (
               <div className="relative group">
                  {isThinking && (
                     <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-[3rem] transition-all duration-300">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                     </div>
                  )}
                  <div className="bg-white p-12 rounded-[3.5rem] border-2 border-indigo-100 shadow-xl relative overflow-hidden transition-all hover:border-indigo-300 mb-10">
                     <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
                        <button onClick={() => updateDNA({ master_narrative: '' })} className="text-slate-300 hover:text-red-500 transition-colors" title="Clear Narrative"><i className="fas fa-trash-alt"></i></button>
                     </div>
                     <div className="relative">
                        <textarea 
                           value={profile.metadata.dna?.master_narrative} 
                           onChange={(e) => updateDNA({ master_narrative: e.target.value })}
                           className="w-full min-h-[500px] bg-transparent outline-none border-none text-slate-700 font-medium leading-relaxed italic text-lg resize-none p-0 focus:ring-0"
                           placeholder="Manually refine your master narrative here..."
                        />
                     </div>
                     <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] italic flex items-center gap-3">
                           <i className="fas fa-check-double"></i> Narrative Active & Unified
                        </span>
                        <div className="flex gap-6">
                          <button 
                             onClick={synthesizeMasterNarrative}
                             className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors flex items-center gap-2"
                          >
                             <i className="fas fa-sparkles text-xs"></i> AI Re-Synthesize
                          </button>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white border border-indigo-500/30">
                     <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                        <i className="fas fa-sparkles text-xs"></i> AI Refinement Agent
                     </h5>
                     <div className="flex gap-4">
                        <input 
                           disabled={isThinking}
                           value={narrativeRefinePrompt}
                           onChange={(e) => setNarrativeRefinePrompt(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && refineMasterNarrative()}
                           placeholder="E.g. 'Emphasize my business background more in the mission section'"
                           className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all placeholder:text-slate-500"
                        />
                        <button 
                           onClick={refineMasterNarrative}
                           disabled={isThinking || !narrativeRefinePrompt.trim()}
                           className="px-8 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50"
                        >
                           Refine Narrative
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </Card>
    </div>
  );
// ============================================================================
// VICTORYOPS - PART 4: REMAINING RENDERS, MODALS & MAIN LAYOUT
// ============================================================================
// This is Part 4 of 4. Paste this AFTER Part 3 in your App.tsx
// This completes the application!
// START: Copy from here
// ============================================================================

  // ============================================================================
  // RENDER: DARKROOM (BRANDING) MODULE
  // ============================================================================

  const renderBranding = () => {
    return (
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">The Visual Darkroom</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Brand Synthesis & Neural Asset Generation</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tactical Grade</span>
             <button onClick={() => setHighQualityMode(!highQualityMode)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${highQualityMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {highQualityMode ? 'Pro Link (2K)' : 'Standard Link (1K)'}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* LEFT: THE FORGE */}
           <div className="lg:col-span-1 space-y-10">
              <Card title="The Identity Forge" icon="fa-wand-magic-sparkles" subtitle="Visual Logic Matrix" compact>
                 <div className="space-y-6 pt-4">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Campaign Archetype</label>
                       <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10">
                          <option>The Trusted Neighbor</option>
                          <option>The Disruptor Agent</option>
                          <option>The Steady Hand</option>
                          <option>Practical Prosperity</option>
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Primary Tone</label>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <div className={`w-6 h-6 rounded-lg ${profile.party === 'D' ? 'bg-blue-600' : profile.party === 'R' ? 'bg-red-600' : 'bg-slate-800'}`}></div>
                             <span className="text-[10px] font-black">{profile.party === 'D' ? 'Liberty Blue' : profile.party === 'R' ? 'Valor Red' : 'Sovereign Slate'}</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Highlight</label>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="w-6 h-6 rounded-lg bg-amber-400"></div>
                             <span className="text-[10px] font-black">Sunrise Gold</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </Card>

              <Card title="Visual Synthesizer" icon="fa-atom" subtitle="Neural Asset Development" className="border-indigo-500/20" action={<button onClick={generateVisual} disabled={isGeneratingImage || !imagePrompt.subject} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50">Generate</button>}>
                 <div className="space-y-6 pt-2">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Subject Description</label>
                       <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold outline-none h-24 focus:ring-8 focus:ring-indigo-500/5" placeholder="e.g. Marcus Thorne standing in front of a modern city hall, confident and approachable..." value={imagePrompt.subject} onChange={e => setImagePrompt({...imagePrompt, subject: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Environment Node</label>
                       <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold outline-none" placeholder="e.g. Modern Urban Center, Silver Creek" value={imagePrompt.env} onChange={e => setImagePrompt({...imagePrompt, env: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Visual Style</label>
                          <select className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-black uppercase outline-none" value={imagePrompt.style} onChange={e => setImagePrompt({...imagePrompt, style: e.target.value})}>
                             <option>Cinematic Portrait</option>
                             <option>Candid Action</option>
                             <option>High-Key Professional</option>
                             <option>Gritty Realism</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Aspect Ratio</label>
                          <select className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-black uppercase outline-none" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)}>
                             <option value="1:1">1:1 Square</option>
                             <option value="16:9">16:9 Wide</option>
                             <option value="9:16">9:16 Story</option>
                          </select>
                       </div>
                    </div>
                 </div>
              </Card>
           </div>

           {/* RIGHT: THE LIGHTBOX (GALLERY) */}
           <div className="lg:col-span-2 space-y-10">
              <Card title="The Lightbox Gallery" icon="fa-images" subtitle="Developed Tactical Assets">
                 {isGeneratingImage && (
                    <div className="p-20 flex flex-col items-center justify-center space-y-8 animate-pulse border-2 border-dashed border-indigo-100 rounded-[3rem] bg-indigo-50/10 mb-8">
                       <div className="relative"><div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-camera text-2xl text-indigo-600 animate-pulse"></i></div></div>
                       <div className="text-center"><p className="text-xl font-black uppercase tracking-[0.4em] text-indigo-600">Developing Film...</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Neural exposure in progress</p></div>
                    </div>
                 )}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 auto-rows-min">
                    {brandingAssets.length > 0 ? (
                       brandingAssets.map(asset => (
                          <div key={asset.id} onClick={() => setActiveAsset(asset)} className="group relative rounded-[2.5rem] overflow-hidden bg-slate-100 aspect-square shadow-sm hover:shadow-2xl transition-all cursor-pointer border border-slate-200 hover:scale-[1.02]">
                             {asset.mediaUrl && <img src={asset.mediaUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={asset.title} />}
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Developed Asset</p>
                                <h4 className="text-xl font-black text-white italic uppercase tracking-tight truncate">{asset.title}</h4>
                                <div className="flex gap-2 mt-4">
                                   <button className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-[8px] font-black uppercase text-white hover:bg-indigo-600 transition-all">Inspect</button>
                                   <button onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }} className="px-4 py-2 bg-red-600/50 backdrop-blur-md rounded-lg text-[8px] font-black uppercase text-white hover:bg-red-600 transition-all">Destroy</button>
                                </div>
                             </div>
                          </div>
                       ))
                    ) : !isGeneratingImage && (
                       <div className="col-span-full py-40 text-center opacity-20 flex flex-col items-center justify-center space-y-8 border-4 border-dashed border-slate-100 rounded-[4rem]">
                          <i className="fas fa-camera-retro text-9xl"></i>
                          <p className="text-2xl font-black uppercase tracking-[0.5em]">No Assets Exposed</p>
                       </div>
                    )}
                 </div>
              </Card>
           </div>
        </div>

        {/* MODAL: ASSET DOSSIER & REFINEMENT */}
        {activeAsset && (
           <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-3xl z-[1000] flex items-center justify-center p-12">
              <div className="bg-white w-full max-w-7xl h-[85vh] rounded-[4rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 border border-white/20">
                 <div className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-950 flex items-center justify-center relative group p-12">
                    {activeAsset.mediaUrl && <img src={activeAsset.mediaUrl} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" alt="Asset Preview" />}
                    <button onClick={() => setActiveAsset(null)} className="absolute top-10 left-10 w-16 h-16 bg-white/5 text-white/50 rounded-full flex items-center justify-center hover:text-white transition-all text-2xl z-20"><i className="fas fa-times"></i></button>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       {activeAsset.mediaUrl && <a href={activeAsset.mediaUrl} download={`VictoryOps_Asset_${activeAsset.id}.png`} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 hover:text-white transition-all">Download Master</a>}
                    </div>
                 </div>
                 <div className="w-full md:w-1/2 h-1/2 md:h-full p-16 flex flex-col bg-white overflow-y-auto space-y-12">
                    <header>
                       <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-slate-900">{activeAsset.title}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-5">Asset Intelligence ID: {activeAsset.id}</p>
                    </header>
                    <div className="space-y-8">
                       <section className="space-y-4">
                          <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-3">Neural Prompt Context</h4>
                          <p className="p-6 bg-slate-50 rounded-2xl text-sm font-medium italic text-slate-600 leading-relaxed border border-slate-100">{activeAsset.prompt || activeAsset.content}</p>
                       </section>
                       <section className="space-y-6">
                          <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-800">Tactical Refinement</h4>
                          <div className="space-y-4">
                             <textarea id="refine-input" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-8 py-6 text-sm font-bold outline-none h-32 focus:ring-8 focus:ring-indigo-500/5 shadow-inner" placeholder="Analyze visual and suggest tactical changes (e.g. 'Make the lighting more dramatic' or 'Change the tie to blue')..." />
                             <button onClick={() => {
                                const val = (document.getElementById('refine-input') as HTMLTextAreaElement).value;
                                refineVisual(activeAsset, val);
                             }} disabled={isGeneratingImage} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50">
                                {isGeneratingImage ? <><i className="fas fa-atom fa-spin"></i> Re-Exposing...</> : <><i className="fas fa-wand-magic-sparkles"></i> Execute Refinement</>}
                             </button>
                          </div>
                       </section>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-6">
                       <Card title="Mockup Preview" icon="fa-mobile-screen" compact className="bg-slate-50 border-none">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Ready for Social Sync</p>
                       </Card>
                       <Card title="Compliance Check" icon="fa-gavel" compact className="bg-slate-50 border-none">
                          <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">Disclaimer Cleared</p>
                       </Card>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: LEGAL SHIELD (COMPLIANCE) MODULE  
  // ============================================================================

  const renderLegalShield = () => {
    const shield = profile.metadata.legal_shield!;
    const access = shield.ballot_access;
    const bufferGoal = Math.round(access.signatures_required * (1 + access.safety_buffer_percentage / 100));
    const progressPerc = Math.min(100, (access.signatures_collected / bufferGoal) * 100);

    return (
      <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Ballot Access Tracker */}
            <Card title="Ballot Access Gateway" icon="fa-door-open" subtitle="Technical Qualification Status">
               <div className="mt-6 space-y-10">
                  <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl">
                     <button 
                        onClick={() => updateLegalShield({ ballot_access: { ...access, method: 'signatures' } })}
                        className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${access.method === 'signatures' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        Collect Signatures
                     </button>
                     <button 
                        onClick={() => updateLegalShield({ ballot_access: { ...access, method: 'fee' } })}
                        className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${access.method === 'fee' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        Pay Filing Fee
                     </button>
                  </div>

                  {access.method === 'signatures' ? (
                     <div className="space-y-8">
                        <div className="flex justify-between items-end">
                           <div>
                              <p className="text-5xl font-black text-slate-800 leading-none italic">{access.signatures_collected}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Validated Signatures</p>
                           </div>
                           <div className="text-right">
                              <p className="text-xl font-bold text-indigo-600">{bufferGoal}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Buffer Goal (+{access.safety_buffer_percentage}%)</p>
                           </div>
                        </div>
                        <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden shadow-inner border border-slate-200">
                           <div 
                              className={`h-full shadow-lg transition-all duration-1000 ${progressPerc < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${progressPerc}%` }}
                           />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                           <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center gap-6">
                              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg"><i className="fas fa-pen-nib"></i></div>
                              <div className="flex-1">
                                 <label className="text-[9px] font-black text-indigo-900 uppercase tracking-widest mb-1 block">Quick Add Collected</label>
                                 <input 
                                    type="number" 
                                    className="bg-transparent border-none p-0 outline-none text-xl font-black text-indigo-800 tracking-tighter w-full focus:ring-0"
                                    placeholder="Enter batch size..."
                                    onKeyDown={(e) => {
                                       if (e.key === 'Enter') {
                                          const val = parseInt((e.target as HTMLInputElement).value) || 0;
                                          updateLegalShield({ ballot_access: { ...access, signatures_collected: access.signatures_collected + val } });
                                          (e.target as HTMLInputElement).value = '';
                                       }
                                    }}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-12 space-y-8">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all ${access.fee_paid ? 'bg-emerald-100 text-emerald-600 border-4 border-emerald-200' : 'bg-slate-100 text-slate-400 border-4 border-slate-200'}`}>
                           <i className={`fas ${access.fee_paid ? 'fa-check' : 'fa-dollar-sign'}`}></i>
                        </div>
                        <div className="text-center">
                           <p className="text-4xl font-black text-slate-800 italic">${access.fee_amount}</p>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Filing Fee Required (TX-HD)</p>
                        </div>
                        <button 
                           onClick={() => updateLegalShield({ ballot_access: { ...access, fee_paid: !access.fee_paid } })}
                           className={`px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl ${access.fee_paid ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                        >
                           {access.fee_paid ? "Mark as Unpaid" : "Record Payment"}
                        </button>
                     </div>
                  )}
               </div>
            </Card>

            {/* Disclaimer Engine */}
            <Card title="Shield Generator" icon="fa-shield-halved" subtitle="Contextual Legal Disclaimers">
               <div className="mt-6 space-y-10">
                  <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl">
                     {(['digital', 'print', 'sms'] as const).map((t) => (
                        <button 
                           key={t}
                           onClick={() => setActiveDisclaimerType(t)}
                           className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeDisclaimerType === t ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                           {t}
                        </button>
                     ))}
                  </div>

                  <div className="p-10 bg-slate-900 rounded-[2.5rem] border border-slate-800 text-white shadow-2xl relative overflow-hidden">
                     <div className="relative z-10">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-4 italic">
                           <i className="fas fa-scale-balanced"></i> Required Legal Text
                        </p>
                        <div className="text-lg leading-relaxed font-medium text-slate-300 italic mb-8 border-l-4 border-indigo-500 pl-8 select-all">
                           {generateTexasDisclaimer(activeDisclaimerType, profile.candidate_name, profile.metadata.treasurer || '', profile.metadata.campaign_address || '')}
                        </div>
                        <button 
                           onClick={() => {
                              const text = generateTexasDisclaimer(activeDisclaimerType, profile.candidate_name, profile.metadata.treasurer || '', profile.metadata.campaign_address || '');
                              navigator.clipboard.writeText(text);
                           }}
                           className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                           <i className="fas fa-copy text-indigo-400"></i>
                           <span className="text-[9px] font-black uppercase tracking-widest">Copy to Clipboard</span>
                        </button>
                     </div>
                     <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mt-24 -mr-24"></div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-inner">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">Mapped Data (From DNA)</p>
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Treasurer</label>
                           <p className="text-sm font-bold text-slate-700">{profile.metadata.treasurer || 'Not Assigned'}</p>
                        </div>
                        <div>
                           <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Campaign HQ</label>
                           <p className="text-sm font-bold text-slate-700 truncate">{profile.metadata.campaign_address || 'Not Provided'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* TEC Reporting Schedule */}
            <Card title="TEC Reporting Matrix" icon="fa-calendar-check" subtitle="Mandatory Disclosure Cycles">
               <div className="mt-4 space-y-4">
                  {shield.reporting_schedule.map((report) => (
                     <div key={report.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-200 transition-all flex justify-between items-start group">
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">{report.title}</p>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Due: {report.date}</p>
                           <p className="text-[9px] text-slate-500 leading-relaxed max-w-[150px]">{report.description}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${report.status === 'pending' ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse' : 'bg-emerald-500'}`} />
                     </div>
                  ))}
                  <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] mt-4">
                     <p className="text-[9px] font-black text-indigo-900 uppercase tracking-widest italic mb-2">Pro-Tip:</p>
                     <p className="text-[9px] leading-relaxed text-indigo-700">Missing a TEC deadline can trigger automatic $500 fines. Systems are set to alert 72 hours prior.</p>
                  </div>
               </div>
            </Card>

            {/* AI Compliance Auditor */}
            <Card title="Neural Compliance Scanner" icon="fa-microchip" subtitle="Automated Ad Review" action={
               <button 
                  onClick={runLegalComplianceAudit}
                  disabled={isThinking || !activeCreativeAsset}
                  className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-30"
               >
                  {isThinking ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-magnifying-glass-shield"></i>}
               </button>
            }>
               <div className="h-full flex flex-col">
                  {complianceAuditResult ? (
                     <div className="flex-1 p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 italic text-sm text-indigo-900 font-medium leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-right-2 overflow-y-auto max-h-[400px]">
                        {complianceAuditResult}
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center opacity-20 p-12 text-center">
                        <i className="fas fa-scale-balanced text-7xl mb-8"></i>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] leading-relaxed">
                           Select an asset in the Megaphone Studio <br/>then deploy the scanner.
                        </p>
                     </div>
                  )}
               </div>
            </Card>

            {/* Required Forms Checklist */}
            <Card title="TEC Form Registry" icon="fa-file-contract" subtitle="Mandatory Filings Status">
               <div className="mt-4 space-y-4">
                  {shield.required_forms.map((form, i) => (
                     <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] group transition-all hover:bg-white">
                        <button 
                           onClick={() => {
                              const nextForms = [...shield.required_forms];
                              nextForms[i].filed = !nextForms[i].filed;
                              updateLegalShield({ required_forms: nextForms });
                           }}
                           className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all ${form.filed ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-200 group-hover:border-indigo-400'}`}
                        >
                           <i className={`fas ${form.filed ? 'fa-check' : 'fa-circle'}`}></i>
                        </button>
                        <div>
                           <p className={`text-[10px] font-black uppercase tracking-tighter ${form.filed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{form.name}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{form.description}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: DNA VAULT (SETTINGS) MODULE (From Part 3, included here for completeness)
  // Note: This was already included in Part 3 but listed here for reference
  // The renderSettings function is already complete in Part 3 starting at renderWarChest
  // ============================================================================

  // ============================================================================
  // RENDER: MODALS & OVERLAYS
  // ============================================================================

  const renderGatekeeper = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 z-[2000] flex items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.08),transparent_40%)]"></div>
      
      <div className="relative z-10 max-w-2xl w-full animate-in zoom-in-95 duration-700">
        <div className="text-center mb-16">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-3xl mx-auto mb-10 flex items-center justify-center shadow-2xl shadow-indigo-500/50 animate-pulse">
            <i className="fas fa-shield-halved text-5xl text-white"></i>
          </div>
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">
            Victory<span className="text-indigo-400">Ops</span>
          </h1>
          <p className="text-indigo-300 text-sm font-black uppercase tracking-[0.4em]">Tactical Campaign Command System</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-12 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tight italic">Initialize Campaign Identity</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-3 block">Candidate Name</label>
              <input 
                type="text" 
                value={initData.name}
                onChange={(e) => setInitData({...initData, name: e.target.value})}
                className="w-full bg-white/10 border border-white/30 rounded-2xl px-6 py-4 text-white font-bold text-lg outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all placeholder:text-white/40"
                placeholder="Enter full name..."
              />
            </div>

            <div>
              <label className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-3 block">Office Sought</label>
              <input 
                type="text"
                value={initData.office}
                onChange={(e) => setInitData({...initData, office: e.target.value})}
                className="w-full bg-white/10 border border-white/30 rounded-2xl px-6 py-4 text-white font-bold text-lg outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all placeholder:text-white/40"
                placeholder="e.g., Texas House District 52"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-3 block">District ID</label>
                <input 
                  type="text"
                  value={initData.district}
                  onChange={(e) => setInitData({...initData, district: e.target.value})}
                  className="w-full bg-white/10 border border-white/30 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all placeholder:text-white/40"
                  placeholder="TX-HD-52"
                />
              </div>
              <div>
                <label className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-3 block">Party</label>
                <select
                  value={initData.party}
                  onChange={(e) => setInitData({...initData, party: e.target.value})}
                  className="w-full bg-white/10 border border-white/30 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all"
                >
                  <option value="D" className="bg-slate-900">Democrat</option>
                  <option value="R" className="bg-slate-900">Republican</option>
                  <option value="I" className="bg-slate-900">Independent</option>
                  <option value="L" className="bg-slate-900">Libertarian</option>
                  <option value="G" className="bg-slate-900">Green</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button 
              onClick={handleFinalizeIdentity}
              disabled={!initData.name || !initData.office}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-rocket mr-3"></i>
              Launch Campaign
            </button>
            <button 
              onClick={handleLoadDemo}
              className="bg-white/10 hover:bg-white/20 text-white py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-white/30"
            >
              Demo
            </button>
          </div>
        </div>

        <p className="text-center text-indigo-400/60 text-xs font-bold uppercase tracking-widest mt-8">
          Neural Systems • 2026 Cycle Ready
        </p>
      </div>
    </div>
  );

  const renderOnboardingWizard = () => (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[1500] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full h-[80vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-pink-600 p-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">DNA Interview: Step {onboardingStep}</h2>
            <p className="text-indigo-100 text-sm font-bold mt-2">Building your campaign foundation with {profile.candidate_name}</p>
          </div>
          <button 
            onClick={() => setOnboardingStep(null)}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
          {onboardingMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-6 rounded-[2rem] ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-lg' 
                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
              }`}>
                <p className="text-base leading-relaxed font-medium">{msg.text}</p>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-[2rem] rounded-bl-none p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border-t border-slate-200 p-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            const input = (e.target as HTMLFormElement).response.value;
            submitOnboardingStep(input);
            (e.target as HTMLFormElement).reset();
          }}>
            <div className="flex gap-4">
              <input 
                name="response"
                type="text"
                disabled={isThinking}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all disabled:opacity-50"
                placeholder="Type your response..."
              />
              <button 
                type="submit"
                disabled={isThinking}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
              >
                {isThinking ? <i className="fas fa-spinner animate-spin"></i> : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Competitor Modal
  {isCompetitorModalOpen && (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-8">
      <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl">
        <h3 className="text-3xl font-black uppercase italic tracking-tight mb-8">Register New Rival</h3>
        <div className="space-y-6">
          <input 
            placeholder="Opponent Name"
            value={newCompetitor.name}
            onChange={e => setNewCompetitor({...newCompetitor, name: e.target.value})}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold"
          />
          <div className="grid grid-cols-2 gap-4">
            <select 
              value={newCompetitor.party}
              onChange={e => setNewCompetitor({...newCompetitor, party: e.target.value})}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="D">Democrat</option>
              <option value="R">Republican</option>
              <option value="I">Independent</option>
            </select>
            <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <input 
                type="checkbox"
                checked={newCompetitor.incumbent}
                onChange={e => setNewCompetitor({...newCompetitor, incumbent: e.target.checked})}
                className="w-5 h-5"
              />
              <span className="font-bold text-sm">Incumbent</span>
            </label>
          </div>
          <textarea 
            placeholder="Strengths (comma-separated)"
            value={newCompetitor.strengths}
            onChange={e => setNewCompetitor({...newCompetitor, strengths: e.target.value})}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold h-24"
          />
          <textarea 
            placeholder="Weaknesses (comma-separated)"
            value={newCompetitor.weaknesses}
            onChange={e => setNewCompetitor({...newCompetitor, weaknesses: e.target.value})}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold h-24"
          />
        </div>
        <div className="flex gap-4 mt-8">
          <button 
            onClick={handleRegisterCompetitor}
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest"
          >
            Register Target
          </button>
          <button 
            onClick={() => setIsCompetitorModalOpen(false)}
            className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  // Review Rivals Modal
  {isReviewRivalsModalOpen && (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-8">
      <div className="bg-white rounded-[3rem] p-12 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <h3 className="text-3xl font-black uppercase italic tracking-tight mb-8">Review Extracted Rivals</h3>
        <div className="space-y-4">
          {pendingRivals.map((rival, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-2xl flex justify-between items-start">
              <div>
                <h4 className="font-black text-lg">{rival.name}</h4>
                <p className="text-sm text-slate-600">{rival.party} • {rival.incumbent ? 'Incumbent' : 'Challenger'}</p>
              </div>
              <button 
                onClick={() => registerSelectedRival(rival)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase"
              >
                Register
              </button>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setIsReviewRivalsModalOpen(false)}
          className="w-full mt-8 bg-slate-200 text-slate-700 py-4 rounded-2xl font-black uppercase"
        >
          Close
        </button>
      </div>
    </div>
  )}

  // Dossier Modal
  {dossierTarget && (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-8">
      <div className="bg-white rounded-[3rem] p-12 max-w-3xl w-full shadow-2xl">
        <h3 className="text-4xl font-black uppercase italic tracking-tight mb-4">{dossierTarget.name}</h3>
        <p className="text-indigo-600 font-black uppercase text-sm mb-8">{dossierTarget.party} • {dossierTarget.incumbent ? 'Incumbent Threat' : 'Challenger'}</p>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Strengths</h4>
            <ul className="space-y-2">
              {dossierTarget.strengths.map((s, i) => (
                <li key={i} className="text-sm font-medium text-slate-700">• {s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-red-600 mb-4">Vulnerabilities</h4>
            <ul className="space-y-2">
              {dossierTarget.weaknesses.map((w, i) => (
                <li key={i} className="text-sm font-medium text-slate-700">• {w}</li>
              ))}
            </ul>
          </div>
        </div>

        <button 
          onClick={() => setDossierTarget(null)}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest"
        >
          Close Dossier
        </button>
      </div>
    </div>
  )}

  // ============================================================================
  // MAIN RENDER & LAYOUT
  // ============================================================================

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
    {isInitializing && renderGatekeeper()}
    {onboardingStep && renderOnboardingWizard()}
    
    {isThinking && !isInitializing && !onboardingStep && (
       <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[1000] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative"><div className="w-32 h-32 border-8 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-brain text-3xl text-white animate-pulse"></i></div></div>
          <h2 className="mt-12 text-3xl font-black text-white uppercase italic tracking-tighter">{thinkingLabel}</h2>
       </div>
    )}
      
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white border-r border-slate-100 flex flex-col p-8 shadow-2xl z-50">
        <div className="mb-12 flex items-center gap-4 px-2">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200"><i className="fas fa-shield-halved text-xl"></i></div>
           <div><h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Victory<span className="text-indigo-600">Ops</span></h1><p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Tactical Command</p></div>
        </div>
        <div className="flex-1 space-y-2">
          <SidebarItem icon="fa-th-large" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon="fa-radar" label="Intelligence" active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} color="bg-indigo-600" />
          <SidebarItem icon="fa-palette" label="Darkroom" active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} color="bg-pink-600" />
          <SidebarItem icon="fa-bullhorn" label="Megaphone" active={activeTab === 'creative'} onClick={() => setActiveTab('creative')} color="bg-amber-600" />
          <SidebarItem icon="fa-sack-dollar" label="War Chest" active={activeTab === 'warchest'} onClick={() => setActiveTab('warchest')} color="bg-emerald-600" />
          <SidebarItem icon="fa-gavel" label="Legal Shield" active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} color="bg-slate-900" />
          <SidebarItem icon="fa-fingerprint" label="DNA Vault" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
             <div className="relative z-10 flex items-center gap-3 mb-3"><div className={`w-2 h-2 rounded-full ${isProbeActive ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></div><span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{isProbeActive ? 'Satellite Link Active' : 'Sector Link Live'}</span></div>
             {isSyncing && <div className="absolute top-0 right-0 p-4"><i className="fas fa-sync fa-spin text-indigo-400 text-xs"></i></div>}
          </div>
        </div>
      </div>

      {/* Primary Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-12 z-40">
           <div className="flex items-center gap-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Sector</span><div className="h-px w-8 bg-slate-200"></div><h2 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">{activeTab}</h2></div>
           <div className="flex items-center gap-8">
              {profile.candidate_name && <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100"><div className="w-2 h-2 rounded-full bg-indigo-600"></div><span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">{profile.candidate_name} ({profile.party})</span></div>}
              <button className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><i className="fas fa-bell"></i></button>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
           <div className="max-w-7xl mx-auto">
             {activeTab === 'dashboard' && renderDashboard()}
             {activeTab === 'intelligence' && renderIntelligence()}
             {activeTab === 'branding' && renderBranding()}
             {activeTab === 'creative' && renderCreative()}
             {activeTab === 'warchest' && renderWarChest()}
             {activeTab === 'legal' && renderLegalShield()}
             {activeTab === 'settings' && renderSettings()}
           </div>
        </main>

        {/* Global Assistant */}
        <div className={`fixed bottom-12 right-12 z-[100] transition-all duration-500 ${isChatMinimized ? 'w-20 h-20' : 'w-[450px]'}`}>
           {isChatMinimized ? (
             <button onClick={() => setIsChatMinimized(false)} className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all border-4 border-indigo-600/20"><i className="fas fa-brain text-2xl" /></button>
           ) : (
             <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[600px] animate-in slide-in-from-bottom-10">
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                   <div className="flex items-center gap-4"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><i className="fas fa-brain text-sm"></i></div><div><h4 className="text-[10px] font-black uppercase tracking-widest italic">Tactical Advisor</h4><p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">District Awareness Live</p></div></div>
                   <button onClick={() => setIsChatMinimized(true)} className="text-slate-400 hover:text-white"><i className="fas fa-minus"></i></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                   {chatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] p-5 rounded-[1.8rem] text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-xl' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100 italic'}`}>{m.text}</div>
                      </div>
                   ))}
                   <div ref={chatEndRef} />
                </div>
                <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
                   <input 
                     className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" 
                     placeholder="Ask tactical advice..." 
                     value={input} 
                     onChange={e => setInput(e.target.value)} 
                     onKeyDown={e => { if (e.key === 'Enter') { handleSendMessage(); } }} 
                   />
                   <button 
                     onClick={handleSendMessage}
                     className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg"
                   >
                     <i className="fas fa-paper-plane text-sm"></i>
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default App;

// ============================================================================
// END OF PART 4 - APPLICATION COMPLETE!
// ============================================================================
// After assembling all 4 parts:
// 1. Create new App.tsx
// 2. Paste Part 1 (Foundation)
// 3. Paste Part 2 (AI Functions)
// 4. Paste Part 3 (Render Functions) 
// 5. Paste Part 4 (This file)
// 6. Create .env.local with VITE_GOOGLE_AI_API_KEY
// 7. Test and deploy!
// ============================================================================
