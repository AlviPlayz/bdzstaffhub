
import { supabase } from '@/integrations/supabase/client';
import { StaffMember, StaffRole, ManagerMetrics, OwnerMetrics } from '@/types/staff';
import { transformToStaffMember, transformToDatabase } from '../staffTransforms';
import { createImmeasurableMetrics } from '../staffGrading';

// Function to create a new staff member
export const createStaffMember = async (data: Omit<StaffMember, 'id'>) => {
  try {
    console.log(`createStaffMember: Adding new ${data.role} - ${data.name}`);
    
    // Set default rank based on role if not provided
    let staffData = { ...data } as StaffMember;
    
    // Force Owner rank for Owner role regardless of what was provided
    if (staffData.role === 'Owner') {
      staffData.rank = 'Owner';
    } else if (!staffData.rank) {
      if (staffData.role === 'Moderator') {
        staffData.rank = 'Trial Mod';
      } else if (staffData.role === 'Builder') {
        staffData.rank = 'Trial Builder';
      } else if (staffData.role === 'Manager') {
        staffData.rank = 'Manager';
      }
    }
    
    // For Managers and Owners, ensure they have proper metrics
    if (staffData.role === 'Manager' || staffData.role === 'Owner') {
      // Replace metrics with immeasurable ones - properly cast to the correct type
      if (staffData.role === 'Manager') {
        staffData.metrics = createImmeasurableMetrics(staffData.role) as unknown as ManagerMetrics;
      } else {
        staffData.metrics = createImmeasurableMetrics(staffData.role) as unknown as OwnerMetrics;
      }
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
      // For Owner role, ensure the rank is always "Owner"
      if (data.role === 'Owner') {
        dbData.rank = 'Owner';
      }
      
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
      // Cast to the proper type based on role
      if (data.role === 'Manager') {
        transformedResult.metrics = createImmeasurableMetrics(data.role) as unknown as ManagerMetrics;
      } else {
        transformedResult.metrics = createImmeasurableMetrics(data.role) as unknown as OwnerMetrics;
      }
      transformedResult.overallGrade = 'SSS+';
    }
    
    // Make sure the avatar URL is preserved
    if (data.avatar && data.avatar !== '/placeholder.svg') {
      transformedResult.avatar = data.avatar;
    }
    
    // Ensure Owner's rank is preserved in the returned object
    if (data.role === 'Owner') {
      transformedResult.rank = 'Owner';
    }
    
    return transformedResult;
  } catch (error) {
    console.error('Error creating staff member:', error);
    throw error;
  }
};
