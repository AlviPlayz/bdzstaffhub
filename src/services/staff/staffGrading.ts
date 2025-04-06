
import { LetterGrade, StaffRole, PerformanceMetric } from '@/types/staff';

/**
 * Calculate the letter grade based on a numeric score
 * @param score Numeric score (0-10)
 * @param role Optional role parameter to give special grades
 * @returns Letter grade
 */
export const calculateLetterGrade = (score: number, role?: StaffRole): LetterGrade => {
  // Special case for managers 
  if (role === 'Manager') {
    return 'SSS+';
  }
  
  // Normal grade calculation for other roles
  if (score >= 9.5) return 'S+';
  if (score >= 8.5) return 'S';
  if (score >= 7.5) return 'A+';
  if (score >= 6.5) return 'A';
  if (score >= 5.5) return 'B+';
  if (score >= 4.5) return 'B';
  if (score >= 3.5) return 'C';
  if (score >= 2.5) return 'D';
  if (score >= 1) return 'E';
  return 'E-';
};

/**
 * Helper function to create an "Immeasurable" performance metric
 */
export const createImmeasurableMetric = (name: string): PerformanceMetric => {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    score: 10, // We'll give it a 10 score for calculation purposes
    letterGrade: 'SSS+'
  };
};

/**
 * Create a set of Immeasurable metrics for Manager
 */
export const createImmeasurableMetrics = (role: 'Manager'): Record<string, PerformanceMetric> => {
  return {
    // Moderator metrics
    responsiveness: createImmeasurableMetric('Responsiveness'),
    fairness: createImmeasurableMetric('Fairness'),
    communication: createImmeasurableMetric('Communication'),
    conflictResolution: createImmeasurableMetric('Conflict Resolution'),
    ruleEnforcement: createImmeasurableMetric('Rule Enforcement'),
    engagement: createImmeasurableMetric('Engagement'),
    supportiveness: createImmeasurableMetric('Supportiveness'),
    adaptability: createImmeasurableMetric('Adaptability'),
    objectivity: createImmeasurableMetric('Objectivity'),
    initiative: createImmeasurableMetric('Initiative'),
    // Builder metrics
    exterior: createImmeasurableMetric('Exterior'),
    interior: createImmeasurableMetric('Interior'),
    decoration: createImmeasurableMetric('Decoration'),
    effort: createImmeasurableMetric('Effort'),
    contribution: createImmeasurableMetric('Contribution'),
    cooperativeness: createImmeasurableMetric('Cooperativeness'),
    creativity: createImmeasurableMetric('Creativity'),
    consistency: createImmeasurableMetric('Consistency')
  };
};

/**
 * Get color class based on letter grade
 */
export const getGradeColorClass = (grade: LetterGrade): string => {
  switch(grade) {
    case 'Immeasurable': return 'text-[#ff00ff] font-bold';
    case 'SSS+': return 'text-[#ff00ff] font-bold';
    case 'S+': return 'text-[#ff9900] font-bold';
    case 'S': return 'text-[#ffcc00] font-bold';
    case 'A+': return 'text-[#99ff00] font-bold';
    case 'A': return 'text-[#33cc33] font-bold';
    case 'B+': return 'text-[#00ccff] font-bold';
    case 'B': return 'text-[#3399ff] font-bold';
    case 'C': return 'text-[#cc99ff] font-bold';
    case 'D': return 'text-[#ff6666] font-bold';
    case 'E': return 'text-[#cc3300] font-bold';
    case 'E-': return 'text-[#990000] font-bold';
    default: return 'text-white font-bold';
  }
};
