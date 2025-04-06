
import { StaffRole, LetterGrade, PerformanceMetric } from '@/types/staff';
import { calculateLetterGrade } from '../staffGrading';

// Function to create a performance metric
export const createMetric = (name: string, score: number, role?: StaffRole): PerformanceMetric => {
  // For Manager and Owner roles, set special scores
  if (role === 'Manager' || role === 'Owner') {
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      score: 10, // Maximum score for display purposes
      letterGrade: 'Immeasurable' as LetterGrade
    };
  }
  
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    score,
    letterGrade: calculateLetterGrade(score)
  };
};

// Helper function to get default rank based on role
export const getDefaultRank = (role: StaffRole): string => {
  switch (role) {
    case 'Moderator':
      return 'Trial Mod';
    case 'Builder':
      return 'Trial Builder';
    case 'Manager':
      return 'Manager';
    case 'Owner':
      return 'Owner';
    default:
      return '';
  }
};
