
import { StaffMember, StaffRole, LetterGrade, ModeratorMetrics, BuilderMetrics, ManagerMetrics, PerformanceMetric } from '@/types/staff';
import { calculateLetterGrade } from './staffGrading';

// Function to create a performance metric
export const createMetric = (name: string, score: number): PerformanceMetric => {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    score,
    letterGrade: calculateLetterGrade(score)
  };
};

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
    metrics = {
      // Moderator metrics
      responsiveness: createMetric('Responsiveness', row.responsiveness || 10),
      fairness: createMetric('Fairness', row.fairness || 10),
      communication: createMetric('Communication', row.communication || 10),
      conflictResolution: createMetric('Conflict Resolution', row.conflict_resolution || 10),
      ruleEnforcement: createMetric('Rule Enforcement', row.rule_enforcement || 10),
      engagement: createMetric('Engagement', row.engagement || 10),
      supportiveness: createMetric('Supportiveness', row.supportiveness || 10),
      adaptability: createMetric('Adaptability', row.adaptability || 10),
      objectivity: createMetric('Objectivity', row.objectivity || 10),
      initiative: createMetric('Initiative', row.initiative || 10),
      // Builder metrics
      exterior: createMetric('Exterior', row.exterior || 10),
      interior: createMetric('Interior', row.interior || 10),
      decoration: createMetric('Decoration', row.decoration || 10),
      effort: createMetric('Effort', row.effort || 10),
      contribution: createMetric('Contribution', row.contribution || 10),
      cooperativeness: createMetric('Cooperativeness', row.cooperativeness || 10),
      creativity: createMetric('Creativity', typeof row.creativity !== 'undefined' ? row.creativity : 10),
      consistency: createMetric('Consistency', typeof row.consistency !== 'undefined' ? row.consistency : 10)
    };
  }
  
  // Calculate overall score
  const metricEntries = Object.values(metrics);
  // Use typed values with proper type guard
  const scores = metricEntries.map(metric => {
    const typedMetric = metric as PerformanceMetric;
    return typeof typedMetric.score === 'number' ? typedMetric.score : 0;
  });
  
  const overallScore = scores.length > 0 
    ? parseFloat((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
    : 0;
  
  return {
    id: row.id,
    name: row.name,
    role: role,
    avatar: avatar,
    metrics: metrics,
    overallScore: overallScore,
    overallGrade: row.overall_grade || calculateLetterGrade(overallScore)
  };
};

// Helper function to transform StaffMember to database format
export const transformToDatabase = (staff: StaffMember): any => {
  // Common fields
  const dbObject: any = {
    name: staff.name,
    rank: 'Senior', // Default rank if not specified
    profile_image_url: staff.avatar
  };

  // Set overall_grade
  dbObject.overall_grade = staff.overallGrade;

  // Add metrics based on role
  if (staff.role === 'Moderator') {
    const metrics = staff.metrics as ModeratorMetrics;
    dbObject.responsiveness = metrics.responsiveness.score;
    dbObject.fairness = metrics.fairness.score;
    dbObject.communication = metrics.communication.score;
    dbObject.conflict_resolution = metrics.conflictResolution.score;
    dbObject.rule_enforcement = metrics.ruleEnforcement.score;
    dbObject.engagement = metrics.engagement.score;
    dbObject.supportiveness = metrics.supportiveness.score;
    dbObject.adaptability = metrics.adaptability.score;
    dbObject.objectivity = metrics.objectivity ? metrics.objectivity.score : 0;
    dbObject.initiative = metrics.initiative ? metrics.initiative.score : 0;
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
  } else if (staff.role === 'Builder') {
    const metrics = staff.metrics as BuilderMetrics;
    dbObject.exterior = metrics.exterior.score;
    dbObject.interior = metrics.interior.score;
    dbObject.decoration = metrics.decoration.score;
    dbObject.effort = metrics.effort.score;
    dbObject.contribution = metrics.contribution.score;
    dbObject.communication = metrics.communication.score;
    dbObject.adaptability = metrics.adaptability.score;
    dbObject.cooperativeness = metrics.cooperativeness.score;
    // Only add these if they exist in the database schema
    if (metrics.creativity) dbObject.creativity = metrics.creativity.score;
    if (metrics.consistency) dbObject.consistency = metrics.consistency.score;
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
  } else if (staff.role === 'Manager' || staff.role === 'Owner') {
    const metrics = staff.metrics as ManagerMetrics;
    // Moderator metrics
    dbObject.responsiveness = metrics.responsiveness.score;
    dbObject.fairness = metrics.fairness.score;
    dbObject.communication = metrics.communication.score;
    dbObject.conflict_resolution = metrics.conflictResolution.score;
    dbObject.rule_enforcement = metrics.ruleEnforcement.score;
    dbObject.engagement = metrics.engagement.score;
    dbObject.supportiveness = metrics.supportiveness.score;
    dbObject.adaptability = metrics.adaptability.score;
    dbObject.objectivity = metrics.objectivity ? metrics.objectivity.score : 0;
    dbObject.initiative = metrics.initiative ? metrics.initiative.score : 0;
    // Builder metrics
    dbObject.exterior = metrics.exterior.score;
    dbObject.interior = metrics.interior.score;
    dbObject.decoration = metrics.decoration.score;
    dbObject.effort = metrics.effort.score;
    dbObject.contribution = metrics.contribution.score;
    dbObject.cooperativeness = metrics.cooperativeness.score;
    // Only add these if they exist in the metrics
    if (metrics.creativity) dbObject.creativity = metrics.creativity.score;
    if (metrics.consistency) dbObject.consistency = metrics.consistency.score;
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
  }

  return dbObject;
};
