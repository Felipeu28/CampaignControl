// ============================================================================
// SECTION 1: POLITICAL CAMPAIGN SCHEMA - TYPES & INTERFACES
// ============================================================================

/**
 * Interface representing the detailed candidate background and identity
 * NOW: Central Intelligence Brain with 5 domains
 */
export interface CampaignDNA {
  // ============================================
  // CANDIDATE DNA - Who We Are
  // ============================================
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
  
  // ============================================
  // DISTRICT INTELLIGENCE - Our Battlefield
  // ============================================
  district_intelligence?: {
    demographics: {
      population: number | null;
      median_age: number | null;
      median_income: number | null;
      education_level: string | null;
      racial_composition: string | null;
      urban_rural_mix: string | null;
      last_updated: string | null;
    };
    political_landscape: {
      registration_breakdown: Record<string, number> | null;
      recent_election_results: any | null;
      swing_district: boolean | null;
      partisan_lean: string | null;
      voter_turnout_history: any | null;
      last_updated: string | null;
    };
    key_issues: {
      top_priorities: string[];
      economic_concerns: string[];
      social_issues: string[];
      local_hot_topics: string[];
      last_updated: string | null;
    };
    media_landscape: {
      local_news_outlets: string[];
      influential_voices: string[];
      social_media_reach: any | null;
      coverage_history: any | null;
      last_updated: string | null;
    };
    geographic_intel: {
      key_neighborhoods: string[];
      priority_precincts: string[];
      strong_areas: string[];
      weak_areas: string[];
      last_updated: string | null;
    };
  };
  
  // ============================================
  // OPPOSITION INTELLIGENCE - Who We're Fighting
  // ============================================
  opposition_intelligence?: {
    known_opponents: Array<{
      name: string;
      party: string;
      incumbent: boolean;
      strengths: string[];
      weaknesses: string[];
    }>;
    incumbent_analysis: {
      name: string | null;
      tenure: number | null;
      voting_record_summary: string | null;
      major_accomplishments: string[];
      vulnerabilities: string[];
      approval_rating: number | null;
      last_updated: string | null;
    };
    competitive_positioning: {
      our_advantages: string[];
      our_challenges: string[];
      contrast_points: string[];
      attack_vulnerabilities: string[];
      last_updated: string | null;
    };
    opposition_research_snapshots: any[];
    last_comprehensive_scan: string | null;
  };
  
  // ============================================
  // COMPLIANCE INTELLIGENCE - Rules of Engagement
  // ============================================
  compliance_intelligence?: {
    filing_requirements: {
      forms_needed: string[];
      deadlines: string[];
      fees: number | null;
      signature_requirements: number | null;
      last_updated: string | null;
    };
    contribution_rules: {
      individual_limit: number | null;
      pac_limit: number | null;
      corporate_restrictions: string | null;
      prohibited_sources: string[];
      last_updated: string | null;
    };
    reporting_requirements: {
      frequency: string | null;
      platforms: string[];
      next_deadline: string | null;
      last_updated: string | null;
    };
    ballot_access: {
      method: string | null;
      status: string | null;
      progress: number | null;
      last_updated: string | null;
    };
  };
  
  // ============================================
  // FUNDRAISING INTELLIGENCE - Money Landscape
  // ============================================
  fundraising_intelligence?: {
    district_wealth: {
      median_household_income: number | null;
      high_net_worth_concentration: number | null;
      major_employers: string[];
      donor_potential_score: number | null;
      last_updated: string | null;
    };
    typical_race_costs: {
      low_range: number | null;
      high_range: number | null;
      average: number | null;
      recommended_budget: number | null;
      last_updated: string | null;
    };
    donor_landscape: {
      known_major_donors: any[];
      pac_presence: any[];
      bundler_networks: any[];
      fundraising_events_history: any[];
      last_updated: string | null;
    };
    competitive_fundraising: {
      opponent_warchest_estimates: any[];
      spending_patterns: any | null;
      last_updated: string | null;
    };
  };
  
  // ============================================
  // STRATEGIC SYNTHESIS - Master Battle Plan
  // ============================================
  strategic_synthesis?: {
    campaign_thesis: string | null;
    winning_coalition: string | null;
    theory_of_victory: string | null;
    key_messages: string[];
    contrast_strategy: string | null;
    resource_allocation_strategy: string | null;
    last_synthesized: string | null;
  };
  
  // ============================================
  // INTELLIGENCE METADATA
  // ============================================
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
  probability?: number;  // Alias for likelihood (App.tsx compatibility)
}

export interface FundraisingIntel {
  potential_pacs: { name: string; focus: string; alignment_score: number }[];
  top_local_donors: { name: string; total_donated_regionally: number; last_sector: string }[];
  historical_patterns: string;
}

export interface BudgetEstimate {
  categories: {
    // Personnel
    staff_salaries: number;
    consultants: number;
    
    // Voter Contact
    advertising_digital: number;
    advertising_print: number;
    direct_mail: number;
    sms_messaging: number;
    
    // Operations
    events: number;
    voter_file_data: number;
    compliance_legal: number;
    office_ops: number;
    
    // Reserve
    emergency_reserve: number;
  };
  total_projected_needed: number;
  cost_per_vote?: number;  // Made optional
}

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
  disclaimers: Record<string, string>;  // âœ… THIS LINE IS KEY
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

export interface CampaignProfileRow {
  id?: string;
  session_id: string;
  candidate_name: string;
  office_sought: string; // e.g., "Texas House District 52"
  district_id: string; // e.g., "TX-HD-52"
  party: 'R' | 'D' | 'I' | 'L' | 'G' | 'NP' | string;
  
  // Demographics & targeting
  voter_research: string | null;
  district_demographics: Demographics | null;
  
  // Campaign specifics
  filing_info: {
    filing_deadline: string; // ISO date
    petition_signatures_required: number;
    filing_fee: number;
    forms_required: string[];
    election_date: string; // ISO date
    primary_date?: string; // ISO date if applicable
  } | null;
  
  compliance_tracker: {
    next_report_due: string; // ISO date
    contribution_limit: number;
    total_raised: number;
    total_spent: number;
    last_report_filed: string; // ISO date
  } | null;
  
  metadata: {
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
  };
  
  created_at?: string;
  updated_at?: string;
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
  
  // Added aliases for calculateVoteGoal compatibility:
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
