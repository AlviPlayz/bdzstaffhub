
import { supabase } from '@/integrations/supabase/client';
import { StaffMember } from '@/types/staff';
import { transformToStaffMember } from './staffTransforms';
import { calculateLetterGrade } from './staffGrading';

// Function to get staff member by ID
export const getStaffMemberById = async (staffId: string): Promise<StaffMember | null> => {
  try {
    // Try to find in moderators
    const { data: modData, error: modError } = await supabase
      .from('moderators')
      .select('*')
      .eq('id', staffId)
      .maybeSingle();
    
    if (modData) {
      return transformToStaffMember(modData, 'Moderator');
    }
    
    // Try to find in builders
    const { data: buildData, error: buildError } = await supabase
      .from('builders')
      .select('*')
      .eq('id', staffId)
      .maybeSingle();
    
    if (buildData) {
      return transformToStaffMember(buildData, 'Builder');
    }
    
    // Try to find in managers
    const { data: mgrData, error: mgrError } = await supabase
      .from('managers')
      .select('*')
      .eq('id', staffId)
      .maybeSingle();
    
    if (mgrData) {
      return transformToStaffMember(mgrData, 'Manager');
    }
    
    return null;
  } catch (error) {
    console.error('Error in getStaffMemberById:', error);
    return null;
  }
};

// Function to calculate overall score and grade for a staff member
export const calculateOverallScoreAndGrade = (staff: StaffMember): { overallScore: number; overallGrade: string } => {
  // Get metrics
  const metrics = Object.values(staff.metrics);
  
  // Calculate average score
  const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
  const averageScore = totalScore / metrics.length;
  
  // Get letter grade based on score
  const letterGrade = staff.role === 'Manager' || staff.role === 'Owner'
    ? 'SSS+'
    : calculateLetterGrade(averageScore);
  
  return {
    overallScore: parseFloat(averageScore.toFixed(1)),
    overallGrade: letterGrade
  };
};
