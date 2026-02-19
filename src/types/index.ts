// ============================================================================
// VICTORYOPS V2 - UNIFIED TYPE DEFINITIONS
// ============================================================================

// ============================================================================
// INTELLIGENCE MODULE TYPES
// ============================================================================

export type ResearchMode = 'ECONOMIC' | 'SENTIMENT' | 'POLICY' | 'OPPOSITION' | 
                           'MEDIA' | 'REGISTRATION' | 'SOCIAL' | 'FUNDRAISING' | 
                           'GEOGRAPHY' | 'ETHICS';

export interface ResearchSnapshot {
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
  error?: string;
  signal?: string; // Legacy compat
  threat?: string; // Legacy compat
  action?: string; // Legacy compat
}

// ============================================================================
// BRANDING & CREATIVE TYPES
// ============================================================================

export interface ImagePrompt {
  subject: string;
  env: string;
  style: string;
}

export interface CreativeAsset {
  id: string;
  type: string;
  title: string;
  content?: string; // For text-based assets
  mediaUrl?: string; // For image/video base64 or uris
  mediaType: 'text' | 'image' | 'video';
  status: 'draft' | 'final';
  prompt?: string; // The AI prompt used to generate
  metadata?: any;  // Added for enhanced asset tracking
}

export interface EnhancedCreativeAsset extends CreativeAsset {
  metadata?: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
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

// ============================================================================
// CAMPAIGN CORE TYPES
// ============================================================================

export interface CampaignProfileRow {
  id?: string;
  session_id: string;
  candidate_name: string;
  office_sought: string;
  district_id: string;
  party: 'R' | 'D' | 'I' | 'L' | 'G' | 'NP' | string;
  
  // Demographics & targeting
  voter_research: string | null;
  district_demographics: Demographics | null;
  
  // Campaign specifics
  filing_info: FilingInfo | null;
  compliance_tracker: ComplianceTracker | null;
  
  metadata: CampaignMetadata;
  
  created_at?: string;
  updated_at?: string;
}

export interface FilingInfo {
  filing_deadline: string; // ISO date
  petition_signatures_required: number;
  filing_fee: number;
  forms_required: string[];
  election_date: string; // ISO date
  primary_date?: string; // ISO date if applicable
}

export interface ComplianceTracker {
  next_report_due: string; // ISO date
  contribution_limit: number;
  total_raised: number;
  total_spent: number;
  last_report_filed: string; // ISO date
}

export interface CampaignMetadata {
  campaign_manager?: string;
  treasurer?: string;
  campaign_address?: string;
  website?: string;
  social_media?: Record<string, string>;
  
  opponents: Opponent[];
  voter_segments: VoterSegment[];
  vote_goal: VoteGoal;
  field_plan: FieldPlan;
  
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  threats?: string[];

  // Candidate DNA identity mapping
  dna?: CampaignDNA;
  
  // Fundraising & Budgeting
  fundraising_intel?: FundraisingIntel;
  budget_estimate?: BudgetEstimate;
  donor_leads?: DonorLead[];

  // Module 3: Legal Shield
  legal_shield?: LegalShieldData;
  
  // Module 4: Branding & Visuals
  branding_assets?: CreativeAsset[];

  // Module 5: Strategic Reports
  strategic_reports?: StrategicReport[];
  
  __docFlow?: Record<string, any>;
  __documentState?: Record<string, any>;
}

// ============================================================================
// SUB-TYPES
// ============================================================================

export interface CampaignDNA {
  residency_duration?: string;
  marital_status?: string;
  family_status?: string;
  kids_details?: string;
  pets?: string;
  professional_status?: string;
  personal_finances?: string;
  reason_for_running?: string;
  constituencies?: string;
  unique_qualifications?: string;
  staffing_plans?: string;
  master_narrative?: string;
  source_text?: string;
  source_materials?: { 
    name: string; 
    timestamp?: string;
    type?: string;
    size?: number;
    uploadedAt?: string;
  }[];
  qualifications_check?: {
    age: boolean;
    location: boolean;
    registered_voter: boolean;
    residency_length: boolean;
  };
  willing_to_do?: string[];
  unwilling_to_do?: string[];
  core_values?: string[];
  personal_story?: string;
  policy_priorities?: string[];
  
  // Intelligence Sub-objects
  district_intelligence?: any; 
  opposition_intelligence?: any;
  compliance_intelligence?: any;
  fundraising_intelligence?: any;
  strategic_synthesis?: any;
  
  intelligence_completeness?: {
    candidate_dna: number;
    district_intel: number;
    opposition_intel: number;
    compliance_intel: number;
    fundraising_intel: number;
    overall_score: number;
  };
  last_full_refresh?: string | null;
  intelligence_version?: string;
}

export interface DonorLead {
  id: string;
  name: string;
  target_amount: number;
  likelihood: number; // 0-100
  status: 'identified' | 'contacted' | 'pledged' | 'received';
  notes?: string;
  probability?: number;  // Alias for likelihood
}

export interface FundraisingIntel {
  potential_pacs: { name: string; focus: string; alignment_score: number }[];
  top_local_donors: { name: string; total_donated_regionally: number; last_sector: string }[];
  historical_patterns: string;
}

export interface BudgetEstimate {
  categories: Record<string, number>;
  total_projected_needed: number;
  cost_per_vote?: number;
}

export interface StrategicReport {
  id: string;
  title: string;
  timestamp: string;
  content: string;
  status: 'draft' | 'final';
}

export interface Opponent {
  name: string;
  party: string;
  incumbent: boolean;
  funds_raised?: number;
  endorsements?: string[];
  strengths: string[];
  weaknesses: string[];
  voting_record?: string;
  public_statements?: string[];
}

export interface VoterSegment {
  name: string;
  size: number;
  party_breakdown: { D: number; R: number; I: number; NP: number };
  turnout_likelihood: 'high' | 'medium' | 'low';
  persuadability: 'hard_support' | 'soft_support' | 'persuadable' | 'soft_oppose' | 'hard_oppose';
  priority_issues: string[];
  preferred_contact: ('door' | 'phone' | 'text' | 'mail' | 'digital')[];
  demographics: {
    age_range?: string;
    income_range?: string;
    education?: string;
    race_ethnicity?: string;
  };
}

export interface VoteGoal {
  total_registered_voters: number;
  expected_turnout_percentage: number;
  expected_total_votes: number;
  votes_needed_to_win: number;
  margin_for_safety: number;
  target_vote_goal: number;
  breakdown: {
    hard_support: number;
    soft_support: number;
    persuasion_target: number;
    gotv_target: number;
  };
  total_registered?: number;
  expected_turnout_rate?: number;
  target_vote_share?: number;
  opponent_count?: number;
}

export interface FieldPlan {
  doors_to_knock: number;
  phone_calls_to_make: number;
  volunteers_needed: number;
  weeks_until_election: number;
  weekly_goals: {
    doors_per_week: number;
    calls_per_week: number;
    volunteer_shifts_per_week: number;
  };
  priority_precincts: string[];
  canvassing_universes: {
    persuasion: number;
    gotv: number;
  };
}

export interface VoterRecord {
  voter_id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  zip: string;
  precinct: string;
  party: string;
  registration_date: string;
  voting_history: Record<string, boolean>;
  age?: number;
  gender?: 'M' | 'F' | 'U';
  ethnicity?: string;
}

export interface Demographics {
  total_population: number;
  age_distribution: Record<string, number>;
  race_ethnicity: Record<string, number>;
  income: Record<string, any>;
  education: Record<string, number>;
  housing: { owner_occupied: number; renter_occupied: number };
}

export type CampaignNeedType = 
  | 'campaign_checkup' | 'path_to_victory' | 'voter_contact_plan' 
  | 'persuasion_pipeline' | 'message_positioning' | 'campaign_messaging' 
  | 'voter_commitment' | 'field_operations' | 'budget_allocation' 
  | 'volunteer_management' | 'candidate_resilience' | 'general_campaign';

export interface ComplianceDeadline {
  id: string;
  title: string;
  date: string;
  description: string;
  status: 'pending' | 'completed' | 'warning';
}

export interface LegalShieldData {
  ballot_access: {
    method: 'fee' | 'signatures';
    fee_amount: number;
    fee_paid: boolean;
    signatures_required: number;
    signatures_collected: number;
    safety_buffer_percentage: number;
    deadline?: string;
    status?: 'not_started' | 'in_progress' | 'complete';
  };
  disclaimers: Record<string, string>;
  required_forms: {
    name: string;
    description: string;
    filed: boolean;
    link?: string;
  }[];
  reporting_schedule: ComplianceDeadline[];
  tec_reporting?: {
    next_deadline: string;
    report_type: string;
    auto_reminders: boolean;
  };
  tec_forms?: Record<string, {
    required: boolean;
    filed: boolean;
    date_filed: string | null;
  }>;
}

// ============================================================================
// APP STATE TYPES
// ============================================================================

export interface LoadingStates {
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

export interface APIError {
  message: string;
  code?: string;
  timestamp: string;
}
