
import { supabase } from '@/integrations/supabase/client';
import { StaffMember, StaffRole, ManagerMetrics, OwnerMetrics } from '@/types/staff';
import { transformToDatabase } from '../staffTransforms';
import { cleanupPreviousImages } from '../staffImageService';
import { createImmeasurableMetrics } from '../staffGrading';

// Function to update an existing staff member
export const updateStaffMember = async (staff: StaffMember) => {
  try {
    console.log(`updateStaffMember: Updating staff member ${staff.id} (${staff.name})`);
    
    // For Owner role, always ensure rank is "Owner"
    if (staff.role === 'Owner') {
      staff.rank = 'Owner';
    }
    
    // For Managers and Owners, ensure they have immeasurable metrics
    if (staff.role === 'Manager' || staff.role === 'Owner') {
      // Cast to the proper type based on role
      if (staff.role === 'Manager') {
        staff.metrics = createImmeasurableMetrics('Manager') as unknown as ManagerMetrics;
      } else {
        staff.metrics = createImmeasurableMetrics('Owner') as unknown as OwnerMetrics;
      }
      staff.overallGrade = 'SSS+';
    }
    
    const dbData = transformToDatabase(staff);
    
    // Ensure avatar URL is correctly set
    if (staff.avatar && staff.avatar !== '/placeholder.svg') {
      dbData.profile_image_url = staff.avatar;
      console.log("updateStaffMember: Avatar URL set to", staff.avatar);
    }
    
    // Double-check rank for Owner
    if (staff.role === 'Owner') {
      dbData.rank = 'Owner';
    }
    
    if (staff.role === 'Moderator') {
      const { error } = await supabase
        .from('moderators')
        .update(dbData)
        .eq('id', staff.id);
      if (error) throw error;
    } else if (staff.role === 'Builder') {
      const { error } = await supabase
        .from('builders')
        .update(dbData)
        .eq('id', staff.id);
      if (error) throw error;
    } else if (staff.role === 'Manager' || staff.role === 'Owner') {
      // Ensure Owner rank is preserved in database
      if (staff.role === 'Owner') {
        dbData.rank = 'Owner';
      }
      
      const { error } = await supabase
        .from('managers')
        .update(dbData)
        .eq('id', staff.id);
      if (error) throw error;
    }
    
    // Cleanup previous images for this staff member
    await cleanupPreviousImages(staff.id);
    
    // Ensure Owner's rank is preserved in the returned object
    if (staff.role === 'Owner') {
      staff.rank = 'Owner';
    }
    
    return staff; // Return the updated staff member
  } catch (error) {
    console.error('Error updating staff member:', error);
    throw error;
  }
};
