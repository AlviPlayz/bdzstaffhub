
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
