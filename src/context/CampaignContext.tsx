import React, { createContext, useContext, useState, useEffect } from 'react';
import { CampaignProfileRow, LoadingStates, ResearchMode, ResearchSnapshot, CreativeAsset, EnhancedCreativeAsset } from '../types';
// import { calculateVoteGoal } from '../services/campaignLogic'; // We'll need to move services too eventually or organize imports

// ============================================================================
// DEFAULT STATE (Migrated from App.tsx)
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
        vote_goal: {
            total_registered_voters: 82000,
            expected_turnout_percentage: 44,
            expected_total_votes: 36080,
            votes_needed_to_win: 18041,
            margin_for_safety: 1804,
            target_vote_goal: 19845,
            breakdown: {
                hard_support: 0,
                soft_support: 0,
                persuasion_target: 0,
                gotv_target: 0,
            }
        },
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
                status: 'contacted',
                notes: 'Interested in tech-friendly policies'
            },
            {
                id: 'donor-2',
                name: 'Education First Coalition',
                target_amount: 3500,
                likelihood: 60,
                status: 'identified',
                notes: 'School funding advocates'
            }
        ],
        legal_shield: {
            ballot_access: {
                method: 'signatures',
                fee_amount: 750,
                fee_paid: false,
                signatures_required: 500,
                signatures_collected: 342,
                safety_buffer_percentage: 20,
                deadline: '2025-03-01',
                status: 'in_progress'
            },
            disclaimers: {},
            required_forms: [
                { name: 'Form CTA', description: 'Campaign Treasurer Appointment', filed: true },
                { name: 'Form CFCP', description: 'Campaign Finance Report', filed: true },
                { name: 'Form CFCR', description: 'Campaign Finance Corrected Report', filed: false }
            ],
            reporting_schedule: [
                {
                    id: 'deadline-1',
                    title: '8-day Pre-General Report',
                    date: '2025-07-15',
                    description: 'Campaign finance report due 8 days before general election',
                    status: 'pending'
                },
                {
                    id: 'deadline-2',
                    title: 'Final Report',
                    date: '2026-01-15',
                    description: 'Post-election final campaign finance report',
                    status: 'pending'
                }
            ],
            tec_reporting: {
                next_deadline: '2025-07-15',
                report_type: '8-day pre-general',
                auto_reminders: true
            }
        },
        dna: {
            // DNA initialized empty, populated by intelligent features
            intelligence_completeness: {
                candidate_dna: 0,
                district_intel: 0,
                opposition_intel: 0,
                compliance_intel: 0,
                fundraising_intel: 0,
                overall_score: 0
            }
        }
    }
};

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

interface CampaignContextType {
    profile: CampaignProfileRow;
    updateProfile: (updates: Partial<CampaignProfileRow>) => void;
    updateMetadata: (updates: Partial<CampaignProfileRow['metadata']>) => void;
    loadingStates: LoadingStates;
    setLoading: (key: keyof LoadingStates, value: boolean) => void;
    activeResearchMode: ResearchMode;
    setActiveResearchMode: (mode: ResearchMode) => void;

    // New State Additions
    researchVault: ResearchSnapshot[];
    setResearchVault: React.Dispatch<React.SetStateAction<ResearchSnapshot[]>>;
    chatMessages: Array<{ role: 'user' | 'ai'; text: string }>;
    addChatMessage: (role: 'user' | 'ai', text: string) => void;

    // Creative Assets
    creativeAssets: CreativeAsset[];
    setCreativeAssets: React.Dispatch<React.SetStateAction<CreativeAsset[]>>;
    activeCreativeAsset: CreativeAsset | null;
    setActiveCreativeAsset: (asset: CreativeAsset | null) => void;

    // Branding Assets (Images)
    brandingAssets: EnhancedCreativeAsset[];
    setBrandingAssets: React.Dispatch<React.SetStateAction<EnhancedCreativeAsset[]>>;

    // Analysis Results
    budgetAuditResult: string | null;
    setBudgetAuditResult: React.Dispatch<React.SetStateAction<string | null>>;
    legalAuditResult: string | null;
    setLegalAuditResult: React.Dispatch<React.SetStateAction<string | null>>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<CampaignProfileRow>(DEMO_PROFILE);
    const [researchMode, setResearchMode] = useState<ResearchMode>('ECONOMIC');
    const [researchVault, setResearchVault] = useState<ResearchSnapshot[]>([]);

    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
        { role: 'ai', text: 'VictoryOps systems online. Strategic Command Assistant ready.' }
    ]);

    // Creative State
    const [creativeAssets, setCreativeAssets] = useState<CreativeAsset[]>([]);
    const [activeCreativeAsset, setActiveCreativeAsset] = useState<CreativeAsset | null>(null);
    const [brandingAssets, setBrandingAssets] = useState<EnhancedCreativeAsset[]>([]);

    // Analysis State
    const [budgetAuditResult, setBudgetAuditResult] = useState<string | null>(null);
    const [legalAuditResult, setLegalAuditResult] = useState<string | null>(null);

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

    const updateProfile = (updates: Partial<CampaignProfileRow>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const updateMetadata = (updates: Partial<CampaignProfileRow['metadata']>) => {
        setProfile(prev => ({
            ...prev,
            metadata: { ...prev.metadata, ...updates }
        }));
    };

    const setLoading = (key: keyof LoadingStates, value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    const addChatMessage = (role: 'user' | 'ai', text: string) => {
        setChatMessages(prev => [...prev, { role, text }]);
    };

    return (
        <CampaignContext.Provider value={{
            profile,
            updateProfile,
            updateMetadata,
            loadingStates,
            setLoading,
            activeResearchMode: researchMode,
            setActiveResearchMode: setResearchMode,
            researchVault,
            setResearchVault,
            chatMessages,
            addChatMessage,
            creativeAssets,
            setCreativeAssets,
            activeCreativeAsset,
            setActiveCreativeAsset,
            brandingAssets,
            setBrandingAssets,
            budgetAuditResult,
            setBudgetAuditResult,
            legalAuditResult,
            setLegalAuditResult
        }}>
            {children}
        </CampaignContext.Provider>
    );
};

export const useCampaign = () => {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider');
    }
    return context;
};
