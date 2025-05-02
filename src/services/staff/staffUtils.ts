
import { supabase } from '@/integrations/supabase/client';
import { StaffMember } from '@/types/staff';
import { transformToStaffMember } from './transforms';
import { calculateLetterGrade } from './staffGrading';
import { getStaffScore } from './events';

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
export const calculateOverallScoreAndGrade = async (staff: StaffMember): Promise<{ overallScore: number; overallGrade: string }> => {
  if (staff.role === 'Manager' || staff.role === 'Owner') {
    return {
      overallScore: 10,
      overallGrade: 'SSS+'
    };
  }
  
  try {
    // Get dynamic score from events
    const dynamicScore = await getStaffScore(staff.id);
    
    // Get letter grade based on score
    const letterGrade = calculateLetterGrade(dynamicScore);
    
    return {
      overallScore: parseFloat(dynamicScore.toFixed(1)),
      overallGrade: letterGrade
    };
  } catch (err) {
    console.error('Error calculating overall score:', err);
    
    // Fallback - calculate from metrics
    const metrics = Object.values(staff.metrics);
    const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
    const averageScore = totalScore / metrics.length;
    const letterGrade = calculateLetterGrade(averageScore);
    
    return {
      overallScore: parseFloat(averageScore.toFixed(1)),
      overallGrade: letterGrade
    };
  }
};
