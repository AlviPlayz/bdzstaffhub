
import { StaffMember, StaffRole, ModeratorMetrics, BuilderMetrics, ManagerMetrics, OwnerMetrics } from '@/types/staff';
import { supabase } from '@/integrations/supabase/client';
import { 
  SupabaseModerator, 
  SupabaseBuilder, 
  SupabaseManager,
  StaffTableName 
} from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { calculateLetterGrade, calculateOverallGrade } from '@/utils/gradeUtils';

// Maps our frontend staff role to the Supabase table name
const getTableForRole = (role: StaffRole): StaffTableName => {
  switch (role) {
    case 'Moderator': return 'moderators';
    case 'Builder': return 'builders';
    case 'Manager': return 'managers';
    case 'Owner': return 'managers'; // Owners are stored in the managers table
  }
};

// Convert Supabase moderator data to our frontend StaffMember format
const supabaseModeratorToStaffMember = (mod: SupabaseModerator): StaffMember => {
  const metrics = {
    responsiveness: {
      id: 'responsiveness',
      name: 'Responsiveness',
      score: mod.responsiveness,
      letterGrade: calculateLetterGrade(mod.responsiveness)
    },
    fairness: {
      id: 'fairness',
      name: 'Fairness',
      score: mod.fairness,
      letterGrade: calculateLetterGrade(mod.fairness)
    },
    communication: {
      id: 'communication',
      name: 'Communication',
      score: mod.communication,
      letterGrade: calculateLetterGrade(mod.communication)
    },
    conflictResolution: {
      id: 'conflictResolution',
      name: 'Conflict Resolution',
      score: mod.conflict_resolution,
      letterGrade: calculateLetterGrade(mod.conflict_resolution)
    },
    ruleEnforcement: {
      id: 'ruleEnforcement',
      name: 'Rule Enforcement',
      score: mod.rule_enforcement,
      letterGrade: calculateLetterGrade(mod.rule_enforcement)
    },
    engagement: {
      id: 'engagement',
      name: 'Engagement',
      score: mod.engagement,
      letterGrade: calculateLetterGrade(mod.engagement)
    },
    supportiveness: {
      id: 'supportiveness',
      name: 'Supportiveness',
      score: mod.supportiveness,
      letterGrade: calculateLetterGrade(mod.supportiveness)
    },
    adaptability: {
      id: 'adaptability',
      name: 'Adaptability',
      score: mod.adaptability,
      letterGrade: calculateLetterGrade(mod.adaptability)
    },
    objectivity: {
      id: 'objectivity',
      name: 'Objectivity',
      score: mod.objectivity,
      letterGrade: calculateLetterGrade(mod.objectivity)
    },
    initiative: {
      id: 'initiative',
      name: 'Initiative',
      score: mod.initiative,
      letterGrade: calculateLetterGrade(mod.initiative)
    }
  };

  // Calculate the overall score (average of all metrics)
  const values = Object.values(metrics);
  const totalScore = values.reduce((sum, metric) => sum + metric.score, 0);
  const average = totalScore / values.length;

  return {
    id: mod.id,
    name: mod.name,
    role: 'Moderator',
    avatar: mod.profile_image_url || 'https://i.pravatar.cc/150?img=1',
    metrics,
    overallScore: parseFloat(average.toFixed(1)),
    overallGrade: mod.overall_grade as any
  };
};

// Convert Supabase builder data to our frontend StaffMember format
const supabaseBuilderToStaffMember = (builder: SupabaseBuilder): StaffMember => {
  const metrics = {
    exterior: {
      id: 'exterior',
      name: 'Exterior',
      score: builder.exterior,
      letterGrade: calculateLetterGrade(builder.exterior)
    },
    interior: {
      id: 'interior',
      name: 'Interior',
      score: builder.interior,
      letterGrade: calculateLetterGrade(builder.interior)
    },
    decoration: {
      id: 'decoration',
      name: 'Decoration',
      score: builder.decoration,
      letterGrade: calculateLetterGrade(builder.decoration)
    },
    effort: {
      id: 'effort',
      name: 'Effort',
      score: builder.effort,
      letterGrade: calculateLetterGrade(builder.effort)
    },
    contribution: {
      id: 'contribution',
      name: 'Contribution',
      score: builder.contribution,
      letterGrade: calculateLetterGrade(builder.contribution)
    },
    communication: {
      id: 'communication',
      name: 'Communication',
      score: builder.communication,
      letterGrade: calculateLetterGrade(builder.communication)
    },
    adaptability: {
      id: 'adaptability',
      name: 'Adaptability',
      score: builder.adaptability,
      letterGrade: calculateLetterGrade(builder.adaptability)
    },
    cooperativeness: {
      id: 'cooperativeness',
      name: 'Cooperativeness',
      score: builder.cooperativeness,
      letterGrade: calculateLetterGrade(builder.cooperativeness)
    },
    creativity: {
      id: 'creativity',
      name: 'Creativity',
      score: builder.creativity,
      letterGrade: calculateLetterGrade(builder.creativity)
    },
    consistency: {
      id: 'consistency',
      name: 'Consistency',
      score: builder.consistency,
      letterGrade: calculateLetterGrade(builder.consistency)
    }
  };

  // Calculate the overall score (average of all metrics)
  const values = Object.values(metrics);
  const totalScore = values.reduce((sum, metric) => sum + metric.score, 0);
  const average = totalScore / values.length;

  return {
    id: builder.id,
    name: builder.name,
    role: 'Builder',
    avatar: builder.profile_image_url || 'https://i.pravatar.cc/150?img=8',
    metrics,
    overallScore: parseFloat(average.toFixed(1)),
    overallGrade: builder.overall_grade as any
  };
};

// Convert Supabase manager data to our frontend StaffMember format
const supabaseManagerToStaffMember = (manager: SupabaseManager): StaffMember => {
  const metrics = {
    // Moderator metrics
    responsiveness: {
      id: 'responsiveness',
      name: 'Responsiveness',
      score: manager.responsiveness,
      letterGrade: calculateLetterGrade(manager.responsiveness)
    },
    fairness: {
      id: 'fairness',
      name: 'Fairness',
      score: manager.fairness,
      letterGrade: calculateLetterGrade(manager.fairness)
    },
    communication: {
      id: 'communication',
      name: 'Communication',
      score: manager.communication,
      letterGrade: calculateLetterGrade(manager.communication)
    },
    conflictResolution: {
      id: 'conflictResolution',
      name: 'Conflict Resolution',
      score: manager.conflict_resolution,
      letterGrade: calculateLetterGrade(manager.conflict_resolution)
    },
    ruleEnforcement: {
      id: 'ruleEnforcement',
      name: 'Rule Enforcement',
      score: manager.rule_enforcement,
      letterGrade: calculateLetterGrade(manager.rule_enforcement)
    },
    engagement: {
      id: 'engagement',
      name: 'Engagement',
      score: manager.engagement,
      letterGrade: calculateLetterGrade(manager.engagement)
    },
    supportiveness: {
      id: 'supportiveness',
      name: 'Supportiveness',
      score: manager.supportiveness,
      letterGrade: calculateLetterGrade(manager.supportiveness)
    },
    adaptability: {
      id: 'adaptability',
      name: 'Adaptability',
      score: manager.adaptability,
      letterGrade: calculateLetterGrade(manager.adaptability)
    },
    objectivity: {
      id: 'objectivity',
      name: 'Objectivity',
      score: manager.objectivity || 10,
      letterGrade: calculateLetterGrade(manager.objectivity || 10)
    },
    initiative: {
      id: 'initiative',
      name: 'Initiative',
      score: manager.initiative || 10,
      letterGrade: calculateLetterGrade(manager.initiative || 10)
    },
    // Builder metrics
    exterior: {
      id: 'exterior',
      name: 'Exterior',
      score: manager.exterior,
      letterGrade: calculateLetterGrade(manager.exterior)
    },
    interior: {
      id: 'interior',
      name: 'Interior',
      score: manager.interior,
      letterGrade: calculateLetterGrade(manager.interior)
    },
    decoration: {
      id: 'decoration',
      name: 'Decoration',
      score: manager.decoration,
      letterGrade: calculateLetterGrade(manager.decoration)
    },
    effort: {
      id: 'effort',
      name: 'Effort',
      score: manager.effort,
      letterGrade: calculateLetterGrade(manager.effort)
    },
    contribution: {
      id: 'contribution',
      name: 'Contribution',
      score: manager.contribution,
      letterGrade: calculateLetterGrade(manager.contribution)
    },
    cooperativeness: {
      id: 'cooperativeness',
      name: 'Cooperativeness',
      score: manager.cooperativeness || 10,
      letterGrade: calculateLetterGrade(manager.cooperativeness || 10)
    },
    creativity: {
      id: 'creativity',
      name: 'Creativity',
      score: manager.creativity || 10,
      letterGrade: calculateLetterGrade(manager.creativity || 10)
    },
    consistency: {
      id: 'consistency',
      name: 'Consistency',
      score: manager.consistency || 10,
      letterGrade: calculateLetterGrade(manager.consistency || 10)
    }
  };

  // Calculate the overall score (average of all metrics)
  const values = Object.values(metrics);
  const totalScore = values.reduce((sum, metric) => sum + metric.score, 0);
  const average = totalScore / values.length;

  // Determine if this is an owner based on rank field
  const isOwner = manager.rank.toLowerCase() === 'owner';
  
  return {
    id: manager.id,
    name: manager.name,
    role: isOwner ? 'Owner' : 'Manager',
    avatar: manager.profile_image_url || 'https://i.pravatar.cc/150?img=4',
    metrics,
    overallScore: parseFloat(average.toFixed(1)),
    overallGrade: manager.overall_grade as any
  };
};

// Convert a StaffMember to the format expected by Supabase
const staffMemberToSupabaseData = (staff: StaffMember) => {
  const { metrics, role } = staff;
  
  // Common fields for all staff types
  const commonFields = {
    name: staff.name,
    profile_image_url: staff.avatar
  };
  
  if (role === 'Moderator') {
    const moderatorMetrics = metrics as ModeratorMetrics;
    return {
      ...commonFields,
      responsiveness: moderatorMetrics.responsiveness.score,
      fairness: moderatorMetrics.fairness.score,
      communication: moderatorMetrics.communication.score,
      conflict_resolution: moderatorMetrics.conflictResolution.score,
      rule_enforcement: moderatorMetrics.ruleEnforcement.score,
      engagement: moderatorMetrics.engagement.score,
      supportiveness: moderatorMetrics.supportiveness.score,
      adaptability: moderatorMetrics.adaptability.score,
      objectivity: moderatorMetrics.objectivity.score,
      initiative: moderatorMetrics.initiative.score,
      overall_grade: staff.overallGrade
    };
  } else if (role === 'Builder') {
    const builderMetrics = metrics as BuilderMetrics;
    return {
      ...commonFields,
      exterior: builderMetrics.exterior.score,
      interior: builderMetrics.interior.score,
      decoration: builderMetrics.decoration.score,
      effort: builderMetrics.effort.score,
      contribution: builderMetrics.contribution.score,
      communication: builderMetrics.communication.score,
      adaptability: builderMetrics.adaptability.score,
      cooperativeness: builderMetrics.cooperativeness.score,
      creativity: builderMetrics.creativity.score,
      consistency: builderMetrics.consistency.score,
      overall_grade: staff.overallGrade
    };
  } else if (role === 'Manager' || role === 'Owner') {
    // Manager and Owner have metrics from both Moderator and Builder
    const managerMetrics = metrics as ManagerMetrics;
    return {
      ...commonFields,
      // Moderator metrics
      responsiveness: managerMetrics.responsiveness.score,
      fairness: managerMetrics.fairness.score,
      communication: managerMetrics.communication.score,
      conflict_resolution: managerMetrics.conflictResolution.score,
      rule_enforcement: managerMetrics.ruleEnforcement.score,
      engagement: managerMetrics.engagement.score,
      supportiveness: managerMetrics.supportiveness.score,
      adaptability: managerMetrics.adaptability.score,
      objectivity: managerMetrics.objectivity.score,
      initiative: managerMetrics.initiative.score,
      // Builder metrics
      exterior: managerMetrics.exterior.score,
      interior: managerMetrics.interior.score,
      decoration: managerMetrics.decoration.score,
      effort: managerMetrics.effort.score,
      contribution: managerMetrics.contribution.score,
      cooperativeness: managerMetrics.cooperativeness.score,
      creativity: managerMetrics.creativity.score,
      consistency: managerMetrics.consistency.score,
      overall_grade: staff.overallGrade,
      // Set rank to "Owner" if the role is Owner
      rank: role
    };
  }
  
  return {};
};

// Main service functions
export const supabaseService = {
  // Fetch all staff members from the database
  getAllStaff: async (): Promise<StaffMember[]> => {
    try {
      // Fetch data from all three tables in parallel
      const [moderatorsResponse, buildersResponse, managersResponse] = await Promise.all([
        supabase.from('moderators').select('*'),
        supabase.from('builders').select('*'),
        supabase.from('managers').select('*')
      ]);
      
      // Handle any errors
      if (moderatorsResponse.error) throw moderatorsResponse.error;
      if (buildersResponse.error) throw buildersResponse.error;
      if (managersResponse.error) throw managersResponse.error;
      
      // Convert the data to our frontend format
      const moderators = (moderatorsResponse.data as SupabaseModerator[] || []).map(supabaseModeratorToStaffMember);
      const builders = (buildersResponse.data as SupabaseBuilder[] || []).map(supabaseBuilderToStaffMember);
      const managers = (managersResponse.data as SupabaseManager[] || []).map(supabaseManagerToStaffMember);
      
      // Return all staff members combined
      return [...moderators, ...builders, ...managers];
    } catch (error) {
      console.error('Error fetching staff data:', error);
      toast({
        title: "Database Error",
        description: "Failed to fetch staff data from the database.",
        variant: "destructive"
      });
      return [];
    }
  },
  
  // Create a new staff member in the database
  createStaffMember: async (staff: Omit<StaffMember, 'id'>): Promise<StaffMember | null> => {
    try {
      const tableName = getTableForRole(staff.role);
      const dataToInsert = staffMemberToSupabaseData(staff as StaffMember);
      
      // Generate a staff ID if not provided
      const staffId = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
      
      const { data, error } = await supabase
        .from(tableName)
        .insert({ 
          ...dataToInsert, 
          staff_id: staffId, 
          rank: staff.role,
          name: staff.name  // Ensure name is included
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert the result back to our frontend format
      let result: StaffMember | null = null;
      
      if (tableName === 'moderators') {
        result = supabaseModeratorToStaffMember(data as SupabaseModerator);
      } else if (tableName === 'builders') {
        result = supabaseBuilderToStaffMember(data as SupabaseBuilder);
      } else if (tableName === 'managers') {
        result = supabaseManagerToStaffMember(data as SupabaseManager);
      }
      
      toast({
        title: "Staff Added",
        description: `${staff.name} has been added as a ${staff.role}.`
      });
      
      return result;
    } catch (error) {
      console.error('Error creating staff member:', error);
      toast({
        title: "Database Error",
        description: "Failed to create staff member in the database.",
        variant: "destructive"
      });
      return null;
    }
  },
  
  // Update an existing staff member in the database
  updateStaffMember: async (staff: StaffMember): Promise<StaffMember | null> => {
    try {
      const tableName = getTableForRole(staff.role);
      const dataToUpdate = staffMemberToSupabaseData(staff);
      
      const { data, error } = await supabase
        .from(tableName)
        .update(dataToUpdate)
        .eq('id', staff.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert the result back to our frontend format
      let result: StaffMember | null = null;
      
      if (tableName === 'moderators') {
        result = supabaseModeratorToStaffMember(data as SupabaseModerator);
      } else if (tableName === 'builders') {
        result = supabaseBuilderToStaffMember(data as SupabaseBuilder);
      } else if (tableName === 'managers') {
        result = supabaseManagerToStaffMember(data as SupabaseManager);
      }
      
      toast({
        title: "Staff Updated",
        description: `${staff.name}'s information has been updated.`
      });
      
      return result;
    } catch (error) {
      console.error('Error updating staff member:', error);
      toast({
        title: "Database Error",
        description: "Failed to update staff member in the database.",
        variant: "destructive"
      });
      return null;
    }
  },
  
  // Delete a staff member from the database
  deleteStaffMember: async (id: string, role: StaffRole): Promise<boolean> => {
    try {
      const tableName = getTableForRole(role);
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Staff Removed",
        description: "Staff member has been removed from the database."
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting staff member:', error);
      toast({
        title: "Database Error",
        description: "Failed to delete staff member from the database.",
        variant: "destructive"
      });
      return false;
    }
  },
  
  // Subscribe to real-time updates for a specific table
  subscribeToRealTimeUpdates: (tableName: StaffTableName, callback: () => void) => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: tableName
      }, () => {
        callback();
      })
      .subscribe();
    
    // Return a function to unsubscribe
    return () => {
      supabase.removeChannel(channel);
    };
  }
};
