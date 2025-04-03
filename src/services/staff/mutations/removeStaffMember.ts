
import { supabase } from '@/integrations/supabase/client';
import { StaffRole } from '@/types/staff';

// Function to remove a staff member
export const removeStaffMember = async (staffId: string, role: StaffRole) => {
  try {
    let error;
    
    if (role === 'Moderator') {
      const result = await supabase
        .from('moderators')
        .delete()
        .eq('id', staffId);
      error = result.error;
    } else if (role === 'Builder') {
      const result = await supabase
        .from('builders')
        .delete()
        .eq('id', staffId);
      error = result.error;
    } else if (role === 'Manager' || role === 'Owner') {
      const result = await supabase
        .from('managers')
        .delete()
        .eq('id', staffId);
      error = result.error;
    }

    if (error) {
      console.error('Error removing staff member:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing staff member:', error);
    throw error;
    return false;
  }
};
