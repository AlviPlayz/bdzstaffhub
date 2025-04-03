
import { supabase } from '@/integrations/supabase/client';
import { StaffMember, StaffRole, LetterGrade } from '@/types/staff';
import { transformToStaffMember, transformToDatabase } from './staffTransforms';
import { cleanupPreviousImages } from './staffImageService';
import { createImmeasurableMetrics } from './staffGrading';

// Function to add a new staff member
export const addStaffMember = async (data: any) => {
  try {
    // Set default rank based on role if not provided
    let staffData = { ...data };
    
    if (!staffData.rank) {
      if (staffData.role === 'Moderator') {
        staffData.rank = 'Trial Mod';
      } else if (staffData.role === 'Builder') {
        staffData.rank = 'Trial Builder';
      } else if (staffData.role === 'Manager' || staffData.role === 'Owner') {
        staffData.rank = 'Manager';
      }
    }
    
    // For Managers and Owners, ensure they have proper metrics
    if (staffData.role === 'Manager' || staffData.role === 'Owner') {
      // Replace metrics with immeasurable ones
      staffData.metrics = createImmeasurableMetrics(staffData.role);
      // Set SSS+ overall grade
      staffData.overallGrade = 'SSS+' as LetterGrade;
    }
    
    let result;
    
    if (staffData.role === 'Moderator') {
      const { data: newStaff, error } = await supabase
        .from('moderators')
        .insert([transformToDatabase(staffData)])
        .select();
      if (error) throw error;
      result = newStaff;
    } else if (staffData.role === 'Builder') {
      const { data: newStaff, error } = await supabase
        .from('builders')
        .insert([transformToDatabase(staffData)])
        .select();
      if (error) throw error;
      result = newStaff;
    } else if (staffData.role === 'Manager' || staffData.role === 'Owner') {
      const { data: newStaff, error } = await supabase
        .from('managers')
        .insert([transformToDatabase(staffData)])
        .select();
      if (error) throw error;
      result = newStaff;
    }

    if (!result || result.length === 0) {
      throw new Error('Failed to insert staff member');
    }

    // Transform the result back to a StaffMember before returning
    const staffMember = transformToStaffMember(result[0], staffData.role);
    
    // For Managers and Owners, ensure they have immeasurable metrics
    if (staffData.role === 'Manager' || staffData.role === 'Owner') {
      staffMember.metrics = createImmeasurableMetrics(staffData.role);
      staffMember.overallGrade = 'SSS+';
    }
    
    return staffMember;
  } catch (error) {
    console.error('Error adding staff member:', error);
    throw error;
  }
};

// Function to update an existing staff member
export const updateStaffMember = async (staff: StaffMember) => {
  try {
    console.log(`updateStaffMember: Updating staff member ${staff.id} (${staff.name})`);
    
    // For Managers and Owners, ensure they have immeasurable metrics
    if (staff.role === 'Manager' || staff.role === 'Owner') {
      staff.metrics = createImmeasurableMetrics(staff.role);
      staff.overallGrade = 'SSS+';
    }
    
    const dbData = transformToDatabase(staff);
    
    // Ensure avatar URL is correctly set
    if (staff.avatar && staff.avatar !== '/placeholder.svg') {
      dbData.profile_image_url = staff.avatar;
      console.log("updateStaffMember: Avatar URL set to", staff.avatar);
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
      const { error } = await supabase
        .from('managers')
        .update(dbData)
        .eq('id', staff.id);
      if (error) throw error;
    }
    
    // Cleanup previous images for this staff member
    await cleanupPreviousImages(staff.id);
    
    return staff; // Return the updated staff member
  } catch (error) {
    console.error('Error updating staff member:', error);
    throw error;
  }
};

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

// Function to create a new staff member
export const createStaffMember = async (data: Omit<StaffMember, 'id'>) => {
  try {
    console.log(`createStaffMember: Adding new ${data.role} - ${data.name}`);
    
    // Set default rank based on role if not provided
    let staffData = { ...data } as StaffMember;
    
    if (!staffData.rank) {
      if (staffData.role === 'Moderator') {
        staffData.rank = 'Trial Mod';
      } else if (staffData.role === 'Builder') {
        staffData.rank = 'Trial Builder';
      } else if (staffData.role === 'Manager' || staffData.role === 'Owner') {
        staffData.rank = 'Manager';
      }
    }
    
    // For Managers and Owners, ensure they have proper metrics
    if (staffData.role === 'Manager' || staffData.role === 'Owner') {
      // Replace metrics with immeasurable ones
      staffData.metrics = createImmeasurableMetrics(staffData.role);
      // Set SSS+ overall grade
      staffData.overallGrade = 'SSS+';
    }
    
    staffData.id = crypto.randomUUID(); // Temporary ID for transformation
    
    const dbData = transformToDatabase(staffData);
    
    // Ensure avatar URL is correctly set
    if (data.avatar && data.avatar !== '/placeholder.svg') {
      dbData.profile_image_url = data.avatar;
      console.log("createStaffMember: Avatar URL set to", data.avatar);
    } else {
      console.log("createStaffMember: Using placeholder avatar");
    }
    
    let result;
    
    if (data.role === 'Moderator') {
      const { data: newStaff, error } = await supabase
        .from('moderators')
        .insert([dbData])
        .select();
      if (error) throw error;
      result = newStaff?.[0];
    } else if (data.role === 'Builder') {
      // Create a builder-specific object only with properties from the schema
      const builderData = {
        name: dbData.name,
        rank: dbData.rank,
        profile_image_url: dbData.profile_image_url,
        staff_id: dbData.staff_id,
        overall_grade: dbData.overall_grade,
        exterior: dbData.exterior,
        interior: dbData.interior,
        decoration: dbData.decoration,
        effort: dbData.effort,
        contribution: dbData.contribution,
        communication: dbData.communication,
        adaptability: dbData.adaptability,
        cooperativeness: dbData.cooperativeness,
        creativity: dbData.creativity,
        consistency: dbData.consistency
      };
      
      const { data: newStaff, error } = await supabase
        .from('builders')
        .insert([builderData])
        .select();
      if (error) throw error;
      result = newStaff?.[0];
    } else if (data.role === 'Manager' || data.role === 'Owner') {
      const { data: newStaff, error } = await supabase
        .from('managers')
        .insert([dbData])
        .select();
      if (error) throw error;
      result = newStaff?.[0];
    }

    if (!result) {
      throw new Error('Failed to create staff member');
    }

    console.log("createStaffMember: Staff member created with ID", result.id);
    
    // Transform the result back to a StaffMember before returning
    const transformedResult = transformToStaffMember(result, data.role);
    
    // For Managers and Owners, ensure they have immeasurable metrics
    if (data.role === 'Manager' || data.role === 'Owner') {
      transformedResult.metrics = createImmeasurableMetrics(data.role);
      transformedResult.overallGrade = 'SSS+';
    }
    
    // Make sure the avatar URL is preserved
    if (data.avatar && data.avatar !== '/placeholder.svg') {
      transformedResult.avatar = data.avatar;
    }
    
    return transformedResult;
  } catch (error) {
    console.error('Error creating staff member:', error);
    throw error;
  }
};

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
