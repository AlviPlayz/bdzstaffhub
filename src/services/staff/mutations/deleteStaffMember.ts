
import { supabase } from '@/integrations/supabase/client';
import { StaffRole } from '@/types/staff';

// Function to delete a staff member
export const deleteStaffMember = async (id: string, role: StaffRole) => {
  try {
    let error;
    
    if (role === 'Moderator') {
      const result = await supabase
        .from('moderators')
        .delete()
        .eq('id', id);
      error = result.error;
    } else if (role === 'Builder') {
      const result = await supabase
        .from('builders')
        .delete()
        .eq('id', id);
      error = result.error;
    } else if (role === 'Manager' || role === 'Owner') {
      const result = await supabase
        .from('managers')
        .delete()
        .eq('id', id);
      error = result.error;
    }

    if (error) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting staff member:', error);
    throw error;
    return false;
  }
};
