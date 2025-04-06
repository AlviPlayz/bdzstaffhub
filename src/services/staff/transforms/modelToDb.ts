
import { StaffMember } from '@/types/staff';
import { getDefaultRank } from './metricUtils';

// Helper function to transform StaffMember to database format
export const transformToDatabase = (staff: StaffMember): any => {
  // Common fields
  const dbObject: any = {
    name: staff.name,
    rank: staff.rank || getDefaultRank(staff.role),
    profile_image_url: staff.avatar
  };

  // Force Owner rank for Owner role
  if (staff.role === 'Owner') {
    dbObject.rank = 'Owner';
  }

  // Set overall_grade - always SSS+ for Manager/Owner
  dbObject.overall_grade = staff.role === 'Manager' || staff.role === 'Owner' 
    ? 'SSS+' 
    : staff.overallGrade;

  // Add metrics based on role
  if (staff.role === 'Moderator') {
    const metrics = staff.metrics as any;
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
    const metrics = staff.metrics as any;
    dbObject.exterior = metrics.exterior.score;
    dbObject.interior = metrics.interior.score;
    dbObject.decoration = metrics.decoration.score;
    dbObject.effort = metrics.effort.score;
    dbObject.contribution = metrics.contribution.score;
    dbObject.communication = metrics.communication.score;
    dbObject.adaptability = metrics.adaptability.score;
    dbObject.cooperativeness = metrics.cooperativeness.score;
    // Only add these if they exist in the metrics
    if (metrics.creativity) dbObject.creativity = metrics.creativity.score;
    if (metrics.consistency) dbObject.consistency = metrics.consistency.score;
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
  } else if (staff.role === 'Manager' || staff.role === 'Owner') {
    // For Managers and Owners, set all scores to 10
    // Moderator metrics
    dbObject.responsiveness = 10;
    dbObject.fairness = 10;
    dbObject.communication = 10;
    dbObject.conflict_resolution = 10;
    dbObject.rule_enforcement = 10;
    dbObject.engagement = 10;
    dbObject.supportiveness = 10;
    dbObject.adaptability = 10;
    dbObject.objectivity = 10;
    dbObject.initiative = 10;
    // Builder metrics
    dbObject.exterior = 10;
    dbObject.interior = 10;
    dbObject.decoration = 10;
    dbObject.effort = 10;
    dbObject.contribution = 10;
    dbObject.cooperativeness = 10;
    dbObject.creativity = 10;
    dbObject.consistency = 10;
    
    // Special handling for Owner role - force rank to be "Owner"
    if (staff.role === 'Owner') {
      dbObject.rank = 'Owner';
    }
    
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
  }

  return dbObject;
};
