
import { format, subDays, isSaturday, differenceInWeeks } from 'date-fns';
import { PerformanceMetric, StaffRole, LetterGrade } from '@/types/staff';

export interface HistoryEntry {
  date: Date;
  metrics: Record<string, PerformanceMetric>;
  overallGrade: LetterGrade;
  overallScore: number | string;
  rank: string;
}

// Function to create immeasurable metrics for managers
export const createImmeasurableMetric = (name: string): PerformanceMetric => {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    score: 10, // We'll give it a 10 score for calculation purposes
    letterGrade: 'SSS+'
  };
};

// Function to calculate letter grade
export function calculateLetterGrade(score: number): LetterGrade {
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
}

// Function to generate weekly snapshots
export const generateHistoricalData = (staffId: string, staffRole: StaffRole, staffRank?: string): HistoryEntry[] => {
  // Skip history generation for managers
  const isManager = staffRole === 'Manager' || staffRole === 'Owner';
  if (isManager) {
    return [];
  }
  
  const today = new Date();
  const history: HistoryEntry[] = [];
  
  // Generate up to 10 weeks of history (snapshots)
  for (let i = 1; i <= 10; i++) {
    // Find the previous Saturday (weekly snapshot day)
    let historyDate = subDays(today, i * 7);
    while (!isSaturday(historyDate)) {
      historyDate = subDays(historyDate, 1);
    }
    
    // Only include history entries that are in the past
    if (historyDate < today) {
      // For regular staff, generate slightly varying metrics over time
      const metrics: Record<string, PerformanceMetric> = {};
      const metricKeys = getMetricKeysForRole(staffRole);
      
      metricKeys.forEach(key => {
        // Random slight variations in historical scores
        const baseScore = 7.5 + (Math.random() * 2 - 1);
        metrics[key] = {
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          score: parseFloat(baseScore.toFixed(1)),
          letterGrade: calculateLetterGrade(baseScore)
        };
      });
      
      // Calculate overall score based on metrics
      const totalScore = Object.values(metrics).reduce((sum, metric) => sum + metric.score, 0);
      const averageScore = totalScore / Object.values(metrics).length;
      
      history.push({
        date: historyDate,
        metrics: metrics,
        overallGrade: calculateLetterGrade(averageScore),
        overallScore: parseFloat(averageScore.toFixed(1)),
        rank: staffRank || (staffRole === 'Moderator' ? 'Mod' : 'Builder')
      });
    }
  }
  
  return history;
};

// Helper function to get metric keys based on role
const getMetricKeysForRole = (role: StaffRole): string[] => {
  if (role === 'Moderator') {
    return ['responsiveness', 'fairness', 'communication', 'conflictResolution', 'ruleEnforcement', 'engagement', 'supportiveness', 'adaptability', 'objectivity', 'initiative'];
  } else if (role === 'Builder') {
    return ['exterior', 'interior', 'decoration', 'effort', 'contribution', 'communication', 'adaptability', 'cooperativeness', 'creativity', 'consistency'];
  }
  return [];
};

// Helper to format time difference in weeks
export const formatWeekAgo = (date: Date): string => {
  const today = new Date();
  const weeksDiff = differenceInWeeks(today, date);
  
  if (weeksDiff === 0) {
    return 'Current';
  } else if (weeksDiff === 1) {
    return '1 Week Ago';
  }
  return `${weeksDiff} Weeks Ago`;
};
