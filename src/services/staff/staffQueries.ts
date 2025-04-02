
import { supabase } from '@/integrations/supabase/client';
import { StaffMember } from '@/types/staff';
import { transformToStaffMember } from './staffTransforms';

// Function to fetch all staff members
export const getAllStaff = async (): Promise<StaffMember[]> => {
  try {
    console.log("getAllStaff: Fetching staff data from Supabase");
    
    // Fetch moderators
    const { data: moderators, error: modError } = await supabase
      .from('moderators')
      .select('*');

    // Fetch builders
    const { data: builders, error: buildError } = await supabase
      .from('builders')
      .select('*');

    // Fetch managers
    const { data: managers, error: mgrError } = await supabase
      .from('managers')
      .select('*');

    if (modError || buildError || mgrError) {
      console.error('Error fetching staff:', modError || buildError || mgrError);
      throw modError || buildError || mgrError;
    }

    // Transform each row to StaffMember
    const modStaff = (moderators || []).map(row => transformToStaffMember(row, 'Moderator'));
    const buildStaff = (builders || []).map(row => transformToStaffMember(row, 'Builder'));
    const mgrStaff = (managers || []).map(row => transformToStaffMember(row, 'Manager'));
    
    console.log(`getAllStaff: Found ${modStaff.length} moderators, ${buildStaff.length} builders, ${mgrStaff.length} managers`);

    // Combine all staff
    return [...modStaff, ...buildStaff, ...mgrStaff];
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    throw error;
  }
};
