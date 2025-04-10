
export type StaffRole = 'Moderator' | 'Builder' | 'Manager' | 'Owner';

export type LetterGrade = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'E' | 'E-' | 'SSS+' | 'Immeasurable';

export interface PerformanceMetric {
  id: string;
  name: string;
  score: number;
  letterGrade: LetterGrade;
}

export interface ModeratorMetrics {
  responsiveness: PerformanceMetric;
  fairness: PerformanceMetric;
  communication: PerformanceMetric;
  conflictResolution: PerformanceMetric;
  ruleEnforcement: PerformanceMetric;
  engagement: PerformanceMetric;
  supportiveness: PerformanceMetric;
  adaptability: PerformanceMetric;
  objectivity: PerformanceMetric;
  initiative: PerformanceMetric;
}

export interface BuilderMetrics {
  exterior: PerformanceMetric;
  interior: PerformanceMetric;
  decoration: PerformanceMetric;
  effort: PerformanceMetric;
  contribution: PerformanceMetric;
  communication: PerformanceMetric;
  adaptability: PerformanceMetric;
  cooperativeness: PerformanceMetric;
  creativity: PerformanceMetric;
  consistency: PerformanceMetric;
}

export type ManagerMetrics = ModeratorMetrics & BuilderMetrics;

export type OwnerMetrics = ManagerMetrics;

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  rank?: string;
  avatar: string;
  metrics: ModeratorMetrics | BuilderMetrics | ManagerMetrics | OwnerMetrics;
  overallScore: number;
  overallGrade: LetterGrade;
}
