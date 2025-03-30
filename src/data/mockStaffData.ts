
import { BuilderMetrics, LetterGrade, ManagerMetrics, ModeratorMetrics, StaffMember } from "@/types/staff";
import { calculateLetterGrade, calculateOverallGrade } from "@/utils/gradeUtils";

const createMetric = (name: string, score: number) => {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    score,
    letterGrade: calculateLetterGrade(score)
  };
};

const createModeratorMetrics = (scores: Record<string, number>): ModeratorMetrics => {
  return {
    responsiveness: createMetric('Responsiveness', scores.responsiveness || Math.random() * 10),
    fairness: createMetric('Fairness', scores.fairness || Math.random() * 10),
    communication: createMetric('Communication', scores.communication || Math.random() * 10),
    conflictResolution: createMetric('Conflict Resolution', scores.conflictResolution || Math.random() * 10),
    ruleEnforcement: createMetric('Rule Enforcement', scores.ruleEnforcement || Math.random() * 10),
    engagement: createMetric('Engagement', scores.engagement || Math.random() * 10),
    supportiveness: createMetric('Supportiveness', scores.supportiveness || Math.random() * 10),
    adaptability: createMetric('Adaptability', scores.adaptability || Math.random() * 10),
    objectivity: createMetric('Objectivity', scores.objectivity || Math.random() * 10),
    initiative: createMetric('Initiative', scores.initiative || Math.random() * 10)
  };
};

const createBuilderMetrics = (scores: Record<string, number>): BuilderMetrics => {
  return {
    exterior: createMetric('Exterior', scores.exterior || Math.random() * 10),
    interior: createMetric('Interior', scores.interior || Math.random() * 10),
    decoration: createMetric('Decoration', scores.decoration || Math.random() * 10),
    effort: createMetric('Effort', scores.effort || Math.random() * 10),
    contribution: createMetric('Contribution', scores.contribution || Math.random() * 10),
    communication: createMetric('Communication', scores.communication || Math.random() * 10),
    adaptability: createMetric('Adaptability', scores.adaptability || Math.random() * 10),
    cooperativeness: createMetric('Cooperativeness', scores.cooperativeness || Math.random() * 10),
    creativity: createMetric('Creativity', scores.creativity || Math.random() * 10),
    consistency: createMetric('Consistency', scores.consistency || Math.random() * 10)
  };
};

const createManagerMetrics = (scores: Record<string, number>): ManagerMetrics => {
  return {
    ...createModeratorMetrics(scores),
    ...createBuilderMetrics(scores)
  };
};

export const mockModerators: StaffMember[] = [
  {
    id: 'mod-1',
    name: 'Alex Johnson',
    role: 'Moderator',
    avatar: 'https://i.pravatar.cc/150?img=1',
    metrics: createModeratorMetrics({
      responsiveness: 9.6,
      fairness: 9.2,
      communication: 8.7,
      conflictResolution: 9.0,
      ruleEnforcement: 9.5,
      engagement: 8.8,
      supportiveness: 9.3,
      adaptability: 8.9,
      objectivity: 9.1,
      initiative: 9.0
    }),
    overallScore: 0, // Will be calculated
    overallGrade: 'S+' // Will be calculated
  },
  {
    id: 'mod-2',
    name: 'Sarah Chen',
    role: 'Moderator',
    avatar: 'https://i.pravatar.cc/150?img=5',
    metrics: createModeratorMetrics({
      responsiveness: 8.5,
      fairness: 8.7,
      communication: 9.2,
      conflictResolution: 8.8,
      ruleEnforcement: 8.4,
      engagement: 9.1,
      supportiveness: 9.5,
      adaptability: 8.9,
      objectivity: 8.6,
      initiative: 8.7
    }),
    overallScore: 0,
    overallGrade: 'S'
  },
  {
    id: 'mod-3',
    name: 'Marcus Lee',
    role: 'Moderator',
    avatar: 'https://i.pravatar.cc/150?img=3',
    metrics: createModeratorMetrics({
      responsiveness: 7.8,
      fairness: 8.2,
      communication: 7.5,
      conflictResolution: 8.0,
      ruleEnforcement: 8.4,
      engagement: 7.9,
      supportiveness: 8.3,
      adaptability: 7.6,
      objectivity: 8.1,
      initiative: 7.7
    }),
    overallScore: 0,
    overallGrade: 'A+'
  }
];

export const mockBuilders: StaffMember[] = [
  {
    id: 'build-1',
    name: 'Emma Rodriguez',
    role: 'Builder',
    avatar: 'https://i.pravatar.cc/150?img=9',
    metrics: createBuilderMetrics({
      exterior: 9.7,
      interior: 9.5,
      decoration: 9.8,
      effort: 9.6,
      contribution: 9.4,
      communication: 9.1,
      adaptability: 9.3,
      cooperativeness: 9.5,
      creativity: 9.9,
      consistency: 9.4
    }),
    overallScore: 0,
    overallGrade: 'S+'
  },
  {
    id: 'build-2',
    name: 'Jamal Wright',
    role: 'Builder',
    avatar: 'https://i.pravatar.cc/150?img=8',
    metrics: createBuilderMetrics({
      exterior: 8.9,
      interior: 9.2,
      decoration: 9.0,
      effort: 8.8,
      contribution: 8.7,
      communication: 8.5,
      adaptability: 8.4,
      cooperativeness: 8.9,
      creativity: 9.3,
      consistency: 8.8
    }),
    overallScore: 0,
    overallGrade: 'S'
  },
  {
    id: 'build-3',
    name: 'Olivia Kim',
    role: 'Builder',
    avatar: 'https://i.pravatar.cc/150?img=7',
    metrics: createBuilderMetrics({
      exterior: 7.4,
      interior: 7.8,
      decoration: 8.2,
      effort: 7.9,
      contribution: 7.5,
      communication: 7.6,
      adaptability: 7.7,
      cooperativeness: 8.0,
      creativity: 8.5,
      consistency: 7.6
    }),
    overallScore: 0,
    overallGrade: 'A+'
  }
];

export const mockManagers: StaffMember[] = [
  {
    id: 'mgr-1',
    name: 'Daniel Pierce',
    role: 'Manager',
    avatar: 'https://i.pravatar.cc/150?img=4',
    metrics: createManagerMetrics({
      // Perfect 10 scores for all categories
      responsiveness: 10, fairness: 10, communication: 10, conflictResolution: 10,
      ruleEnforcement: 10, engagement: 10, supportiveness: 10, adaptability: 10,
      objectivity: 10, initiative: 10, exterior: 10, interior: 10, decoration: 10,
      effort: 10, contribution: 10, cooperativeness: 10, creativity: 10, consistency: 10
    }),
    overallScore: 10,
    overallGrade: 'SSS+'
  },
  {
    id: 'mgr-2',
    name: 'Sophia Martinez',
    role: 'Manager',
    avatar: 'https://i.pravatar.cc/150?img=10',
    metrics: createManagerMetrics({
      responsiveness: 9.3, fairness: 9.5, communication: 9.7, conflictResolution: 9.4,
      ruleEnforcement: 9.6, engagement: 9.2, supportiveness: 9.5, adaptability: 9.3,
      objectivity: 9.4, initiative: 9.5, exterior: 9.3, interior: 9.2, decoration: 9.5,
      effort: 9.6, contribution: 9.3, cooperativeness: 9.4, creativity: 9.7, consistency: 9.5
    }),
    overallScore: 0,
    overallGrade: 'S+'
  }
];

// Calculate and update overall scores and grades
export const processStaffData = (staff: StaffMember[]): StaffMember[] => {
  return staff.map(member => {
    const metrics = member.metrics as Record<string, any>;
    const values = Object.values(metrics);
    const totalScore = values.reduce((sum, metric) => sum + metric.score, 0);
    const average = totalScore / values.length;
    
    return {
      ...member,
      overallScore: parseFloat(average.toFixed(1)),
      overallGrade: calculateOverallGrade(metrics)
    };
  });
};

// Process all mock data
export const allModerators = processStaffData(mockModerators);
export const allBuilders = processStaffData(mockBuilders);
export const allManagers = processStaffData(mockManagers);
export const allStaff = [...allModerators, ...allBuilders, ...allManagers];
