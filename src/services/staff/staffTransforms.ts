import { StaffMember, StaffRole, LetterGrade, ModeratorMetrics, BuilderMetrics, ManagerMetrics, OwnerMetrics, PerformanceMetric } from '@/types/staff';
import { calculateLetterGrade } from './staffGrading';

// Function to create a performance metric
export const createMetric = (name: string, score: number, role?: StaffRole): PerformanceMetric => {
  // For Manager and Owner roles, set special scores
  if (role === 'Manager' || role === 'Owner') {
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      score: 10, // Maximum score for display purposes
      letterGrade: 'SSS+' as LetterGrade // Changed from 'Immeasurable' to 'SSS+'
    };
  }
  
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
  
  // CRITICAL: Check for role field in the database row
  // If a role field exists and it's "Owner", prioritize it
  if (row.role === 'Owner') {
    role = 'Owner';
    console.log("Found Owner in database row, setting role accordingly");
  }
  
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
  } else if (role === 'Manager') {
    // Specialized handling for Manager role with SSS+ grades
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
  } else if (role === 'Owner') {
    // Specialized handling for Owner role (similar metrics but with Owner-specific grades)
    metrics = {
      // Moderator metrics with Owner role specific handling
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
      // Builder metrics with Owner role specific handling
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
  
  // Calculate overall score and grade
  let overallScore = 0;
  let overallGrade: LetterGrade = 'B';
  
  if (role === 'Manager') {
    // Manager specific overall grading
    overallScore = 10;
    overallGrade = 'SSS+'; // Always SSS+ for Manager
  } else if (role === 'Owner') {
    // Owner specific overall grading - distinct from Manager
    overallScore = 10;
    overallGrade = 'SSS+'; // Always 'SSS+' for Owner
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

  console.log(`Transformed staff member: ${row.name}, Role: ${role}, Rank: ${rank}, Grade: ${overallGrade}`);
  
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

// Helper function to get default rank based on role
const getDefaultRank = (role: StaffRole): string => {
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

// Helper function to transform StaffMember to database format
export const transformToDatabase = (staff: StaffMember): any => {
  // Common fields
  const dbObject: any = {
    name: staff.name,
    rank: staff.rank || getDefaultRank(staff.role),
    profile_image_url: staff.avatar
  };

  // CRITICAL: Force Owner rank for Owner role and add explicit role field
  if (staff.role === 'Owner') {
    dbObject.rank = 'Owner';
    dbObject.overall_grade = 'SSS+'; // Ensure SSS+ grade for Owner in database
    dbObject.role = 'Owner'; // Store explicit role identifier in database
  } else if (staff.role === 'Manager') {
    dbObject.rank = 'Manager';
    dbObject.overall_grade = 'SSS+'; // Ensure SSS+ grade for Manager in database
    dbObject.role = 'Manager'; // Store explicit role identifier
  } else {
    dbObject.overall_grade = staff.overallGrade;
  }

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
    // Only add these if they exist in the metrics
    if (metrics.creativity) dbObject.creativity = metrics.creativity.score;
    if (metrics.consistency) dbObject.consistency = metrics.consistency.score;
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
  } else if (staff.role === 'Manager' || staff.role === 'Owner') {
    // For Manager or Owner, set all scores to 10
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
    
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
    
    // Critical fix: For Owner role, ensure role is identified explicitly in the database
    if (staff.role === 'Owner') {
      dbObject.role = 'Owner'; // Store explicit role identifier
      dbObject.rank = 'Owner';
      dbObject.overall_grade = 'SSS+';
    }
  }

  return dbObject;
};
