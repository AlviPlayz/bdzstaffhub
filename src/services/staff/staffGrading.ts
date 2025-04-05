
import { LetterGrade, StaffRole, PerformanceMetric } from '@/types/staff';

/**
 * Calculate the letter grade based on a numeric score
 * @param score Numeric score (0-10)
 * @param role Optional role parameter to give special grades
 * @returns Letter grade
 */
export const calculateLetterGrade = (score: number, role?: StaffRole): LetterGrade => {
  // Special case for managers and owners
  if (role === 'Manager' || role === 'Owner') {
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
    letterGrade: 'SSS+' // Changed from 'Immeasurable' to 'SSS+'
  };
};

/**
 * Create a set of Immeasurable metrics for Manager or Owner
 */
export const createImmeasurableMetrics = (role: 'Manager' | 'Owner'): Record<string, PerformanceMetric> => {
  // Same implementation for both Manager and Owner roles
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
    consistency: createImmeasurableMetric('Consistency'),
  };
};

/**
 * Get the color class for a given grade
 */
export const getGradeColorClass = (grade: LetterGrade): string => {
  switch(grade) {
    case 'Immeasurable': return 'grade-immeasurable';
    case 'SSS+': return 'grade-sss';
    case 'S+': return 'grade-splus';
    case 'S': return 'grade-s';
    case 'A+': return 'grade-aplus';
    case 'A': return 'grade-a';
    case 'B+': return 'grade-bplus';
    case 'B': return 'grade-b';
    case 'C': return 'grade-c';
    case 'D': return 'grade-d';
    case 'E': return 'grade-e';
    case 'E-': return 'grade-eminus';
    default: return 'grade-c';
  }
};
