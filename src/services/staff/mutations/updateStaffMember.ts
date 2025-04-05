
import { supabase } from '@/integrations/supabase/client';
import { StaffMember, StaffRole, ManagerMetrics, OwnerMetrics } from '@/types/staff';
import { transformToDatabase } from '../staffTransforms';
import { cleanupPreviousImages } from '../staffImageService';
import { createImmeasurableMetrics } from '../staffGrading';

// Function to update an existing staff member
export const updateStaffMember = async (staff: StaffMember) => {
  try {
    console.log(`updateStaffMember: Updating staff member ${staff.id} (${staff.name}), role: ${staff.role}`);
    
    // Make a copy of the staff object to avoid modifying the original
    const staffToUpdate = { ...staff };
    
    // CRITICAL FIX: Preserve Owner role throughout the update process
    const isOwner = staffToUpdate.role === 'Owner';
    
    // For Owner role, always ensure rank is "Owner" and preserve the role
    if (isOwner) {
      staffToUpdate.rank = 'Owner';
      staffToUpdate.overallGrade = 'SSS+';
      // Double-checking to ensure role is preserved
      staffToUpdate.role = 'Owner';
    }
    
    // Apply role-specific logic
    if (staffToUpdate.role === 'Manager') {
      // Cast to the proper type based on role
      staffToUpdate.metrics = createImmeasurableMetrics(staffToUpdate.role) as unknown as ManagerMetrics;
      staffToUpdate.overallGrade = 'Immeasurable';
    } else if (isOwner) {
      // Cast to the proper type based on role - Owner has special metrics
      staffToUpdate.metrics = createImmeasurableMetrics('Owner') as unknown as OwnerMetrics;
      staffToUpdate.overallGrade = 'SSS+';
    }
    
    const dbData = transformToDatabase(staffToUpdate);
    
    // Ensure avatar URL is correctly set
    if (staffToUpdate.avatar && staffToUpdate.avatar !== '/placeholder.svg') {
      dbData.profile_image_url = staffToUpdate.avatar;
      console.log("updateStaffMember: Avatar URL set to", staffToUpdate.avatar);
    }
    
    // CRITICAL FIX: Add role field for proper identification in database
    if (isOwner) {
      dbData.role = 'Owner'; // Explicit role identifier
      dbData.rank = 'Owner';
      dbData.overall_grade = 'SSS+';
      console.log("updateStaffMember: Ensuring Owner role is preserved");
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
    } else if (staffToUpdate.role === 'Manager' || isOwner) {
      // CRITICAL FIX: For Owner role, ensure we properly flag it in the database
      if (isOwner) {
        dbData.role = 'Owner';
        dbData.rank = 'Owner';
        dbData.overall_grade = 'SSS+';
      }
      
      // Both Manager and Owner are stored in the managers table
      const { error } = await supabase
        .from('managers')
        .update(dbData)
        .eq('id', staffToUpdate.id);
      if (error) throw error;
    }
    
    // Cleanup previous images for this staff member
    await cleanupPreviousImages(staffToUpdate.id);
    
    // CRITICAL FIX: Ensure Owner's role is explicitly preserved in the returned object
    if (isOwner) {
      staffToUpdate.role = 'Owner';
      staffToUpdate.rank = 'Owner';
      staffToUpdate.overallGrade = 'SSS+';
      console.log("updateStaffMember: Returning staff with Owner role preserved");
    }
    
    return staffToUpdate; // Return the updated staff member
  } catch (error) {
    console.error('Error updating staff member:', error);
    throw error;
  }
};
