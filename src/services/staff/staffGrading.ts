
import { LetterGrade, StaffMember, PerformanceMetric, StaffRole } from '@/types/staff';

// Function to calculate letter grade based on score
export const calculateLetterGrade = (score: number, role?: StaffRole): LetterGrade => {
  // For Managers and Owners, always return SSS+
  if (role === 'Manager' || role === 'Owner') {
    return 'SSS+';
  }
  
  if (score >= 9) return 'S+';
  if (score >= 8) return 'S';
  if (score >= 7.5) return 'A+';
  if (score >= 7) return 'A';
  if (score >= 6.5) return 'B+';
  if (score >= 6) return 'B';
  if (score >= 5) return 'C';
  if (score >= 4) return 'D';
  if (score >= 3) return 'E';
  return 'E-';
};

// Function to calculate overall score and grade
export const calculateOverallScoreAndGrade = (staff: StaffMember): { overallScore: number; overallGrade: LetterGrade } => {
  // Special case for Managers and Owners
  if (staff.role === 'Manager' || staff.role === 'Owner') {
    return { overallScore: 10, overallGrade: 'SSS+' };
  }

  const metricValues = Object.values(staff.metrics);
  
  // Calculate overall score with type safety
  let totalScore = 0;
  let validMetrics = 0;
  
  metricValues.forEach(metric => {
    const typedMetric = metric as PerformanceMetric;
    if (typeof typedMetric.score === 'number') {
      totalScore += typedMetric.score;
      validMetrics++;
    }
  });
  
  const average = validMetrics > 0 ? parseFloat((totalScore / validMetrics).toFixed(1)) : 0;
  const overallGrade = calculateLetterGrade(average, staff.role);

  return { overallScore: average, overallGrade };
};

// Create a set of immeasurable metrics for Managers and Owners
export const createImmeasurableMetrics = (role: StaffRole): Record<string, PerformanceMetric> => {
  if (role !== 'Manager' && role !== 'Owner') {
    return {}; // Only create for managers and owners
  }
  
  // Define base metrics that all staff roles have
  const baseMetrics: Record<string, PerformanceMetric> = {
    communication: { id: 'communication', name: 'Communication', score: 10, letterGrade: 'SSS+' },
    adaptability: { id: 'adaptability', name: 'Adaptability', score: 10, letterGrade: 'SSS+' },
  };
  
  // Add moderator-specific metrics
  const moderatorMetrics: Record<string, PerformanceMetric> = {
    responsiveness: { id: 'responsiveness', name: 'Responsiveness', score: 10, letterGrade: 'SSS+' },
    fairness: { id: 'fairness', name: 'Fairness', score: 10, letterGrade: 'SSS+' },
    conflictResolution: { id: 'conflictResolution', name: 'Conflict Resolution', score: 10, letterGrade: 'SSS+' },
    ruleEnforcement: { id: 'ruleEnforcement', name: 'Rule Enforcement', score: 10, letterGrade: 'SSS+' },
    engagement: { id: 'engagement', name: 'Engagement', score: 10, letterGrade: 'SSS+' },
    supportiveness: { id: 'supportiveness', name: 'Supportiveness', score: 10, letterGrade: 'SSS+' },
    objectivity: { id: 'objectivity', name: 'Objectivity', score: 10, letterGrade: 'SSS+' },
    initiative: { id: 'initiative', name: 'Initiative', score: 10, letterGrade: 'SSS+' },
  };
  
  // Add builder-specific metrics
  const builderMetrics: Record<string, PerformanceMetric> = {
    exterior: { id: 'exterior', name: 'Exterior', score: 10, letterGrade: 'SSS+' },
    interior: { id: 'interior', name: 'Interior', score: 10, letterGrade: 'SSS+' },
    decoration: { id: 'decoration', name: 'Decoration', score: 10, letterGrade: 'SSS+' },
    effort: { id: 'effort', name: 'Effort', score: 10, letterGrade: 'SSS+' },
    contribution: { id: 'contribution', name: 'Contribution', score: 10, letterGrade: 'SSS+' },
    cooperativeness: { id: 'cooperativeness', name: 'Cooperativeness', score: 10, letterGrade: 'SSS+' },
    creativity: { id: 'creativity', name: 'Creativity', score: 10, letterGrade: 'SSS+' },
    consistency: { id: 'consistency', name: 'Consistency', score: 10, letterGrade: 'SSS+' },
  };
  
  // Combine all metrics for managers
  return {
    ...baseMetrics,
    ...moderatorMetrics,
    ...builderMetrics
  };
};
