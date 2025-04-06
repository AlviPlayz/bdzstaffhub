
import { LetterGrade, StaffRole } from '@/types/staff';

// Helper function to calculate letter grade from score
export const calculateLetterGrade = (score: number, role?: StaffRole): LetterGrade => {
  // Special case for Manager and Owner roles
  if (role === 'Manager' || role === 'Owner') {
    return 'SSS+';
  }

  if (score >= 9.5) return 'S+';
  if (score >= 8.5) return 'S';
  if (score >= 7.5) return 'A+';
  if (score >= 6.5) return 'A';
  if (score >= 5.5) return 'B+';
  if (score >= 4.5) return 'B';
  if (score >= 3.5) return 'C';
  if (score >= 2.5) return 'D';
  if (score >= 1.0) return 'E';
  return 'E-';
};

// Get the CSS color class for a given grade
export const getGradeColorClass = (grade: LetterGrade): string => {
  switch (grade) {
    case 'S+':
      return 'grade-s-plus';
    case 'S':
      return 'grade-s';
    case 'A+':
      return 'grade-a-plus';
    case 'A':
      return 'grade-a';
    case 'B+':
      return 'grade-b-plus';
    case 'B':
      return 'grade-b';
    case 'C':
      return 'grade-c';
    case 'D':
      return 'grade-d';
    case 'E':
      return 'grade-e';
    case 'E-':
      return 'grade-e-minus';
    case 'SSS+':
      return 'grade-sss';
    case 'Immeasurable':
      return 'grade-sss';
    default:
      return 'grade-c';
  }
};

// Create immeasurable metrics for Manager and Owner roles
export const createImmeasurableMetrics = (role: 'Manager' | 'Owner') => {
  // Base set of metrics with immeasurable stats
  return {
    // Moderator metrics
    responsiveness: { id: 'responsiveness', name: 'Responsiveness', score: 10, letterGrade: 'SSS+' as LetterGrade },
    fairness: { id: 'fairness', name: 'Fairness', score: 10, letterGrade: 'SSS+' as LetterGrade },
    communication: { id: 'communication', name: 'Communication', score: 10, letterGrade: 'SSS+' as LetterGrade },
    conflictResolution: { id: 'conflict-resolution', name: 'Conflict Resolution', score: 10, letterGrade: 'SSS+' as LetterGrade },
    ruleEnforcement: { id: 'rule-enforcement', name: 'Rule Enforcement', score: 10, letterGrade: 'SSS+' as LetterGrade },
    engagement: { id: 'engagement', name: 'Engagement', score: 10, letterGrade: 'SSS+' as LetterGrade },
    supportiveness: { id: 'supportiveness', name: 'Supportiveness', score: 10, letterGrade: 'SSS+' as LetterGrade },
    adaptability: { id: 'adaptability', name: 'Adaptability', score: 10, letterGrade: 'SSS+' as LetterGrade },
    objectivity: { id: 'objectivity', name: 'Objectivity', score: 10, letterGrade: 'SSS+' as LetterGrade },
    initiative: { id: 'initiative', name: 'Initiative', score: 10, letterGrade: 'SSS+' as LetterGrade },
    
    // Builder metrics
    exterior: { id: 'exterior', name: 'Exterior', score: 10, letterGrade: 'SSS+' as LetterGrade },
    interior: { id: 'interior', name: 'Interior', score: 10, letterGrade: 'SSS+' as LetterGrade },
    decoration: { id: 'decoration', name: 'Decoration', score: 10, letterGrade: 'SSS+' as LetterGrade },
    effort: { id: 'effort', name: 'Effort', score: 10, letterGrade: 'SSS+' as LetterGrade },
    contribution: { id: 'contribution', name: 'Contribution', score: 10, letterGrade: 'SSS+' as LetterGrade },
    cooperativeness: { id: 'cooperativeness', name: 'Cooperativeness', score: 10, letterGrade: 'SSS+' as LetterGrade },
    creativity: { id: 'creativity', name: 'Creativity', score: 10, letterGrade: 'SSS+' as LetterGrade },
    consistency: { id: 'consistency', name: 'Consistency', score: 10, letterGrade: 'SSS+' as LetterGrade }
  };
};
