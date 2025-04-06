
import { StaffMember, StaffRole, LetterGrade, PerformanceMetric } from '@/types/staff';
import { createMetric, getDefaultRank } from './metricUtils';
import { calculateLetterGrade } from '../staffGrading';

// Helper function to transform database row to StaffMember
export const transformToStaffMember = (row: any, role: StaffRole): StaffMember => {
  let metrics: any = {};
  
  // Get the avatar URL, use placeholder if not available
  let avatar = row.profile_image_url || '/placeholder.svg';
  
  // Create metrics based on role
  if (role === 'Moderator') {
    metrics = {
      responsiveness: createMetric('Responsiveness', row.responsiveness || 0),
      fairness: createMetric('Fairness', row.fairness || 0),
      communication: createMetric('Communication', row.communication || 0),
      conflictResolution: createMetric('Conflict Resolution', row.conflict_resolution || 0),
      ruleEnforcement: createMetric('Rule Enforcement', row.rule_enforcement || 0),
      engagement: createMetric('Engagement', row.engagement || 0),
      supportiveness: createMetric('Supportiveness', row.supportiveness || 0),
      adaptability: createMetric('Adaptability', row.adaptability || 0),
      objectivity: createMetric('Objectivity', row.objectivity || 0),
      initiative: createMetric('Initiative', row.initiative || 0)
    };
  } else if (role === 'Builder') {
    metrics = {
      exterior: createMetric('Exterior', row.exterior || 0),
      interior: createMetric('Interior', row.interior || 0),
      decoration: createMetric('Decoration', row.decoration || 0),
      effort: createMetric('Effort', row.effort || 0),
      contribution: createMetric('Contribution', row.contribution || 0),
      communication: createMetric('Communication', row.communication || 0),
      adaptability: createMetric('Adaptability', row.adaptability || 0),
      cooperativeness: createMetric('Cooperativeness', row.cooperativeness || 0),
      // Check if these exist, otherwise use defaults
      creativity: createMetric('Creativity', typeof row.creativity !== 'undefined' ? row.creativity : 0),
      consistency: createMetric('Consistency', typeof row.consistency !== 'undefined' ? row.consistency : 0)
    };
  } else if (role === 'Manager' || role === 'Owner') {
    // For Manager and Owner, always set immeasurable scores
    metrics = {
      // Moderator metrics
      responsiveness: createMetric('Responsiveness', 10, role),
      fairness: createMetric('Fairness', 10, role),
      communication: createMetric('Communication', 10, role),
      conflictResolution: createMetric('Conflict Resolution', 10, role),
      ruleEnforcement: createMetric('Rule Enforcement', 10, role),
      engagement: createMetric('Engagement', 10, role),
      supportiveness: createMetric('Supportiveness', 10, role),
      adaptability: createMetric('Adaptability', 10, role),
      objectivity: createMetric('Objectivity', 10, role),
      initiative: createMetric('Initiative', 10, role),
      // Builder metrics
      exterior: createMetric('Exterior', 10, role),
      interior: createMetric('Interior', 10, role),
      decoration: createMetric('Decoration', 10, role),
      effort: createMetric('Effort', 10, role),
      contribution: createMetric('Contribution', 10, role),
      cooperativeness: createMetric('Cooperativeness', 10, role),
      creativity: createMetric('Creativity', 10, role),
      consistency: createMetric('Consistency', 10, role)
    };
  }
  
  // Calculate overall score
  let overallScore = 0;
  let overallGrade: LetterGrade = 'B';
  
  if (role === 'Manager' || role === 'Owner') {
    // Special case for Managers and Owners
    overallScore = 10;
    overallGrade = 'SSS+';
  } else {
    // Regular score calculation for other roles
    const metricEntries = Object.values(metrics);
    // Use typed values with proper type guard
    const scores = metricEntries.map(metric => {
      const typedMetric = metric as PerformanceMetric;
      return typeof typedMetric.score === 'number' ? typedMetric.score : 0;
    });
    
    overallScore = scores.length > 0 
      ? parseFloat((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
      : 0;
    
    overallGrade = row.overall_grade || calculateLetterGrade(overallScore);
  }
  
  // Validate overallGrade to ensure it's a LetterGrade
  const validGrades: LetterGrade[] = ['S+', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'E-', 'SSS+', 'Immeasurable'];
  if (!validGrades.includes(overallGrade as any)) {
    overallGrade = calculateLetterGrade(overallScore, role);
  }
  
  // Set default rank or use the one from the database, special case for Owner
  let rank = row.rank || getDefaultRank(role);
  if (role === 'Owner') {
    rank = 'Owner';
  }
  
  return {
    id: row.id,
    name: row.name,
    role: role,
    rank: rank,
    avatar: avatar,
    metrics: metrics,
    overallScore: overallScore,
    overallGrade: overallGrade
  };
};
