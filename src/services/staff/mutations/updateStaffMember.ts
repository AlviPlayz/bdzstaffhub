
import { supabase } from '@/integrations/supabase/client';
import { StaffMember, StaffRole, ManagerMetrics, OwnerMetrics, ROLE_CONSTANTS, enforceRoleRankCombination } from '@/types/staff';
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
    const isOwner = staffToUpdate.role === ROLE_CONSTANTS.OWNER.ROLE;
    
    // Apply role-rank enforcement
    const enforcedStaff = enforceRoleRankCombination(staffToUpdate);
    Object.assign(staffToUpdate, enforcedStaff);
    
    // For Owner role, ensure all required values are properly set
    if (isOwner) {
      staffToUpdate.rank = ROLE_CONSTANTS.OWNER.RANK;
      staffToUpdate.overallGrade = ROLE_CONSTANTS.OWNER.GRADE;
      staffToUpdate.role = ROLE_CONSTANTS.OWNER.ROLE;
      console.log("updateStaffMember: Enforcing Owner status with rank and grade", staffToUpdate.rank, staffToUpdate.overallGrade);
    }
    
    // Apply role-specific logic
    if (staffToUpdate.role === ROLE_CONSTANTS.MANAGER.ROLE) {
      // Cast to the proper type based on role
      staffToUpdate.metrics = createImmeasurableMetrics(staffToUpdate.role) as unknown as ManagerMetrics;
      staffToUpdate.overallGrade = ROLE_CONSTANTS.MANAGER.GRADE;
    } else if (isOwner) {
      // Cast to the proper type based on role - Owner has special metrics
      staffToUpdate.metrics = createImmeasurableMetrics(ROLE_CONSTANTS.OWNER.ROLE) as unknown as OwnerMetrics;
      staffToUpdate.overallGrade = ROLE_CONSTANTS.OWNER.GRADE;
    }
    
    const dbData = transformToDatabase(staffToUpdate);
    
    // Ensure avatar URL is correctly set
    if (staffToUpdate.avatar && staffToUpdate.avatar !== '/placeholder.svg') {
      dbData.profile_image_url = staffToUpdate.avatar;
      console.log("updateStaffMember: Avatar URL set to", staffToUpdate.avatar);
    }
    
    // CRITICAL FIX: Add role field for proper identification in database
    if (isOwner) {
      dbData.role = ROLE_CONSTANTS.OWNER.ROLE; // Explicit role identifier
      dbData.rank = ROLE_CONSTANTS.OWNER.RANK;
      dbData.overall_grade = ROLE_CONSTANTS.OWNER.GRADE;
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
    } else if (staffToUpdate.role === ROLE_CONSTANTS.MANAGER.ROLE || isOwner) {
      // CRITICAL FIX: For Owner role, ensure we properly flag it in the database
      if (isOwner) {
        dbData.role = ROLE_CONSTANTS.OWNER.ROLE;
        dbData.rank = ROLE_CONSTANTS.OWNER.RANK;
        dbData.overall_grade = ROLE_CONSTANTS.OWNER.GRADE;
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
      staffToUpdate.role = ROLE_CONSTANTS.OWNER.ROLE;
      staffToUpdate.rank = ROLE_CONSTANTS.OWNER.RANK;
      staffToUpdate.overallGrade = ROLE_CONSTANTS.OWNER.GRADE;
      console.log("updateStaffMember: Returning staff with Owner role preserved");
    }
    
    return staffToUpdate; // Return the updated staff member
  } catch (error) {
    console.error('Error updating staff member:', error);
    throw error;
  }
};
