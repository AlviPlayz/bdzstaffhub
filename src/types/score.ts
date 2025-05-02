
export interface ScoreEvent {
  id: string;
  staff_id: string;
  action: string;
  points: number;
  source: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface ActionWeight {
  id: string;
  action: string;
  weight: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiToken {
  id: string;
  token: string;
  name: string;
  source: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface ScoreEventRequest {
  staffId: string;
  action: string;
  source: string;
  metadata?: Record<string, any>;
}
