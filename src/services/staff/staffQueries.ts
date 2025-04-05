
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

    // Fetch managers and owners
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
    
    // For managers table: identify owners using 'role' field
    const mgrStaff = (managers || []).map(row => {
      // Check if this manager record has an explicit Owner role
      if (row.role === 'Owner') {
        console.log("Found Owner record in managers table:", row.name);
        return transformToStaffMember(row, 'Owner');
      }
      return transformToStaffMember(row, 'Manager');
    });
    
    console.log(`getAllStaff: Found ${modStaff.length} moderators, ${buildStaff.length} builders, ${mgrStaff.length} managers/owners`);

    // Log explicitly if we found any Owners
    const ownerCount = mgrStaff.filter(staff => staff.role === 'Owner').length;
    if (ownerCount > 0) {
      console.log(`Found ${ownerCount} Owner records in the database`);
    } else {
      console.log("No Owner records found in the database");
    }

    // Combine all staff
    return [...modStaff, ...buildStaff, ...mgrStaff];
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    throw error;
  }
};
