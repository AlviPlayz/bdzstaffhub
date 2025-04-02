
import { LetterGrade, StaffMember, PerformanceMetric } from '@/types/staff';

// Function to calculate letter grade based on score
export const calculateLetterGrade = (score: number): LetterGrade => {
  // For Managers and Owners, always return SSS+
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
  const overallGrade = calculateLetterGrade(average);

  return { overallScore: average, overallGrade };
};
