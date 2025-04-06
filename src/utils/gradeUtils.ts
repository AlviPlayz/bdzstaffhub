
import { LetterGrade, PerformanceMetric, StaffMember } from "@/types/staff";

export const calculateLetterGrade = (score: number): LetterGrade => {
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

export const calculateOverallGrade = (metrics: Record<string, PerformanceMetric>): LetterGrade => {
  const values = Object.values(metrics);
  const totalScore = values.reduce((sum, metric) => sum + metric.score, 0);
  const average = totalScore / values.length;
  
  // Special case for managers with perfect 10 score
  if (average === 10) {
    return 'SSS+';
  }
  
  return calculateLetterGrade(average);
};

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

// Helper function to create an "Immeasurable" performance metric
export const createImmeasurableMetric = (name: string): PerformanceMetric => {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    score: 10, // We'll give it a 10 score for calculation purposes
    letterGrade: 'SSS+'
  };
};

// Create a set of Immeasurable metrics for Owner or high-level manager
export const createImmeasurableManagerMetrics = (): Record<string, PerformanceMetric> => {
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
