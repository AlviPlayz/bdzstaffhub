
export type StaffTableName = 'moderators' | 'builders' | 'managers';

export interface SupabaseMetric {
  id: string;
  score: number;
  letter_grade: string;
}

export interface SupabaseModerator {
  id: uuid;
  staff_id: string;
  name: string;
  rank: string;
  profile_image_url?: string | null;
  responsiveness: number;
  fairness: number;
  communication: number;
  conflict_resolution: number;
  rule_enforcement: number;
  engagement: number;
  supportiveness: number;
  adaptability: number;
  objectivity: number;
  initiative: number;
  overall_grade: string;
  created_at?: string;
}

export interface SupabaseBuilder {
  id: uuid;
  staff_id: string;
  name: string;
  rank: string;
  profile_image_url?: string | null;
  exterior: number;
  interior: number;
  decoration: number;
  effort: number;
  contribution: number;
  communication: number;
  adaptability: number;
  cooperativeness: number;
  creativity: number;
  consistency: number;
  overall_grade: string;
  created_at?: string;
}

export interface SupabaseManager {
  id: uuid;
  staff_id: string;
  name: string;
  rank: string;
  profile_image_url?: string | null;
  // Moderator metrics
  responsiveness: number;
  fairness: number;
  communication: number;
  conflict_resolution: number;
  rule_enforcement: number;
  engagement: number;
  supportiveness: number;
  adaptability: number;
  objectivity: number;
  initiative: number;
  // Builder metrics
  exterior: number;
  interior: number;
  decoration: number;
  effort: number;
  contribution: number;
  cooperativeness: number;
  creativity: number;
  consistency: number;
  overall_grade: string;
  created_at?: string;
}

// Helper type for Supabase queries
export type uuid = string;
