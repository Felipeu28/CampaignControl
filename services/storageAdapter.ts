import { supabase, getCurrentUser } from './supabaseClient';
import type { CampaignProfileRow } from '../types';

const STORAGE_KEY = 'victory_ops_v3_state';

// Migration helper: Load from localStorage, save to Supabase
export const migrateLocalStorageToSupabase = async () => {
  const user = await getCurrentUser();
  if (!user) return;

  const localData = localStorage.getItem(STORAGE_KEY);
  if (!localData) return;

  try {
    const parsed = JSON.parse(localData);
    
    // Save campaign profile
    if (parsed.profile?.candidate_name) {
      const { error } = await supabase
        .from('campaigns')
        .upsert({
          user_id: user.id,
          session_id: parsed.profile.session_id,
          candidate_name: parsed.profile.candidate_name,
          office_sought: parsed.profile.office_sought,
          district_id: parsed.profile.district_id,
          party: parsed.profile.party,
          voter_research: parsed.profile.voter_research,
          district_demographics: parsed.profile.district_demographics,
          filing_info: parsed.profile.filing_info,
          compliance_tracker: parsed.profile.compliance_tracker,
          metadata: parsed.profile.metadata,
        });
      
      if (!error) {
        console.log('✅ Migration successful: localStorage → Supabase');
        // Optional: Clear localStorage after successful migration
        // localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error('Migration failed:', e);
  }
};

// Load campaign from Supabase
export const loadCampaign = async (campaignId: string) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();
  
  if (error) throw error;
  return data;
};

// Save campaign to Supabase
export const saveCampaign = async (profile: CampaignProfileRow) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('campaigns')
    .upsert({
      user_id: user.id,
      session_id: profile.session_id,
      candidate_name: profile.candidate_name,
      office_sought: profile.office_sought,
      district_id: profile.district_id,
      party: profile.party,
      voter_research: profile.voter_research,
      district_demographics: profile.district_demographics,
      filing_info: profile.filing_info,
      compliance_tracker: profile.compliance_tracker,
      metadata: profile.metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all campaigns for current user
export const getUserCampaigns = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};
