
// ============================================================================
// SECTION 1: POLITICAL CAMPAIGN SCHEMA - DATA TRANSFORMATION FUNCTIONS
// ============================================================================

import { VoteGoal, VoterRecord, VoterSegment, Demographics, CampaignProfileRow, CampaignNeedType } from '../types';

/**
 * Electoral math calculator
 * Implementation based on historical turnout and margin for safety.
 */
export function calculateVoteGoal(
  totalRegistered: number,
  historicalTurnout: number, // e.g., 0.42 for 42%
  marginForSafety: number = 0.05, // 5% cushion
  opponentCount: number = 1
): VoteGoal {
  const expectedTotalVotes = Math.round(totalRegistered * historicalTurnout);
  
  let baseVotesNeeded: number;
  if (opponentCount === 1) {
    baseVotesNeeded = Math.floor(expectedTotalVotes / 2) + 1;
  } else {
    // Crowded field estimate
    baseVotesNeeded = Math.round(expectedTotalVotes * 0.40);
  }
  
  const marginVotes = Math.round(expectedTotalVotes * marginForSafety);
  const targetVoteGoal = baseVotesNeeded + marginVotes;
  
  return {
    total_registered_voters: totalRegistered,
    expected_turnout_percentage: historicalTurnout * 100,
    expected_total_votes: expectedTotalVotes,
    votes_needed_to_win: baseVotesNeeded,
    margin_for_safety: marginVotes,
    target_vote_goal: targetVoteGoal,
    
    breakdown: {
      hard_support: 0,
      soft_support: 0,
      persuasion_target: 0,
      gotv_target: 0,
    }
  };
}

/**
 * Texas Election Code Disclaimer Generator
 * Generates specific "Paid for by..." text based on media type.
 */
export function generateTexasDisclaimer(
  type: 'digital' | 'print' | 'sms' | 'radio',
  candidate: string,
  treasurer: string,
  address: string
): string {
  const cleanCandidate = candidate || "[CANDIDATE NAME]";
  const cleanTreasurer = treasurer || "[TREASURER NAME]";
  const cleanAddress = address || "[CAMPAIGN ADDRESS]";

  const base = `Pol. Ad. paid for by the ${cleanCandidate} Campaign, ${cleanTreasurer}, Treasurer.`;

  switch (type) {
    case 'print':
      // Requires the specific "Political Advertising" label often
      return `${base} | ${cleanAddress} | NOTICE: IT IS A VIOLATION OF STATE LAW (CHAPTERS 392 AND 393, TRANSPORTATION CODE), TO PLACE THIS SIGN IN THE RIGHT-OF-WAY OF A HIGHWAY.`;
    case 'sms':
      return `Paid for by ${cleanCandidate}. ${cleanTreasurer}, Treas. ${cleanAddress}. Reply STOP to opt-out.`;
    case 'radio':
      return `Paid for by the ${cleanCandidate} campaign, ${cleanTreasurer}, Treasurer.`;
    case 'digital':
    default:
      return base;
  }
}

/**
 * Parse voter file CSV
 * Simulates processing a large CSV and extracting summary stats.
 */
export async function parseVoterFile(
  csvContent: string
): Promise<{
  voters: VoterRecord[];
  summary: {
    total: number;
    byParty: Record<string, number>;
    byPrecinct: Record<string, number>;
    likelyVoters: number;
    sporadicVoters: number;
    newVoters: number;
  };
}> {
  const rows = csvContent.split('\n').filter(r => r.trim());
  
  const voters: VoterRecord[] = rows.slice(1).map((row, i) => {
    const cells = row.split(',');
    return {
      voter_id: cells[0] || `V${i}`,
      first_name: cells[1] || 'Voter',
      last_name: cells[2] || `${i}`,
      address: cells[3] || '123 Main St',
      city: cells[4] || 'City',
      zip: cells[5] || '12345',
      precinct: cells[6] || '001',
      party: cells[7] || 'NP',
      registration_date: '2020-01-01',
      voting_history: { '2024_general': Math.random() > 0.5 },
    };
  });

  const byParty = voters.reduce((acc, v) => {
    acc[v.party] = (acc[v.party] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    voters,
    summary: {
      total: voters.length,
      byParty,
      byPrecinct: {},
      likelyVoters: Math.round(voters.length * 0.35),
      sporadicVoters: Math.round(voters.length * 0.45),
      newVoters: Math.round(voters.length * 0.1),
    }
  };
}

/**
 * Validates campaign profile completeness
 */
export function validateCampaignProfile(profile: CampaignProfileRow | null) {
  if (!profile) return { isComplete: false, missingFields: ['No campaign profile found'] };
  const missing = [];
  if (!profile.candidate_name) missing.push('Candidate Name');
  if (!profile.office_sought) missing.push('Office Sought');
  if (!profile.district_id) missing.push('District ID');
  return { isComplete: missing.length === 0, missingFields: missing };
}

/**
 * Intelligent categorization of campaign needs from natural language
 */
export function detectCampaignNeed(message: string): CampaignNeedType {
  const m = message.toLowerCase();
  if (/win|victory|path to win|vote goal|how many votes/i.test(m)) return 'path_to_victory';
  if (/voter|reach|contact|knock|phone|script|canvas/i.test(m)) return 'voter_contact_plan';
  if (/budget|cost|price|money|fundraise/i.test(m)) return 'budget_allocation';
  if (/happen|news|trending|issue|opponent|landscape/i.test(m)) return 'message_positioning';
  return 'general_campaign';
}

