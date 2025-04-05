
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

// Role-specific constants for immutability enforcement
export const ROLE_CONSTANTS = {
  OWNER: {
    ROLE: 'Owner' as const,
    RANK: 'Owner' as const,
    GRADE: 'SSS+' as const,
    TOOLTIP: 'Owner of the Realm' as const
  },
  MANAGER: {
    ROLE: 'Manager' as const,
    RANK: 'Manager' as const,
    GRADE: 'SSS+' as const
  }
};

// Simplified validation function - just checks that the rank matches the role for Manager/Owner
export const validateRoleRankCombination = (role: StaffRole, rank: string): boolean => {
  if (role === 'Owner' && rank !== 'Owner') {
    return false;
  }
  
  if (role === 'Manager' && rank !== 'Manager') {
    return false;
  }
  
  return true;
};

// Simplified enforcement function - just ensures correct rank for role
export const enforceRoleRankCombination = (staff: Partial<StaffMember>): Partial<StaffMember> => {
  const updatedStaff = { ...staff };
  
  if (updatedStaff.role === 'Owner') {
    updatedStaff.rank = 'Owner';
    updatedStaff.overallGrade = 'SSS+';
  } else if (updatedStaff.role === 'Manager') {
    updatedStaff.rank = 'Manager';
    updatedStaff.overallGrade = 'SSS+';
  }
  
  return updatedStaff;
};
