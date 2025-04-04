
import { supabase } from '@/integrations/supabase/client';
import { StaffMember, StaffRole, ManagerMetrics, OwnerMetrics } from '@/types/staff';
import { transformToDatabase } from '../staffTransforms';
import { cleanupPreviousImages } from '../staffImageService';
import { createImmeasurableMetrics } from '../staffGrading';

// Function to update an existing staff member
export const updateStaffMember = async (staff: StaffMember) => {
  try {
    console.log(`updateStaffMember: Updating staff member ${staff.id} (${staff.name})`);
    
    // Make a copy of the staff object to avoid modifying the original
    const staffToUpdate = { ...staff };
    
    // For Owner role, always ensure rank is "Owner"
    if (staffToUpdate.role === 'Owner') {
      staffToUpdate.rank = 'Owner';
    }
    
    // Apply role-specific logic
    if (staffToUpdate.role === 'Manager') {
      // Cast to the proper type based on role
      staffToUpdate.metrics = createImmeasurableMetrics(staffToUpdate.role) as unknown as ManagerMetrics;
      staffToUpdate.overallGrade = 'Immeasurable';
    } else if (staffToUpdate.role === 'Owner') {
      // Cast to the proper type based on role - Owner has special metrics
      staffToUpdate.metrics = createImmeasurableMetrics(staffToUpdate.role) as unknown as OwnerMetrics;
      staffToUpdate.overallGrade = 'SSS+';
    }
    
    const dbData = transformToDatabase(staffToUpdate);
    
    // Ensure avatar URL is correctly set
    if (staffToUpdate.avatar && staffToUpdate.avatar !== '/placeholder.svg') {
      dbData.profile_image_url = staffToUpdate.avatar;
      console.log("updateStaffMember: Avatar URL set to", staffToUpdate.avatar);
    }
    
    // Double-check rank for Owner
    if (staffToUpdate.role === 'Owner') {
      dbData.rank = 'Owner';
      dbData.overall_grade = 'SSS+';
    }
    
    if (staffToUpdate.role === 'Moderator') {
      const { error } = await supabase
        .from('moderators')
        .update(dbData)
        .eq('id', staffToUpdate.id);
      if (error) throw error;
    } else if (staffToUpdate.role === 'Builder') {
      const { error } = await supabase
        .from('builders')
        .update(dbData)
        .eq('id', staffToUpdate.id);
      if (error) throw error;
    } else if (staffToUpdate.role === 'Manager' || staffToUpdate.role === 'Owner') {
      // Ensure Owner rank is preserved in database
      if (staffToUpdate.role === 'Owner') {
        dbData.rank = 'Owner';
        dbData.overall_grade = 'SSS+';
      }
      
      const { error } = await supabase
        .from('managers')
        .update(dbData)
        .eq('id', staffToUpdate.id);
      if (error) throw error;
    }
    
    // Cleanup previous images for this staff member
    await cleanupPreviousImages(staffToUpdate.id);
    
    // Ensure Owner's role and rank are preserved in the returned object
    if (staffToUpdate.role === 'Owner') {
      staffToUpdate.role = 'Owner';
      staffToUpdate.rank = 'Owner';
      staffToUpdate.overallGrade = 'SSS+';
    }
    
    return staffToUpdate; // Return the updated staff member
  } catch (error) {
    console.error('Error updating staff member:', error);
    throw error;
  }
};
