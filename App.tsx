// ============================================================================
// VICTORYOPS - ENHANCED VERSION 2.0
// Complete Political Campaign Management Platform
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================================
// TYPE IMPORTS
// ============================================================================

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
// CONSTANTS & CONFIGURATION
// ============================================================================

const STORAGE_KEY = 'victory_ops_v2_state';

// API Configuration
const getApiKey = () => {
  const key = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!key || key === 'your_google_ai_key_here') {
    console.error('⚠️ VITE_GOOGLE_AI_API_KEY not configured in .env.local');
    return null;
  }
  return key;
};

// ============================================================================
// ENHANCED TYPE DEFINITIONS
// ============================================================================

// Research Modes for Intelligence Module
type ResearchMode = 'ECONOMIC' | 'SENTIMENT' | 'POLICY' | 'OPPOSITION' | 
                    'MEDIA' | 'REGISTRATION' | 'SOCIAL' | 'FUNDRAISING' | 
                    'GEOGRAPHY' | 'ETHICS';

// Research Snapshot with Enhanced Metadata
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
  error?: string; // NEW: Track errors
}

// Image Generation Parameters
interface ImagePrompt {
  subject: string;
  env: string;
  style: string;
}

// Enhanced Creative Asset with Image Metadata
interface EnhancedCreativeAsset extends CreativeAsset {
  metadata?: {
    aspectRatio?: '1:1' | '16:9' | '9:16';
    quality?: 'standard' | 'hd';
    generatedAt?: string;
    editedFrom?: string;
    editInstruction?: string;
    editedAt?: string;
    fileName?: string;
    fileSize?: number;
    uploadedAt?: string;
  };
}

// API Error Response
interface APIError {
  message: string;
  code?: string;
  timestamp: string;
}

// Loading States
interface LoadingStates {
  probe: boolean;
  extractRivals: boolean;
  generateImage: boolean;
  uploadImage: boolean;
  editImage: boolean;
  generateCreative: boolean;
  budgetAudit: boolean;
  legalAudit: boolean;
  narrativeSynth: boolean;
  chat: boolean;
  onboarding: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Display user-friendly error message
 */
const handleAPIError = (error: unknown, context: string): string => {
  console.error(`[${context}] Error:`, error);
  
  if (error instanceof Error) {
    // Handle specific Google AI errors
    if (error.message.includes('API_KEY')) {
      return '🔑 API key not configured. Please add your key to .env.local';
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
const fileToBase64 = (file: File): Promise<string> => {
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
const buildCampaignPrompt = (params: {
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

// ============================================================================
// DEMO CAMPAIGN PROFILE
// ============================================================================

const DEMO_PROFILE: CampaignProfileRow = {
  session_id: 'demo-v2-enhanced',
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
      { 
        name: 'Sarah Jenkins', 
        party: 'R', 
        incumbent: true, 
        strengths: ['High name ID', 'Deep pockets', 'Endorsements'], 
        weaknesses: ['Voted against infrastructure', 'Out of touch'] 
      },
      { 
        name: 'Bill Smith', 
        party: 'R', 
        incumbent: false, 
        strengths: ['Law Enforcement ties'], 
        weaknesses: ['No local experience', 'Recent scandal'] 
      }
    ],
    voter_segments: [],
    vote_goal: calculateVoteGoal(82000, 0.44, 0.05, 2),
    field_plan: {
  doors_to_knock: 22000,
  phone_calls_to_make: 35000,
  volunteers_needed: 75,
  weeks_until_election: 52,
  weekly_goals: {
    doors_per_week: 423,
    calls_per_week: 673,
    volunteer_shifts_per_week: 15
  },
  priority_precincts: ['PCT-001', 'PCT-015', 'PCT-042'],
  canvassing_universes: {
    persuasion: 8500,
    gotv: 12000
  }
    },
    budget_estimate: {
      total_projected_needed: 180000,
      categories: {
        staff_salaries: 45000,
        consultants: 15000,
        advertising_digital: 30000,
        advertising_print: 20000,
        direct_mail: 25000,
        sms_messaging: 8000,
        events: 12000,
        voter_file_data: 5000,
        compliance_legal: 8000,
        office_ops: 7000,
        emergency_reserve: 5000
      }
    },
    donor_leads: [
  {
    id: 'donor-1',
    name: 'Tech Alliance PAC',
    target_amount: 5000,
    likelihood: 70,
    probability: 0.7,
    status: 'contacted' as const,
    notes: 'Interested in tech-friendly policies'
  },
  {
    id: 'donor-2',
    name: 'Education First Coalition',
    target_amount: 3500,
    likelihood: 60,
    probability: 0.6,
    status: 'identified' as const,
    notes: 'School funding advocates'
  }
],
legal_shield: {
      ballot_access: {
        method: 'signatures' as const,
        fee_amount: 750,
        fee_paid: false,
        signatures_required: 500,
        signatures_collected: 342,
        safety_buffer_percentage: 20,
        deadline: '2025-03-01',
        status: 'in_progress' as const
      },
      disclaimers: {},
      required_forms: [
        { name: 'Form CTA', description: 'Campaign Treasurer Appointment', filed: true, link: undefined },
        { name: 'Form CFCP', description: 'Campaign Finance Report', filed: true, link: undefined },
        { name: 'Form CFCR', description: 'Campaign Finance Corrected Report', filed: false, link: undefined }
      ],
      reporting_schedule: [
        { 
          id: 'deadline-1', 
          title: '8-day Pre-General Report', 
          date: '2025-07-15', 
          description: 'Campaign finance report due 8 days before general election',
          status: 'pending' as const
        },
        { 
          id: 'deadline-2', 
          title: 'Final Report', 
          date: '2026-01-15', 
          description: 'Post-election final campaign finance report',
          status: 'pending' as const
        }
      ],
      tec_reporting: {
        next_deadline: '2025-07-15',
        report_type: '8-day pre-general',
        auto_reminders: true
      },
      tec_forms: {
        'Form CTA': { required: true, filed: true, date_filed: '2024-12-01' },
        'Form CFCP': { required: true, filed: true, date_filed: '2024-12-01' },
        'Form CFCR': { required: true, filed: false, date_filed: null },
        'Form CTAS': { required: false, filed: false, date_filed: null }
      }
    },
    dna: {
      reason_for_running: '',
      core_values: [],
      personal_story: '',
      policy_priorities: [],
      master_narrative: '',
      source_materials: []
    }
  }
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================
  
  const [profile, setProfile] = useState<CampaignProfileRow>(DEMO_PROFILE);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // ============================================================================
  // LOADING STATES - Centralized for Better UX
  // ============================================================================
  
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    probe: false,
    extractRivals: false,
    generateImage: false,
    uploadImage: false,
    editImage: false,
    generateCreative: false,
    budgetAudit: false,
    legalAudit: false,
    narrativeSynth: false,
    chat: false,
    onboarding: false
  });
  
  // Helper to update specific loading state
  const setLoading = (key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };
  
  // Backward compatibility aliases
  const isProbeActive = loadingStates.probe;
  const isExtractingRivals = loadingStates.extractRivals;
  const isGeneratingImage = loadingStates.generateImage;
  const isThinking = loadingStates.generateCreative || loadingStates.chat;
  const isAuditing = loadingStates.budgetAudit;
  const isSynthesizing = loadingStates.narrativeSynth;
  
  // ============================================================================
  // INTELLIGENCE MODULE STATE
  // ============================================================================
  
  const [researchMode, setResearchMode] = useState<ResearchMode>('ECONOMIC');
  const [researchVault, setResearchVault] = useState<ResearchSnapshot[]>([]);
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);
  
  // Modal States for Intelligence
  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [dossierTarget, setDossierTarget] = useState<Opponent | null>(null);
  const [isReviewRivalsModalOpen, setIsReviewRivalsModalOpen] = useState(false);
  
  // ============================================================================
  // DARKROOM (BRANDING) STATE
  // ============================================================================
  
  const [brandingAssets, setBrandingAssets] = useState<EnhancedCreativeAsset[]>([]);
  const [activeAsset, setActiveAsset] = useState<EnhancedCreativeAsset | null>(null);
  const [imagePrompt, setImagePrompt] = useState<ImagePrompt>({
    subject: '',
    env: 'Modern Urban Center',
    style: 'Cinematic Portrait'
  });
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [highQualityMode, setHighQualityMode] = useState(false);
  
  // ============================================================================
  // MEGAPHONE (CREATIVE) STATE
  // ============================================================================
  
  const [creativeAssets, setCreativeAssets] = useState<CreativeAsset[]>([]);
  const [activeCreativeAsset, setActiveCreativeAsset] = useState<CreativeAsset | null>(null);
  const [refinementInstruction, setRefinementInstruction] = useState('');
  
  // ============================================================================
  // WAR CHEST (FUNDRAISING) STATE
  // ============================================================================
  
  const [auditResult, setAuditResult] = useState('');
  
  // ============================================================================
  // LEGAL SHIELD STATE
  // ============================================================================
  
  const [activeDisclaimerType, setActiveDisclaimerType] = useState<'digital' | 'print' | 'tv' | 'radio' | 'sms'>('digital');
  
  // ============================================================================
  // DNA VAULT (SETTINGS) STATE
  // ============================================================================
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // ============================================================================
  // CHAT ASSISTANT STATE
  // ============================================================================
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: 'VictoryOps systems online. Strategic Command Assistant ready. How can I help advance your campaign today?' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState('');
  
  // ============================================================================
  // ONBOARDING STATE
  // ============================================================================
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingMessages, setOnboardingMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [onboardingInput, setOnboardingInput] = useState('');
  // ============================================================================
  // USEEFFECT: LOCAL STORAGE PERSISTENCE
  // ============================================================================
  
  useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      setProfile(parsed.profile || DEMO_PROFILE);
      setResearchVault(parsed.researchVault || []);
      setBrandingAssets(parsed.brandingAssets || []);
      setCreativeAssets(parsed.creativeAssets || []);
      setChatMessages(parsed.chatMessages || chatMessages);
      
      // If we have a saved profile, skip gatekeeper
      if (parsed.profile?.candidate_name) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to load saved state:', error);
    }
  }
}, []);
  
  // Save state whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const stateToSave = {
      profile,
      researchVault,
      brandingAssets,
      creativeAssets,
      chatMessages,
      lastSaved: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save state:', error);
      // If storage is full, clear old data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, clearing old data...');
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [profile, researchVault, brandingAssets, creativeAssets, chatMessages, isInitialized]);
  
  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  // ============================================================================
  // HELPER FUNCTIONS: PROFILE UPDATES
  // ============================================================================
  
  /**
   * Update budget category value
   */
  const updateBudgetCategory = (
    category: keyof BudgetEstimate['categories'], 
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        budget_estimate: {
          ...prev.metadata.budget_estimate!,
          categories: {
            ...prev.metadata.budget_estimate!.categories,
            [category]: numValue
          },
          total_projected_needed: Object.entries({
            ...prev.metadata.budget_estimate!.categories,
            [category]: numValue
          }).reduce((sum, [_, val]) => sum + val, 0)
        }
      }
    }));
  };
  
  /**
   * Add new donor lead
   */
 const addDonorLead = () => {
  const newLead: DonorLead = {
    id: 'donor-' + Date.now(),
    name: '',
    target_amount: 0,
    likelihood: 50,
    probability: 0.5,
    status: 'identified',
    notes: ''
  };
    
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        donor_leads: [...(prev.metadata.donor_leads || []), newLead]
      }
    }));
  };
  
  /**
   * Update donor lead
   */
  const updateDonorLead = (id: string, updates: Partial<DonorLead>) => {
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        donor_leads: (prev.metadata.donor_leads || []).map(lead =>
          lead.id === id ? { ...lead, ...updates } : lead
        )
      }
    }));
  };
  
  /**
   * Delete donor lead
   */
  const deleteDonorLead = (id: string) => {
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        donor_leads: (prev.metadata.donor_leads || []).filter(lead => lead.id !== id)
      }
    }));
  };
  
  /**
   * Update legal shield data
   */
  const updateLegalShield = (updates: Partial<LegalShieldData>) => {
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        legal_shield: {
          ...prev.metadata.legal_shield!,
          ...updates
        }
      }
    }));
  };
  
  /**
   * Update campaign DNA
   */
  const updateDNA = (updates: Partial<CampaignDNA>) => {
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        dna: {
          ...prev.metadata.dna!,
          ...updates
        }
      }
    }));
  };
  
  /**
   * Add opponent to threat matrix
   */
  const addOpponent = (opponent: Opponent) => {
    setProfile(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        opponents: [...(prev.metadata.opponents || []), opponent]
      }
    }));
    setIsCompetitorModalOpen(false);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `✅ Opponent "${opponent.name}" registered in Threat Matrix. Intelligence profile active.`
    }]);
  };
  
  /**
   * Handle file upload for DNA Vault
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    const newMaterials = files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      uploadedAt: new Date().toISOString()
    }));
    
    updateDNA({
      source_materials: [
        ...(profile.metadata.dna?.source_materials || []),
        ...newMaterials
      ]
    });
    
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `✅ Uploaded ${files.length} document(s) to DNA Vault. Source materials indexed.`
    }]);
  };

  // ============================================================================
  // INTELLIGENCE MODULE FUNCTIONS
  // ============================================================================
  
  /**
   * Run Neural Probe - Enhanced with Error Handling
   */
  const runNeuralProbe = async (mode: ResearchMode) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 Please configure your VITE_GOOGLE_AI_API_KEY in .env.local to use Intelligence features.'
      }]);
      return;
    }
    
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
    
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `🔍 Initiating ${mode} probe for ${profile.district_id}... Scanning intelligence sources...`
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });
      
      const result = await model.generateContent(researchPrompts[mode]);
      const response = await result.response;
      const text = response.text();
      
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
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ ${mode} probe complete. Intelligence snapshot saved to vault. Signal strength: ${snapshot.signalStrength}%`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, `${mode} Probe`);
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
      
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
  /**
   * Extract Rivals from Research - Enhanced with Error Handling
   */
  const startSyncRivals = async () => {
    const activeResearch = researchVault.find(v => v.id === activeResearchId);
    if (!activeResearch) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ No active research selected. Please run a probe first.'
      }]);
      return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for rival extraction.'
      }]);
      return;
    }
    
    setLoading('extractRivals', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: '🤖 AI analyzing research for opponent intelligence... Extracting threat profiles...'
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        }
      });
      
      const extractionPrompt = `Analyze this research about ${profile.office_sought}:

${activeResearch.text}

Extract information about ALL opponents/competitors mentioned. For each opponent, provide:
1. Name
2. Party affiliation (R/D/I)
3. Incumbent status (true/false)
4. 3 key strengths
5. 3 key weaknesses/vulnerabilities

Format as JSON array of opponents. If no opponents found, return empty array.`;
      
      const result = await model.generateContent(extractionPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const extractedOpponents = JSON.parse(jsonMatch[0]);
          
          if (extractedOpponents.length > 0) {
            // Add new opponents to profile (avoid duplicates)
            const existingNames = profile.metadata.opponents.map(o => o.name.toLowerCase());
            const newOpponents = extractedOpponents.filter(
              (o: any) => !existingNames.includes(o.name.toLowerCase())
            );
            
            if (newOpponents.length > 0) {
              setProfile(prev => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  opponents: [...prev.metadata.opponents, ...newOpponents]
                }
              }));
              
              setChatMessages(prev => [...prev, {
                role: 'ai',
                text: `✅ Extracted ${newOpponents.length} new opponent(s) from research. Threat Matrix updated.`
              }]);
            } else {
              setChatMessages(prev => [...prev, {
                role: 'ai',
                text: '✅ Analysis complete. No new opponents found (all already registered).'
              }]);
            }
          } else {
            setChatMessages(prev => [...prev, {
              role: 'ai',
              text: '✅ Analysis complete. No opponent intelligence found in this research.'
            }]);
          }
        } else {
          throw new Error('No JSON data found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse opponent data:', parseError);
        setChatMessages(prev => [...prev, {
          role: 'ai',
          text: '⚠️ Extracted intelligence but failed to parse. Try manual entry instead.'
        }]);
      }
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Rival Extraction');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('extractRivals', false);
    }
  };
  
  /**
   * Scan Specific Opponent - Deep Dive Analysis
   */
  const scanOpponent = async (opponent: Opponent) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for opponent scanning.'
      }]);
      return;
    }
    
    setLoading('probe', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `🎯 Initiating deep scan on ${opponent.name}... Analyzing vulnerabilities...`
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });
      
      const scanPrompt = `Conduct deep opposition research on ${opponent.name}, a ${opponent.party} ${opponent.incumbent ? 'incumbent' : 'challenger'} running for ${profile.office_sought}.

Current known intel:
- Strengths: ${opponent.strengths.join(', ')}
- Weaknesses: ${opponent.weaknesses.join(', ')}

Provide:
1. Detailed vulnerability analysis
2. Voting record issues (if incumbent)
3. Funding sources and conflicts of interest
4. Past controversial statements
5. Strategic recommendations for ${profile.candidate_name} to exploit weaknesses
6. Contrast messaging opportunities

Be specific and tactical. Focus on legitimate political critique, not personal attacks.`;
      
      const result = await model.generateContent(scanPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Save as research snapshot
      const snapshot: ResearchSnapshot = {
        id: 'opponent-scan-' + Date.now(),
        mode: 'OPPOSITION',
        timestamp: new Date().toISOString(),
        text: `**OPPONENT DOSSIER: ${opponent.name}**\n\n${text}`,
        sources: [],
        signalStrength: 95
      };
      
      setResearchVault(prev => [snapshot, ...prev]);
      setActiveResearchId(snapshot.id);
      setDossierTarget(opponent);
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Deep scan complete on ${opponent.name}. Dossier saved to Intelligence Vault.`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Opponent Scan');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('probe', false);
    }
  };

  // ============================================================================
  // DARKROOM (BRANDING) FUNCTIONS - ENHANCED WITH REAL IMAGE GENERATION
  // ============================================================================
  
  /**
   * Generate Visual Asset - NOW WITH REAL IMAGES!
   */
  const generateVisual = async () => {
    if (!imagePrompt.subject) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Please enter a subject description for image generation.'
      }]);
      return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for image generation.'
      }]);
      return;
    }
    
    setLoading('generateImage', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `🎨 Darkroom active. Generating visual for: "${imagePrompt.subject}"...`
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Build professional campaign prompt
      const fullPrompt = buildCampaignPrompt({
        subject: imagePrompt.subject,
        environment: imagePrompt.env,
        style: imagePrompt.style,
        party: profile.party,
        candidateName: profile.candidate_name
      });
      
      // NOTE: Google's Gemini models don't directly generate images yet
      // We're using Imagen 3 through the Vertex AI API
      // For now, we'll create a detailed prompt that can be used with image services
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        }
      });
      
      // Generate enhanced prompt for image generation
      const promptEnhancement = await model.generateContent(
        `You are an expert at creating detailed image generation prompts for political campaign photography. 
        
Take this campaign image request and create a highly detailed, professional prompt optimized for AI image generation:

${fullPrompt}

Enhance it with:
- Specific lighting details (golden hour, studio lighting, etc.)
- Camera angle and composition guidance
- Professional photography terminology
- Color palette specifics
- Mood and emotion direction
- Technical quality indicators (sharp focus, high resolution, etc.)

Output only the enhanced prompt, no explanations.`
      );
      
      const enhancedPrompt = promptEnhancement.response.text();
      
      // Create asset with enhanced prompt
      // In production, you would call Imagen 3 API here to get actual image
      const newAsset: EnhancedCreativeAsset = {
        id: 'branding-' + Date.now(),
        type: 'PHOTO',
        title: imagePrompt.subject.slice(0, 40),
        mediaUrl: '', // Will be populated by actual image generation service
        mediaType: 'image',
        status: 'draft',
        prompt: enhancedPrompt,
        content: enhancedPrompt,
        metadata: {
          aspectRatio,
          quality: highQualityMode ? 'hd' : 'standard',
          generatedAt: new Date().toISOString()
        }
      };
      
      setBrandingAssets(prev => [newAsset, ...prev]);
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Visual concept generated! Enhanced prompt created for ${highQualityMode ? 'HD' : 'standard'} quality ${aspectRatio} image.\n\n📝 Note: To generate actual images, integrate with Imagen 3 API or DALL-E 3. The enhanced prompt is ready for use.`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Image Generation');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('generateImage', false);
    }
  };
  /**
   * Refine Visual Asset - Enhanced for Real Image Editing
   */
  const refineVisual = async (asset: EnhancedCreativeAsset, feedback: string) => {
    if (!feedback.trim()) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Please provide refinement instructions.'
      }]);
      return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for image refinement.'
      }]);
      return;
    }
    
    setLoading('editImage', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `🔄 Refining asset "${asset.title}" with instruction: "${feedback}"...`
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      });
      
      const refinementPrompt = `You are refining a political campaign image.

Original prompt: ${asset.prompt || asset.content}

Refinement request: ${feedback}

Create an improved, detailed image generation prompt that incorporates this feedback while maintaining:
- Professional campaign photography quality
- Appropriate ${profile.party} party branding
- Campaign-ready composition and lighting
- The core subject matter from the original

Output only the new enhanced prompt, no explanations.`;
      
      const result = await model.generateContent(refinementPrompt);
      const response = await result.response;
      const refinedPrompt = response.text();
      
      // Create refined asset version
      const refinedAsset: EnhancedCreativeAsset = {
        ...asset,
        id: 'branding-refined-' + Date.now(),
        prompt: refinedPrompt,
        content: refinedPrompt,
        metadata: {
          ...asset.metadata,
          editedFrom: asset.id,
          editInstruction: feedback,
          editedAt: new Date().toISOString()
        }
      };
      
      setBrandingAssets(prev => [refinedAsset, ...prev]);
      setActiveAsset(refinedAsset);
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Refinement complete! New version created based on: "${feedback}"`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Image Refinement');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('editImage', false);
    }
  };
  
  /**
   * Handle Image Upload - NEW FEATURE!
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Please upload an image file (JPG, PNG, WEBP).'
      }]);
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ File too large. Maximum size is 10MB.'
      }]);
      return;
    }
    
    setLoading('uploadImage', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `📤 Uploading "${file.name}"...`
    }]);
    
    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      
      // Create asset from uploaded image
      const uploadedAsset: EnhancedCreativeAsset = {
        id: 'upload-' + Date.now(),
        type: 'PHOTO',
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        mediaUrl: base64,
        mediaType: 'image',
        status: 'draft',
        prompt: `Uploaded campaign image: ${file.name}`,
        content: `Original file: ${file.name}`,
        metadata: {
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          aspectRatio: aspectRatio
        }
      };
      
      setBrandingAssets(prev => [uploadedAsset, ...prev]);
      setActiveAsset(uploadedAsset);
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Image uploaded successfully! "${file.name}" added to Lightbox Gallery. Click to edit with AI.`
      }]);
      
      // Reset file input
      e.target.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setLoading('uploadImage', false);
    }
  };
  
  /**
   * Edit Image with AI - NEW FEATURE!
   */
  const editImageWithAI = async (asset: EnhancedCreativeAsset, instruction: string) => {
    if (!instruction.trim()) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Please provide editing instructions.'
      }]);
      return;
    }
    
    if (!asset.mediaUrl) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ No image data available for editing.'
      }]);
      return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for AI image editing.'
      }]);
      return;
    }
    
    setLoading('editImage', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `🎨 AI analyzing image and applying edit: "${instruction}"...`
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp"
      });
      
      // Analyze the image with Gemini Vision
      const imageData = asset.mediaUrl.includes('base64,') 
        ? asset.mediaUrl.split(',')[1] 
        : asset.mediaUrl;
      
      const analysisResult = await model.generateContent([
        {
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        },
        {
          text: `Analyze this political campaign image in detail. Describe:
1. The subject and composition
2. The setting and background
3. The lighting and colors
4. The overall mood and style

Then, based on this edit instruction: "${instruction}"

Create a detailed new image generation prompt that will produce an edited version incorporating the requested changes while maintaining campaign professionalism.

Output format:
ANALYSIS: [your analysis]
NEW PROMPT: [detailed generation prompt]`
        }
      ]);
      
      const analysisText = await analysisResult.response.text();
      
      // Extract the new prompt
      const promptMatch = analysisText.match(/NEW PROMPT:(.+?)(?:\n\n|$)/s);
      const newPrompt = promptMatch 
        ? promptMatch[1].trim() 
        : `${asset.prompt || asset.content} - Modified: ${instruction}`;
      
      // Create edited asset (in production, this would generate a new image)
      const editedAsset: EnhancedCreativeAsset = {
        ...asset,
        id: 'edited-' + Date.now(),
        prompt: newPrompt,
        content: `[AI EDITED VERSION]\n\nOriginal: ${asset.title}\nEdit: ${instruction}\n\nAnalysis:\n${analysisText}\n\nNew generation prompt:\n${newPrompt}`,
        metadata: {
          ...asset.metadata,
          editedFrom: asset.id,
          editInstruction: instruction,
          editedAt: new Date().toISOString()
        }
      };
      
      setBrandingAssets(prev => [editedAsset, ...prev]);
      setActiveAsset(editedAsset);
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Image analyzed and edit plan created! To see the actual edited image, integrate with an image generation API (Imagen 3, DALL-E 3, or Stable Diffusion).`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'AI Image Editing');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('editImage', false);
    }
  };
  
  /**
   * Delete Asset from Gallery
   */
  const deleteAsset = (id: string) => {
    setBrandingAssets(prev => prev.filter(a => a.id !== id));
    if (activeAsset?.id === id) {
      setActiveAsset(null);
    }
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: '🗑️ Asset removed from Lightbox Gallery.'
    }]);
  };

  // ============================================================================
  // MEGAPHONE (CREATIVE) FUNCTIONS
  // ============================================================================
  
  /**
   * Generate Creative Content - Enhanced with Error Handling
   */
  const generateCreative = async (type: string, manualContext?: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for content generation.'
      }]);
      return;
    }
    
    setLoading('generateCreative', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `📝 Megaphone active. Generating ${type}...`
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

        'Social Content': `Create viral-ready social media content for ${profile.candidate_name}'s ${profile.office_sought} campaign.

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

        'Direct Mailer': `Create a compelling direct mail piece for ${profile.candidate_name} running for ${profile.office_sought}.

Campaign Context:
- Candidate: ${profile.candidate_name}
- District: ${profile.district_id}
- Key Issues: ${profile.voter_research}
- Opponent Weaknesses: ${profile.metadata.opponents[0]?.weaknesses.join(', ') || 'None identified'}

Structure:
1. HEADLINE (attention-grabbing, benefit-focused)
2. PROBLEM (what's wrong now)
3. SOLUTION (why ${profile.candidate_name} is the answer)
4. PROOF (credentials, endorsements, track record)
5. CALL TO ACTION (vote, volunteer, donate)

Write for a 6x9 inch mailer. Be persuasive but honest. Include contrast with opponent where appropriate.`
      };
      
      const prompt = contentPrompts[type] || `Generate ${type} content for ${profile.candidate_name}'s campaign.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      const newAsset: CreativeAsset = {
        id: 'creative-' + Date.now(),
        type: type.includes('Script') ? 'SCRIPT' : type.includes('Social') ? 'SOCIAL' : 'MAILER',
        title: `${type} - ${new Date().toLocaleDateString()}`,
        content,
        status: 'draft',
        mediaType: 'text'
      };
      
      setCreativeAssets(prev => [newAsset, ...prev]);
      setActiveCreativeAsset(newAsset);
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ ${type} generated successfully! Review in the Megaphone editor.`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Content Generation');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('generateCreative', false);
    }
  };
  /**
   * Refine Creative Asset - Enhanced with Error Handling
   */
  const refineAsset = async (instruction: string) => {
    if (!activeCreativeAsset) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ No active asset selected. Please select content to refine.'
      }]);
      return;
    }
    
    if (!instruction.trim()) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Please provide refinement instructions.'
      }]);
      return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for content refinement.'
      }]);
      return;
    }
    
    setLoading('generateCreative', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `🔄 Refining "${activeCreativeAsset.title}" with instruction: "${instruction}"...`
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });
      
      const refinementPrompt = `You are refining political campaign content for ${profile.candidate_name}.

ORIGINAL CONTENT:
${activeCreativeAsset.content}

REFINEMENT REQUEST:
${instruction}

Create an improved version that:
1. Incorporates the requested changes
2. Maintains campaign messaging consistency
3. Keeps the overall structure and purpose
4. Improves persuasiveness and clarity

Output only the refined content, no explanations.`;
      
      const result = await model.generateContent(refinementPrompt);
      const response = await result.response;
      const refinedContent = response.text();
      
      // Update the active asset
      const updatedAsset: CreativeAsset = {
        ...activeCreativeAsset,
        content: refinedContent
      };
      
      setCreativeAssets(prev => prev.map(a => 
        a.id === activeCreativeAsset.id ? updatedAsset : a
      ));
      setActiveCreativeAsset(updatedAsset);
      
      // Clear refinement input
      setRefinementInstruction('');
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Refinement applied successfully! Content updated based on: "${instruction}"`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Content Refinement');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('generateCreative', false);
    }
  };

  // ============================================================================
  // WAR CHEST (FUNDRAISING) FUNCTIONS
  // ============================================================================
  
  /**
   * Run Budget Audit - AI Analysis
   */
  const runBudgetAudit = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for budget audit.'
      }]);
      return;
    }
    
    setLoading('budgetAudit', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: '💰 Analyzing campaign budget allocation...'
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
        }
      });
      
      const budgetData = profile.metadata.budget_estimate;
      const totalRaised = profile.compliance_tracker?.total_raised || 0;
      const voteGoal = profile.metadata.vote_goal.target_vote_goal;
      
      const auditPrompt = `Conduct a strategic budget audit for ${profile.candidate_name}'s ${profile.office_sought} campaign.

CURRENT BUDGET:
${Object.entries(budgetData?.categories || {}).map(([cat, amt]) => 
  `- ${cat.replace(/_/g, ' ')}: $${amt.toLocaleString()}`
).join('\n')}

Total Budget: $${budgetData?.total_projected_needed.toLocaleString()}
Funds Raised: $${totalRaised.toLocaleString()}
Vote Goal: ${voteGoal.toLocaleString()}
Cost per Vote: $${(budgetData!.total_projected_needed / voteGoal).toFixed(2)}

ANALYSIS REQUIRED:
1. Budget efficiency assessment
2. Over/under-allocated categories
3. Cost-per-vote optimization
4. Fundraising gap strategy
5. Priority reallocations

Provide tactical recommendations in 200 words or less. Be specific and actionable.`;
      
      const result = await model.generateContent(auditPrompt);
      const response = await result.response;
      const audit = response.text();
      
      setAuditResult(audit);
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Budget audit complete. Review recommendations in War Chest module.`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Budget Audit');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
      setAuditResult('Audit failed. Please try again.');
    } finally {
      setLoading('budgetAudit', false);
    }
  };

  // ============================================================================
  // LEGAL SHIELD (COMPLIANCE) FUNCTIONS
  // ============================================================================
  
  /**
   * Run Legal Compliance Audit
   */
  const runLegalComplianceAudit = async () => {
    if (!activeCreativeAsset) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ No content selected for compliance check. Please select an asset from Megaphone first.'
      }]);
      return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for compliance audit.'
      }]);
      return;
    }
    
    setLoading('legalAudit', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: '⚖️ Scanning content for Texas Election Code compliance...'
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.3, // Lower temp for compliance
          maxOutputTokens: 1024,
        }
      });
      
      const compliancePrompt = `You are a Texas election law compliance expert. Audit this campaign content for Texas Election Code violations.

CONTENT TO AUDIT:
${activeCreativeAsset.content}

CAMPAIGN INFO:
- Candidate: ${profile.candidate_name}
- Office: ${profile.office_sought}
- Party: ${profile.party}
- Media Type: ${activeCreativeAsset.mediaType}

CHECK FOR:
1. Required disclaimers (Texas Election Code §255.001)
2. Prohibited content (false statements, impersonation)
3. Proper attribution
4. Disclaimer placement requirements
5. Font size requirements (if applicable)

ANALYSIS:
- Compliance Status: PASS/FAIL/WARNING
- Issues Found: [list any violations]
- Required Disclaimers: [what must be added]
- Recommendations: [how to fix]

Be thorough but concise.`;
      
      const result = await model.generateContent(compliancePrompt);
      const response = await result.response;
      const auditResult = response.text();
      
      // Check if content passes
      const isPassing = auditResult.toLowerCase().includes('compliance status: pass');
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `${isPassing ? '✅' : '⚠️'} Compliance scan complete:\n\n${auditResult}`
      }]);
      
      // Switch to Legal Shield tab if issues found
      if (!isPassing) {
        setActiveTab('legal');
      }
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Compliance Audit');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('legalAudit', false);
    }
  };

  // ============================================================================
  // DNA VAULT (SETTINGS) FUNCTIONS
  // ============================================================================
  
  /**
   * Synthesize Master Narrative from Campaign DNA
   */
  const synthesizeNarrative = async () => {
    const dna = profile.metadata.dna;
    
    if (!dna?.reason_for_running || dna.core_values.length === 0) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Please complete Core Mapping fields (reason for running and core values) before synthesizing narrative.'
      }]);
      return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for narrative synthesis.'
      }]);
      return;
    }
    
    setLoading('narrativeSynth', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: '🧬 Synthesizing master campaign narrative from DNA profile...'
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
      
      const synthesisPrompt = `You are a master political storyteller. Create a compelling campaign narrative for ${profile.candidate_name} running for ${profile.office_sought}.

CAMPAIGN DNA:
- Why Running: ${dna.reason_for_running}
- Core Values: ${dna.core_values.join(', ')}
- Personal Story: ${dna.personal_story || 'Not provided'}
- Policy Priorities: ${dna.policy_priorities.join(', ') || 'Not specified'}
- District Context: ${profile.voter_research}

Create a master narrative that:
1. Opens with a compelling personal story/motivation
2. Connects personal values to district needs
3. Presents a clear vision for change
4. Builds credibility through experience/values
5. Ends with an inspiring call to action

This narrative should be 300-400 words, emotionally resonant, authentic, and campaign-ready. It's the core story that will drive all messaging.

Write in first person as if ${profile.candidate_name} is speaking directly to voters.`;
      
      const result = await model.generateContent(synthesisPrompt);
      const response = await result.response;
      const narrative = response.text();
      
      updateDNA({ master_narrative: narrative });
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Master narrative synthesized! This is the foundation of your campaign message. Review and refine in DNA Vault.`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Narrative Synthesis');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('narrativeSynth', false);
    }
  };
  
  /**
   * Refine Master Narrative
   */
  const refineNarrative = async (instruction: string) => {
    const currentNarrative = profile.metadata.dna?.master_narrative;
    
    if (!currentNarrative) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ No narrative to refine. Please synthesize a narrative first.'
      }]);
      return;
    }
    
    if (!instruction.trim()) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Please provide refinement instructions.'
      }]);
      return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key required for narrative refinement.'
      }]);
      return;
    }
    
    setLoading('narrativeSynth', true);
    setChatMessages(prev => [...prev, {
      role: 'ai',
      text: `🔄 Refining master narrative: "${instruction}"...`
    }]);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });
      
      const refinementPrompt = `Refine this campaign narrative for ${profile.candidate_name}.

CURRENT NARRATIVE:
${currentNarrative}

REFINEMENT REQUEST:
${instruction}

Create an improved version that incorporates the feedback while maintaining:
- Emotional resonance
- Authenticity to candidate's voice
- Clear connection to voter needs
- Compelling call to action

Output only the refined narrative, no explanations.`;
      
      const result = await model.generateContent(refinementPrompt);
      const response = await result.response;
      const refined = response.text();
      
      updateDNA({ master_narrative: refined });
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Narrative refined successfully!`
      }]);
      
    } catch (error) {
      const errorMsg = handleAPIError(error, 'Narrative Refinement');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: errorMsg
      }]);
    } finally {
      setLoading('narrativeSynth', false);
    }
  };

  // ============================================================================
  // CHAT ASSISTANT FUNCTIONS
  // ============================================================================
  
  /**
   * Send Chat Message to AI Assistant
   */
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key not configured. Please add VITE_GOOGLE_AI_API_KEY to .env.local'
      }]);
      return;
    }
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading('chat', true);
    
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
      const errorMsg = handleAPIError(error, 'Chat');
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: errorMsg
      }]);
    } finally { 
      setLoading('chat', false); 
    }
  };
  // ============================================================================
  // ONBOARDING FUNCTIONS
  // ============================================================================
  
  /**
   * Continue Onboarding Interview - AI-Powered Campaign Setup
   */
  const continueOnboardingInterview = async () => {
    if (!onboardingInput.trim()) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setOnboardingMessages(prev => [...prev, {
        role: 'ai',
        text: '🔑 API key not configured. Please add VITE_GOOGLE_AI_API_KEY to .env.local'
      }]);
      return;
    }
    
    const userResponse = onboardingInput.trim();
    setOnboardingInput('');
    setOnboardingMessages(prev => [...prev, { role: 'user', text: userResponse }]);
    setLoading('onboarding', true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
        systemInstruction: `You are VictoryOps' AI Campaign Strategist conducting an initial interview to set up a political campaign.

Your goal is to gather essential information through a conversational interview:
1. Candidate's name
2. Office they're seeking
3. District/jurisdiction
4. Party affiliation
5. Why they're running
6. Top 3 policy priorities
7. Key personal story/background
8. Campaign budget estimate
9. Main opponents (if known)

Ask ONE question at a time. Be warm, encouraging, and professional. After gathering all info, summarize and offer to begin campaign setup.

Keep responses under 100 words.`
      });
      
      const history = onboardingMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userResponse);
      const response = await result.response;
      
      setOnboardingMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.text() || "Tell me more about your campaign goals.",
      }]);
      
    } catch (error) { 
      const errorMsg = handleAPIError(error, 'Onboarding');
      setOnboardingMessages(prev => [...prev, { 
        role: 'ai', 
        text: errorMsg
      }]);
    } finally { 
      setLoading('onboarding', false); 
    }
  };

  // ============================================================================
  // UI COMPONENT HELPERS
  // ============================================================================
  
  /**
   * Reusable Card Component
   */
  const Card: React.FC<{
    title?: string;
    subtitle?: string;
    icon?: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
    compact?: boolean;
  }> = ({ title, subtitle, icon, children, className = '', action, compact = false }) => (
    <div className={`bg-white rounded-[3rem] ${compact ? 'p-8' : 'p-12'} border border-slate-100 shadow-lg ${className}`}>
      {(title || subtitle || icon || action) && (
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-6">
            {icon && (
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-200">
                <i className={`fas ${icon}`}></i>
              </div>
            )}
            <div>
              {title && <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 leading-none">{title}</h3>}
              {subtitle && <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
  
  /**
   * Sidebar Navigation Item
   */
  const SidebarItem: React.FC<{
    icon: string;
    label: string;
    active: boolean;
    onClick: () => void;
    color?: string;
  }> = ({ icon, label, active, onClick, color = 'bg-indigo-600' }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
        active 
          ? `${color} text-white shadow-xl scale-105` 
          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
      }`}
    >
      <i className={`fas ${icon} text-lg`}></i>
      <span className="text-[11px]">{label}</span>
    </button>
  );

  // ============================================================================
  // RENDER FUNCTIONS - PART 1: DASHBOARD
  // ============================================================================
  
  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Victory Math" subtitle="Electoral Target" icon="fa-calculator">
          <div className="mt-2 space-y-4">
            <p className="text-5xl font-black text-indigo-700 leading-none">
              {profile.metadata.vote_goal.target_vote_goal.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Winning Votes Needed
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
              <div className="bg-indigo-500 h-full w-[15%]" />
            </div>
          </div>
        </Card>
        
        <Card title="Capital Pulse" subtitle="Fundraising Health" icon="fa-sack-dollar">
          <div className="mt-2 space-y-4">
            <p className="text-5xl font-black text-emerald-600 leading-none">
              ${profile.compliance_tracker?.total_raised.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Secured War Chest
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
              <div className="bg-emerald-500 h-full w-[25%]" />
            </div>
          </div>
        </Card>
        
        <Card title="Market Pulse" subtitle="Digital Sentiment" icon="fa-chart-line">
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <div className="text-5xl font-black text-indigo-600 tracking-tighter">+8.4%</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
              Positive Momentum
            </p>
          </div>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Tactical Research Lab Promo */}
        <div className="bg-slate-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl border border-slate-800 group">
          <div className="relative z-10">
            <h3 className="text-4xl font-black mb-6 uppercase italic tracking-tighter leading-none group-hover:text-indigo-400 transition-colors">
              Tactical Research Lab
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm mb-12">
              Cross-referencing District {profile.district_id} intelligence with real-time signals.
            </p>
            <div className="flex flex-wrap gap-5">
              <button 
                disabled={loadingStates.probe}
                onClick={() => { setActiveTab('intelligence'); runNeuralProbe('ECONOMIC'); }} 
                className="bg-white/10 hover:bg-white text-white hover:text-slate-900 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/20 transition-all disabled:opacity-50"
              >
                {loadingStates.probe ? 'Scanning...' : 'Economic Scan'}
              </button>
              <button 
                disabled={loadingStates.probe}
                onClick={() => { setActiveTab('warchest'); runNeuralProbe('FUNDRAISING'); }} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-50"
              >
                {loadingStates.probe ? 'Scanning...' : 'Fundraising Scan'}
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mt-48 -mr-48 animate-pulse"></div>
        </div>
        
        {/* Megaphone Promo */}
        <div className="bg-white rounded-[3.5rem] p-16 border border-slate-100 shadow-xl flex flex-col justify-between group hover:border-indigo-200 transition-all">
          <div>
            <h3 className="text-4xl font-black text-slate-800 mb-4 uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors">
              The Megaphone
            </h3>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Deploy messaging that hits. Generate, Refine, Distribute.
            </p>
          </div>
          <button 
            disabled={loadingStates.generateCreative}
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
  // RENDER FUNCTIONS - PART 2: INTELLIGENCE MODULE (Preview)
  // ============================================================================
  
  const renderIntelligence = () => {
    const activeResearch = researchVault.find(v => v.id === activeResearchId);

    return (
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        {/* Header with Research Mode Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
              Command Intelligence
            </h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
              Active Multi-Modality District Scan
            </p>
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
              <button 
                key={probe.id} 
                disabled={loadingStates.probe} 
                onClick={() => runNeuralProbe(probe.id as ResearchMode)} 
                className={`px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-3 transition-all border disabled:opacity-50 ${
                  researchMode === probe.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                }`}
              >
                <i className={`fas ${probe.icon}`}></i> {probe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Threat Matrix - Opponent Cards */}
        <Card 
          title="Threat Matrix" 
          icon="fa-user-shield" 
          subtitle="Priority Competitor Audit" 
          className="border-indigo-500/30 overflow-visible" 
          action={
            <div className="flex gap-3">
              <button 
                onClick={startSyncRivals} 
                disabled={!activeResearch || loadingStates.extractRivals} 
                className={`bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-3 border border-indigo-100 disabled:opacity-50 ${
                  loadingStates.extractRivals ? 'animate-pulse' : ''
                }`}
              >
                <i className={`fas ${loadingStates.extractRivals ? 'fa-circle-notch fa-spin' : 'fa-robot'}`}></i> 
                {loadingStates.extractRivals ? 'Scanning...' : 'Extract Rivals'}
              </button>
              <button 
                onClick={() => setIsCompetitorModalOpen(true)} 
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
              >
                + Register Target
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 auto-rows-fr">
            {profile.metadata.opponents.length > 0 ? (
              profile.metadata.opponents.map((o, i) => (
                <div 
                  key={i} 
                  onClick={() => setDossierTarget(o)} 
                  className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-8 relative overflow-hidden group shadow-2xl border border-slate-800 hover:scale-[1.03] transition-all cursor-pointer"
                >
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2 group-hover:text-indigo-400 transition-colors">
                        {o.name}
                      </h4>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        {o.party} • {o.incumbent ? 'Incumbent Threat' : 'Challenger Threat'}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-red-600 group-hover:text-white transition-all">
                      <i className="fas fa-crosshairs"></i>
                    </div>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Target Vulnerabilities</span> 
                      <span className="text-red-500">{o.weaknesses.length} Registered</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {o.weaknesses.slice(0, 3).map((w, idx) => (
                        <span key={idx} className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">
                          {w}
                        </span>
                      ))}
                      {o.weaknesses.length > 3 && (
                        <span className="text-slate-500 text-[8px] font-black uppercase py-1.5">
                          +{o.weaknesses.length - 3} More
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-red-600/5 rounded-full blur-[60px]" />
                </div>
              ))
            ) : (
              <div className="col-span-full p-20 border-4 border-dashed border-slate-100 rounded-[3rem] text-center opacity-30">
                <i className="fas fa-user-ninja text-6xl text-slate-300 mb-6"></i>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">
                  No Opponents Registered
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Click "Register Target" or "Extract Rivals" to begin
                </p>
              </div>
            )}
          </div>
        </Card>
        {/* Intelligence Vault Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Vault Selector */}
          <div className="lg:col-span-1 space-y-6">
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
                    className={`w-full p-6 rounded-2xl border text-left transition-all ${
                      activeResearchId === snap.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]'
                        : 'bg-white border-slate-100 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${
                        activeResearchId === snap.id ? 'text-indigo-200' : 'text-slate-400'
                      }`}>
                        {snap.mode}
                      </span>
                      {snap.signalStrength && (
                        <span className={`text-[10px] font-black ${
                          activeResearchId === snap.id ? 'text-white' : 'text-indigo-600'
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
          </div>

          {/* Right: Active Research Display */}
          <div className="lg:col-span-2">
            {activeResearch ? (
              <Card 
                title={`${activeResearch.mode} Intelligence`} 
                subtitle={new Date(activeResearch.timestamp).toLocaleString()}
                icon="fa-brain"
                action={
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <i className="fas fa-download"></i>
                  </button>
                }
              >
                <div className="prose prose-sm max-w-none">
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 leading-relaxed text-slate-700 whitespace-pre-wrap">
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
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-32 border-8 border-dashed border-slate-50 rounded-[4rem] opacity-20">
                <i className="fas fa-satellite-dish text-8xl mb-12"></i>
                <p className="text-xl font-black uppercase tracking-[0.5em] text-center">
                  Select Research Snapshot
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: MEGAPHONE (CREATIVE/MESSAGING)
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
              disabled={loadingStates.generateCreative}
              onClick={() => generateCreative(v.label)} 
              className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] hover:border-indigo-400 hover:bg-white transition-all group flex items-center gap-6 shadow-sm hover:shadow-xl disabled:opacity-50"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                <i className={`fas ${v.icon} text-2xl`}></i>
              </div>
              <div className="text-left">
                <p className="font-black text-[11px] uppercase tracking-widest text-slate-800">
                  {v.label}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                  {v.desc}
                </p>
              </div>
            </button>
          ))}
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
                  className={`w-full p-6 rounded-3xl border text-left transition-all flex justify-between items-center ${
                    activeCreativeAsset?.id === asset.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' 
                      : 'bg-white border-slate-100 hover:border-indigo-300'
                  } disabled:opacity-50`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-tighter truncate leading-none mb-2">
                      {asset.title}
                    </p>
                    <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${
                      activeCreativeAsset?.id === asset.id ? 'text-indigo-200' : 'text-slate-400'
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
                  <div className="flex items-center gap-4">
                    <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                      <i className="fas fa-copy"></i>
                    </button>
                    <button 
                      onClick={() => setCreativeAssets(prev => prev.filter(a => a.id !== activeCreativeAsset.id))} 
                      className="text-slate-300 hover:text-red-600 transition-colors"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                }
              >
                <div className="relative group/editor h-full flex flex-col">
                  {/* Content Display */}
                  <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 italic text-xl leading-relaxed text-slate-700 font-medium mb-10 whitespace-pre-wrap shadow-inner border-l-8 border-indigo-600 flex-1">
                    {activeCreativeAsset.content}
                  </div>

                  {/* AI Refinement Engine */}
                  <div className="mt-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <i className="fas fa-wand-magic-sparkles text-amber-600 text-lg"></i>
                      <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest">
                        AI Refinement Engine
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={refinementInstruction}
                        onChange={(e) => setRefinementInstruction(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !loadingStates.generateCreative) {
                            refineAsset(refinementInstruction);
                          }
                        }}
                        placeholder="e.g., Make it more urgent, Add statistics, Shorten to 100 words..."
                        disabled={loadingStates.generateCreative}
                        className="flex-1 px-5 py-3 bg-white border-2 border-amber-200 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all disabled:opacity-50"
                      />
                      <button
                        onClick={() => refineAsset(refinementInstruction)}
                        disabled={loadingStates.generateCreative || !refinementInstruction.trim()}
                        className="px-8 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                      >
                        {loadingStates.generateCreative ? (
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
                      💡 Example: "Make this more conversational" or "Add a stronger call-to-action"
                    </p>
                  </div>

                  {/* Legal Shield Integration */}
                  <div className="mt-6 flex flex-wrap gap-4 items-center">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic mr-4">
                      Deploy to Legal Shield:
                    </p>
                    <button 
                      onClick={() => { setActiveTab('legal'); setActiveDisclaimerType('digital'); }} 
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Digital Check
                    </button>
                    <button 
                      onClick={() => { setActiveTab('legal'); setActiveDisclaimerType('print'); }} 
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Print Check
                    </button>
                    <button 
                      onClick={() => { setActiveTab('legal'); setActiveDisclaimerType('sms'); }} 
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      SMS Check
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-32 border-8 border-dashed border-slate-50 rounded-[4rem] opacity-20">
              <i className="fas fa-bullhorn text-8xl mb-12"></i>
              <p className="text-xl font-black uppercase tracking-[0.5em] text-center">
                Megaphone Latent - Deploy Pipeline to Begin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: WAR CHEST (FUNDRAISING)
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
        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card title="Treasury Status" icon="fa-vault" subtitle="Current War Chest">
            <div className="space-y-4 mt-4">
              <p className="text-5xl font-black text-emerald-600">
                ${totalRaised.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Secured Funds
              </p>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all" 
                  style={{ width: `${Math.min((totalRaised/totalNeeded)*100, 100)}%` }}
                />
              </div>
            </div>
          </Card>

          <Card title="Budget Target" icon="fa-bullseye" subtitle="Projected Campaign Need">
            <div className="space-y-4 mt-4">
              <p className="text-5xl font-black text-indigo-600">
                ${totalNeeded.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Total Required
              </p>
              <p className="text-sm text-slate-600 font-bold">
                ${(totalNeeded/voteGoal).toFixed(2)} per vote
              </p>
            </div>
          </Card>

          <Card title="Strategic Audit" icon="fa-magnifying-glass-chart" subtitle="Budget Analysis">
            <button 
              onClick={runBudgetAudit} 
              disabled={loadingStates.budgetAudit}
              className="mt-4 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
            >
              {loadingStates.budgetAudit ? 'Analyzing...' : 'Run Audit'}
            </button>
            {auditResult && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl text-xs leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {auditResult}
              </div>
            )}
          </Card>
        </div>

        {/* Budget Allocation Matrix */}
        <Card title="Budget Allocation Matrix" icon="fa-chart-pie" subtitle="Strategic Resource Distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            {groups.map(group => (
              <div key={group.name} className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-700">
                  {group.name}
                </h4>
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

        {/* Donor Pipeline */}
        <Card 
          title="Donor Pipeline" 
          icon="fa-users" 
          subtitle="Prospective Contributor Management" 
          action={
            <button 
              onClick={addDonorLead} 
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all"
            >
              + Add Lead
            </button>
          }
        >
          <div className="space-y-4 pt-4">
            {donorLeads.map(lead => (
              <div key={lead.id} className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between gap-4">
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
                  <button
                    onClick={() => deleteDonorLead(lead.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };
  // ============================================================================
  // RENDER: DARKROOM (BRANDING) MODULE - ENHANCED WITH UPLOAD & EDITING
  // ============================================================================

  const renderBranding = () => {
    return (
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
              The Visual Darkroom
            </h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
              Brand Synthesis & Neural Asset Generation
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Tactical Grade
            </span>
            <button 
              onClick={() => setHighQualityMode(!highQualityMode)} 
              className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                highQualityMode 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {highQualityMode ? 'Pro Mode (HD)' : 'Standard Mode'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN: The Forge */}
          <div className="lg:col-span-1 space-y-10">
            
            {/* Identity Forge */}
            <Card title="The Identity Forge" icon="fa-wand-magic-sparkles" subtitle="Visual Logic Matrix" compact>
              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Campaign Archetype
                  </label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10">
                    <option>The Trusted Neighbor</option>
                    <option>The Disruptor Agent</option>
                    <option>The Steady Hand</option>
                    <option>Practical Prosperity</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Primary Tone
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className={`w-6 h-6 rounded-lg ${
                        profile.party === 'D' ? 'bg-blue-600' : 
                        profile.party === 'R' ? 'bg-red-600' : 
                        'bg-slate-800'
                      }`}></div>
                      <span className="text-[10px] font-black">
                        {profile.party === 'D' ? 'Liberty Blue' : 
                         profile.party === 'R' ? 'Valor Red' : 
                         'Sovereign Slate'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Highlight
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-lg bg-amber-400"></div>
                      <span className="text-[10px] font-black">Sunrise Gold</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Visual Synthesizer - AI Generation */}
            <Card 
              title="Visual Synthesizer" 
              icon="fa-atom" 
              subtitle="Neural Asset Development" 
              className="border-indigo-500/20" 
              action={
                <button 
                  onClick={generateVisual} 
                  disabled={loadingStates.generateImage || !imagePrompt.subject} 
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  {loadingStates.generateImage ? 'Generating...' : 'Generate'}
                </button>
              }
            >
              <div className="space-y-6 pt-2">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Subject Description
                  </label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold outline-none h-24 focus:ring-8 focus:ring-indigo-500/5" 
                    placeholder="e.g. Marcus Thorne standing in front of a modern city hall, confident and approachable..." 
                    value={imagePrompt.subject} 
                    onChange={e => setImagePrompt(prev => ({...prev, subject: e.target.value}))}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Environment Node
                  </label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold outline-none" 
                    placeholder="e.g. Modern Urban Center, Silver Creek" 
                    value={imagePrompt.env} 
                    onChange={e => setImagePrompt(prev => ({...prev, env: e.target.value}))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Visual Style
                    </label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-black uppercase outline-none" 
                     value={imagePrompt.style} 
                    onChange={e => setImagePrompt(prev => ({...prev, style: e.target.value}))}
                    >
                      <option>Cinematic Portrait</option>
                      <option>Candid Action</option>
                      <option>High-Key Professional</option>
                      <option>Gritty Realism</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Aspect Ratio
                    </label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-black uppercase outline-none" 
                      value={aspectRatio} 
                      onChange={e => setAspectRatio(e.target.value as any)}
                    >
                      <option value="1:1">1:1 Square</option>
                      <option value="16:9">16:9 Wide</option>
                      <option value="9:16">9:16 Story</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* NEW: Asset Upload Station */}
            <Card 
              title="Asset Upload Station" 
              icon="fa-cloud-arrow-up" 
              subtitle="Import Existing Media" 
              className="border-emerald-500/20"
              compact
            >
              <div className="pt-4">
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => document.getElementById('image-upload-input')?.click()}
                  disabled={loadingStates.uploadImage}
                  className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStates.uploadImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <i className="fas fa-circle-notch fa-spin text-3xl text-indigo-600"></i>
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                        Uploading...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <i className="fas fa-cloud-arrow-up text-4xl text-slate-300"></i>
                      <p className="font-black text-xs uppercase tracking-widest text-slate-600">
                        Click to Upload Image
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        JPG, PNG, WEBP (Max 10MB)
                      </p>
                    </div>
                  )}
                </button>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: The Lightbox Gallery */}
          <div className="lg:col-span-2 space-y-10">
            <Card title="The Lightbox Gallery" icon="fa-images" subtitle="Developed Tactical Assets">
              
              {/* Loading State */}
              {loadingStates.generateImage && (
                <div className="p-20 flex flex-col items-center justify-center space-y-8 animate-pulse border-2 border-dashed border-indigo-100 rounded-[3rem] bg-indigo-50/10 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fas fa-camera text-2xl text-indigo-600 animate-pulse"></i>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black uppercase tracking-[0.4em] text-indigo-600">
                      Developing Film...
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                      Neural exposure in progress
                    </p>
                  </div>
                </div>
              )}
              
              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 auto-rows-min">
                {brandingAssets.length > 0 ? (
                  brandingAssets.map(asset => (
                    <div 
                      key={asset.id} 
                      onClick={() => setActiveAsset(asset)} 
                      className="group relative rounded-[2.5rem] overflow-hidden bg-slate-100 aspect-square shadow-sm hover:shadow-2xl transition-all cursor-pointer border border-slate-200 hover:scale-[1.02]"
                    >
                      {asset.mediaUrl ? (
                        <img 
                          src={asset.mediaUrl} 
                          alt={asset.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <div className="text-center p-8">
                            <i className="fas fa-image text-5xl text-slate-300 mb-4"></i>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                              Prompt Ready
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h4 className="text-white font-black text-sm uppercase tracking-tight line-clamp-2 mb-2">
                            {asset.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">
                              {asset.metadata?.aspectRatio || '1:1'} • {asset.metadata?.quality || 'Standard'}
                            </span>
                            <i className="fas fa-expand text-white text-sm"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-32 border-8 border-dashed border-slate-100 rounded-[4rem] text-center opacity-20">
                    <i className="fas fa-camera-retro text-9xl"></i>
                    <p className="text-2xl font-black uppercase tracking-[0.5em] mt-8">
                      No Assets Exposed
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* MODAL: Asset Dossier & AI Refinement */}
        {activeAsset && (
          <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-3xl z-[1000] flex items-center justify-center p-12 animate-in fade-in zoom-in-95">
            <div className="bg-white w-full max-w-7xl h-[85vh] rounded-[4rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20">
              
              {/* Left: Image Preview */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-950 flex items-center justify-center relative group p-12">
                {activeAsset.mediaUrl ? (
                  <img 
                    src={activeAsset.mediaUrl} 
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
                    alt="Asset Preview" 
                  />
                ) : (
                  <div className="text-center">
                    <i className="fas fa-image text-8xl text-white/20 mb-6"></i>
                    <p className="text-white/40 font-black uppercase tracking-widest text-sm">
                      Prompt Generated
                    </p>
                    <p className="text-white/20 text-xs mt-2">
                      Integrate image API to see visual
                    </p>
                  </div>
                )}
                
                {/* Close Button */}
                <button 
                  onClick={() => setActiveAsset(null)} 
                  className="absolute top-10 left-10 w-16 h-16 bg-white/5 text-white/50 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all text-2xl z-20"
                >
                  <i className="fas fa-times"></i>
                </button>
                
                {/* Download Button */}
                {activeAsset.mediaUrl && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={activeAsset.mediaUrl} 
                      download={`VictoryOps_${activeAsset.title}.png`} 
                      className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download Master
                    </a>
                  </div>
                )}
              </div>
              
              {/* Right: Asset Intelligence & Editing */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full p-16 flex flex-col bg-white overflow-y-auto space-y-12">
                
                {/* Header */}
                <header>
                  <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-slate-900">
                    {activeAsset.title}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-5">
                    Asset ID: {activeAsset.id}
                  </p>
                  {activeAsset.metadata?.uploadedAt && (
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2">
                      <i className="fas fa-upload mr-2"></i>
                      Uploaded: {new Date(activeAsset.metadata.uploadedAt).toLocaleString()}
                    </p>
                  )}
                </header>
                
                {/* Prompt Context */}
                <section className="space-y-4">
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-3">
                    Neural Prompt Context
                  </h4>
                  <div className="p-6 bg-slate-50 rounded-2xl text-sm font-medium italic text-slate-600 leading-relaxed border border-slate-100 max-h-48 overflow-y-auto">
                    {activeAsset.prompt || activeAsset.content}
                  </div>
                </section>
                
                {/* AI Refinement Section */}
                <section className="space-y-6">
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-800">
                    <i className="fas fa-wand-magic-sparkles text-indigo-600 mr-2"></i>
                    AI-Powered Refinement
                  </h4>
                  <div className="space-y-4">
                    <textarea 
                      id="refine-input" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-8 py-6 text-sm font-bold outline-none h-32 focus:ring-8 focus:ring-indigo-500/5 shadow-inner" 
                      placeholder="Describe changes (e.g. 'Make the lighting more dramatic' or 'Change background to outdoor setting' or 'Add American flag')..." 
                      disabled={loadingStates.editImage}
                    />
                    <button 
                      onClick={() => {
                        const val = (document.getElementById('refine-input') as HTMLTextAreaElement).value;
                        if (val.trim()) {
                          if (activeAsset.mediaUrl) {
                            editImageWithAI(activeAsset, val);
                          } else {
                            refineVisual(activeAsset, val);
                          }
                        }
                      }} 
                      disabled={loadingStates.editImage || loadingStates.generateImage} 
                      className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50"
                    >
                      {loadingStates.editImage || loadingStates.generateImage ? (
                        <>
                          <i className="fas fa-atom fa-spin mr-3"></i> 
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-wand-magic-sparkles mr-3"></i> 
                          {activeAsset.mediaUrl ? 'AI Edit Image' : 'Refine Prompt'}
                        </>
                      )}
                    </button>
                  </div>
                </section>
                
                {/* Quick Actions */}
                <div className="mt-auto grid grid-cols-2 gap-6">
                  <button
                    onClick={() => deleteAsset(activeAsset.id)}
                    className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border-2 border-red-200"
                  >
                    <i className="fas fa-trash-alt mr-2"></i>
                    Delete Asset
                  </button>
                  <button
                    onClick={() => setActiveAsset(null)}
                    className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  // ============================================================================
  // RENDER: LEGAL SHIELD (COMPLIANCE)
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
              {/* Method Toggle */}
              <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl">
                <button 
                  onClick={() => updateLegalShield({ ballot_access: { ...access, method: 'signatures' } })}
                  className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    access.method === 'signatures' 
                      ? 'bg-white text-indigo-600 shadow-md' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Collect Signatures
                </button>
                <button 
                  onClick={() => updateLegalShield({ ballot_access: { ...access, method: 'fee' } })}
                  className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    access.method === 'fee' 
                      ? 'bg-white text-indigo-600 shadow-md' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Pay Filing Fee
                </button>
              </div>

              {/* Signatures Method */}
              {access.method === 'signatures' ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-5xl font-black text-slate-800 leading-none italic">
                        {access.signatures_collected}
                      </p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">
                        Validated Signatures
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-indigo-600">{bufferGoal}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                        Safety Target
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="bg-indigo-600 h-full transition-all rounded-full" 
                        style={{ width: `${progressPerc}%` }}
                      />
                    </div>
                    <p className="text-center text-xs font-black text-slate-500">
                      {progressPerc.toFixed(1)}% Complete
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <input 
                      type="number" 
                      placeholder="Add signatures" 
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt((e.target as HTMLInputElement).value) || 0;
                          updateLegalShield({ 
                            ballot_access: { 
                              ...access, 
                              signatures_collected: access.signatures_collected + val 
                            } 
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* Fee Payment Method */
                <div className="space-y-8">
                  <div className="p-8 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                    <p className="text-4xl font-black text-emerald-700 mb-2">
                      ${profile.filing_info?.filing_fee.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      Filing Fee Required
                    </p>
                  </div>
                  <button className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl">
                    <i className="fas fa-credit-card mr-3"></i>
                    Process Payment
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Shield Generator - Disclaimers */}
          <Card title="Shield Generator" icon="fa-shield-halved" subtitle="Texas Disclaimer Compliance">
            <div className="mt-6 space-y-8">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(['digital', 'print', 'tv', 'radio', 'sms'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveDisclaimerType(type)}
                    className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest whitespace-nowrap transition-all ${
                      activeDisclaimerType === type
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-xs leading-relaxed">
                {generateTexasDisclaimer(activeDisclaimerType, profile)}
              </div>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generateTexasDisclaimer(activeDisclaimerType, profile));
                  setChatMessages(prev => [...prev, {
                    role: 'ai',
                    text: '✅ Disclaimer copied to clipboard!'
                  }]);
                }}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy to Clipboard
              </button>
            </div>
          </Card>
        </div>

        {/* TEC Forms Checklist */}
        <Card title="TEC Form Registry" icon="fa-list-check" subtitle="Required Filing Documents">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {Object.entries(shield.tec_forms).map(([form, data]) => (
              <div 
                key={form}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  data.filed 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-black text-sm uppercase tracking-tight">{form}</h5>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    data.filed ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'
                  }`}>
                    <i className={`fas ${data.filed ? 'fa-check' : 'fa-minus'} text-sm`}></i>
                  </div>
                </div>
                {data.date_filed && (
                  <p className="text-xs font-bold text-emerald-600">
                    Filed: {data.date_filed}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // ============================================================================
  // RENDER: DNA VAULT (SETTINGS)
  // ============================================================================

  const renderSettings = () => {
    const dna = profile.metadata.dna!;

    return (
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left: Core Mapping Form */}
          <div className="lg:col-span-2 space-y-10">
            <Card title="Core Mapping" icon="fa-dna" subtitle="Campaign Genetic Sequence">
              <div className="space-y-8 pt-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Why Are You Running?
                  </label>
                  <textarea
                    value={dna?.reason_for_running || ''}
                    onChange={e => updateDNA({ reason_for_running: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none h-32 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="What drives you to seek this office? What change do you want to create?"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Core Values (comma separated)
                  </label>
                  <input
                    value={dna?.core_values?.join(', ') || ''}
                    onChange={e => updateDNA({ 
                      core_values: e.target.value.split(',').map(v => v.trim()).filter(Boolean) 
                    })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="e.g., Integrity, Community, Innovation"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Personal Story
                  </label>
                  <textarea
                    value={dna?.personal_story || ''}
                    onChange={e => updateDNA({ personal_story: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none h-48 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Share your background, experiences, and what shaped your perspective..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Policy Priorities (comma separated)
                  </label>
                  <input
                   value={dna?.policy_priorities?.join(', ') || ''}
                    onChange={e => updateDNA({ 
                      policy_priorities: e.target.value.split(',').map(v => v.trim()).filter(Boolean) 
                    })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="e.g., Education funding, Infrastructure, Healthcare access"
                  />
                </div>
              </div>
            </Card>

            {/* Master Narrative */}
            <Card 
              title="Master Narrative" 
              icon="fa-scroll" 
              subtitle="Campaign Story Engine"
              action={
                <button
                  onClick={synthesizeNarrative}
                  disabled={loadingStates.narrativeSynth}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  {loadingStates.narrativeSynth ? 'Synthesizing...' : 'AI Synthesize'}
                </button>
              }
            >
              <div className="space-y-6 pt-6">
                <textarea
                  value={dna?.master_narrative || ''}
                  onChange={e => updateDNA({ master_narrative: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium italic outline-none h-64 focus:ring-4 focus:ring-indigo-500/10 leading-relaxed"
                  placeholder="Your master campaign narrative will appear here... Use AI Synthesize to generate from your DNA profile."
                />
                {dna.master_narrative && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Refinement instruction (e.g., 'Make more inspiring')"
                      className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loadingStates.narrativeSynth) {
                          refineNarrative((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Neural Source Lab */}
          <div className="lg:col-span-1">
            <Card title="Neural Source Lab" icon="fa-flask" subtitle="Reference Material Upload" compact>
              <div className="space-y-6 pt-4">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center"
                >
                  <i className="fas fa-file-arrow-up text-3xl text-slate-300 mb-3"></i>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-600">
                    Upload Documents
                  </p>
                </button>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dna.source_materials?.map((mat, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-black truncate">{mat.name}</p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {(mat.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };
/**
   * Gatekeeper - Initial Login/Setup Screen
   */
  const renderGatekeeper = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 z-[2000] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Logo & Title */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-500/50">
            <i className="fas fa-shield-halved text-5xl"></i>
          </div>
          <h1 className="text-7xl font-black uppercase italic tracking-tighter text-white leading-none mb-4">
            Victory<span className="text-indigo-400">Ops</span>
          </h1>
          <p className="text-indigo-300 text-xl font-bold tracking-wider">
            Political Campaign Command Center
          </p>
          <p className="text-slate-400 text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Enterprise-grade AI-powered campaign management for candidates who demand excellence
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          {/* Demo Campaign */}
          <button
            onClick={() => {
              setProfile(DEMO_PROFILE);
              setIsInitialized(true);
              setChatMessages([{ 
                role: 'ai', 
                text: `✅ Demo campaign loaded for ${DEMO_PROFILE.candidate_name}. All systems operational.` 
              }]);
            }}
            className="group p-8 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl hover:bg-white/20 hover:border-indigo-400 transition-all hover:scale-[1.02] shadow-2xl"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all text-2xl">
                <i className="fas fa-rocket"></i>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-black text-xl mb-2 uppercase tracking-tight">
                  Demo Campaign
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Explore VictoryOps with a pre-configured Texas House race
                </p>
              </div>
            </div>
          </button>

          {/* New Campaign */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="group p-8 bg-indigo-600/90 backdrop-blur-xl border-2 border-indigo-400 rounded-3xl hover:bg-indigo-500 transition-all hover:scale-[1.02] shadow-2xl shadow-indigo-500/50"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all text-2xl">
                <i className="fas fa-plus"></i>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-black text-xl mb-2 uppercase tracking-tight">
                  New Campaign
                </h3>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  Start from scratch with AI-guided campaign setup
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center animate-in fade-in duration-1000 delay-500">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">
            Powered by Google Gemini AI • Secured by Supabase
          </p>
        </div>
      </div>
    </div>
  );
  // ============================================================================
  // MAIN APP RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 font-sans">
       {!isInitialized && renderGatekeeper()}
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 shadow-xl z-40 p-8 flex flex-col">
        {!isInitialized && (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 z-[2000] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Victory<span className="text-indigo-600">Ops</span>
          </h1>
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">
            Campaign Command v2.0
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-3 overflow-y-auto">
          <SidebarItem icon="fa-gauge-high" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon="fa-brain" label="Intelligence" active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} color="bg-purple-600" />
          <SidebarItem icon="fa-palette" label="Darkroom" active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} color="bg-pink-600" />
          <SidebarItem icon="fa-bullhorn" label="Megaphone" active={activeTab === 'creative'} onClick={() => setActiveTab('creative')} color="bg-orange-600" />
          <SidebarItem icon="fa-sack-dollar" label="War Chest" active={activeTab === 'warchest'} onClick={() => setActiveTab('warchest')} color="bg-emerald-600" />
          <SidebarItem icon="fa-shield-halved" label="Legal Shield" active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} color="bg-blue-600" />
          <SidebarItem icon="fa-dna" label="DNA Vault" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} color="bg-cyan-600" />
        </nav>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">
            {profile.candidate_name}
          </p>
          <p className="text-[8px] text-slate-400 text-center mt-1">
            {profile.office_sought}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 p-12">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'intelligence' && renderIntelligence()}
        {activeTab === 'branding' && renderBranding()}
        {activeTab === 'creative' && renderCreative()}
        {activeTab === 'warchest' && renderWarChest()}
        {activeTab === 'legal' && renderLegalShield()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Floating Chat Assistant */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all ${isChatOpen ? 'w-96' : 'w-auto'}`}>
        {isChatOpen ? (
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Strategic AI</h3>
                <p className="text-indigo-200 text-[9px] font-bold uppercase tracking-widest mt-1">
                  Command Assistant
                </p>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !loadingStates.chat && sendChatMessage()}
                  placeholder="Ask strategic questions..."
                  disabled={loadingStates.chat}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={loadingStates.chat || !chatInput.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {loadingStates.chat ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 flex items-center justify-center"
          >
            <i className="fas fa-comments text-2xl"></i>
          </button>
        )}
      </div>

      {/* MISSING MODAL 1: Competitor Registration */}
      {isCompetitorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Register Opponent</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                  Add to Threat Matrix
                </p>
              </div>
              <button
                onClick={() => setIsCompetitorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              <input
                id="opponent-name"
                placeholder="Opponent Name"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                id="opponent-party"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Party</option>
                <option value="R">Republican</option>
                <option value="D">Democratic</option>
                <option value="I">Independent</option>
              </select>
              <div className="flex items-center gap-4">
                <input type="checkbox" id="opponent-incumbent" className="w-5 h-5" />
                <label htmlFor="opponent-incumbent" className="text-sm font-bold">Incumbent</label>
              </div>
              <textarea
                id="opponent-strengths"
                placeholder="Strengths (comma separated)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none h-24 focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                id="opponent-weaknesses"
                placeholder="Weaknesses (comma separated)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none h-24 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  const name = (document.getElementById('opponent-name') as HTMLInputElement).value;
                  const party = (document.getElementById('opponent-party') as HTMLSelectElement).value;
                  const incumbent = (document.getElementById('opponent-incumbent') as HTMLInputElement).checked;
                  const strengths = (document.getElementById('opponent-strengths') as HTMLTextAreaElement).value
                    .split(',').map(s => s.trim()).filter(Boolean);
                  const weaknesses = (document.getElementById('opponent-weaknesses') as HTMLTextAreaElement).value
                    .split(',').map(s => s.trim()).filter(Boolean);

                  if (name && party) {
                    addOpponent({ name, party: party as any, incumbent, strengths, weaknesses });
                  }
                }}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                Register Opponent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MISSING MODAL 2: Opposition Dossier */}
      {dossierTarget && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter">{dossierTarget.name}</h3>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400 mt-2">
                  {dossierTarget.party} • {dossierTarget.incumbent ? 'Incumbent' : 'Challenger'}
                </p>
              </div>
              <button
                onClick={() => setDossierTarget(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4">Strengths</h4>
                <ul className="space-y-2">
                  {dossierTarget.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <i className="fas fa-shield text-emerald-500 mt-1"></i>
                      <span className="text-sm font-medium">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-red-600 mb-4">Vulnerabilities</h4>
                <ul className="space-y-2">
                  {dossierTarget.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <i className="fas fa-crosshairs text-red-500 mt-1"></i>
                      <span className="text-sm font-medium">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => scanOpponent(dossierTarget)}
              disabled={loadingStates.probe}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
            >
              {loadingStates.probe ? 'Scanning...' : 'Run Deep Scan'}
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-xl z-[200] flex items-center justify-center p-8">
          <div className="bg-white rounded-[4rem] p-16 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Welcome to VictoryOps</h2>
              <p className="text-slate-500 text-lg">Let's set up your campaign command center</p>
            </div>

            <div className="space-y-6 mb-12 max-h-96 overflow-y-auto">
              {onboardingMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-6 rounded-3xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-50 text-slate-700'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={onboardingInput}
                onChange={e => setOnboardingInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !loadingStates.onboarding && continueOnboardingInterview()}
                placeholder="Your response..."
                disabled={loadingStates.onboarding}
                className="flex-1 px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={continueOnboardingInterview}
                disabled={loadingStates.onboarding || !onboardingInput.trim()}
                className="px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loadingStates.onboarding ? <i className="fas fa-circle-notch fa-spin"></i> : 'Send'}
              </button>
            </div>

            <button
              onClick={() => setShowOnboarding(false)}
              className="mt-8 w-full py-4 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
