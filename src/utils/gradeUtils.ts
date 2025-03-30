
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
