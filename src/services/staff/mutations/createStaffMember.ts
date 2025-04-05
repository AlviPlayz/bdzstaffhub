
import { supabase } from '@/integrations/supabase/client';
import { StaffMember, StaffRole, ManagerMetrics, OwnerMetrics, ROLE_CONSTANTS, enforceRoleRankCombination } from '@/types/staff';
import { transformToStaffMember, transformToDatabase } from '../staffTransforms';
import { createImmeasurableMetrics } from '../staffGrading';

// Function to create a new staff member
export const createStaffMember = async (data: Omit<StaffMember, 'id'>) => {
  try {
    console.log(`createStaffMember: Adding new ${data.role} - ${data.name}`);
    
    // Apply role-rank enforcement
    const enforcedData = enforceRoleRankCombination(data) as Omit<StaffMember, 'id'>;
    
    // Set default rank based on role if not provided
    let staffData = { ...enforcedData } as StaffMember;
    
    // Force Owner rank for Owner role regardless of what was provided
    if (staffData.role === 'Owner') {
      staffData.rank = 'Owner';
      staffData.overallGrade = 'SSS+';
      console.log(`createStaffMember: Enforcing Owner rank and SSS+ grade for ${staffData.name}`);
    } else if (!staffData.rank) {
      if (staffData.role === 'Moderator') {
        staffData.rank = 'Trial Mod';
      } else if (staffData.role === 'Builder') {
        staffData.rank = 'Trial Builder';
      } else if (staffData.role === 'Manager') {
        staffData.rank = 'Manager';
      }
    }
    
    // Handle metrics based on role
    if (staffData.role === 'Manager') {
      // Replace metrics with immeasurable ones - properly cast to the correct type
      staffData.metrics = createImmeasurableMetrics(staffData.role) as unknown as ManagerMetrics;
      // Set SSS+ overall grade for Manager
      staffData.overallGrade = 'SSS+';
    } else if (staffData.role === 'Owner') {
      // Replace metrics with Owner-specific ones - properly cast to the correct type
      staffData.metrics = createImmeasurableMetrics(staffData.role) as unknown as OwnerMetrics;
      // Set SSS+ overall grade for Owner
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
      // CRITICAL FIX: Store both Manager and Owner in the managers table, but maintain their distinct roles
      // For Owner role, ensure the role field is explicitly set to 'Owner'
      if (data.role === 'Owner') {
        dbData.role = 'Owner'; // Explicitly set role field
        dbData.rank = 'Owner';
        dbData.overall_grade = 'SSS+';
        console.log("Creating Owner with explicit role field:", dbData.role);
      } else {
        dbData.role = 'Manager'; // Explicitly set role field for Manager too
      }
      
      const { data: newStaff, error } = await supabase
        .from('managers')
        .insert([dbData])
        .select();
      if (error) {
        console.error("Error inserting manager/owner:", error);
        throw error;
      }
      result = newStaff?.[0];
      console.log("Inserted manager/owner result:", result);
    }

    if (!result) {
      throw new Error('Failed to create staff member');
    }

    console.log("createStaffMember: Staff member created with ID", result.id);
    
    // Transform the result back to a StaffMember - ensure role is preserved
    const transformedResult = transformToStaffMember(result, data.role);
    
    // Make sure the avatar URL is preserved
    if (data.avatar && data.avatar !== '/placeholder.svg') {
      transformedResult.avatar = data.avatar;
    }
    
    // Re-ensure Owner's role is preserved in the returned object
    if (data.role === 'Owner') {
      transformedResult.role = 'Owner';
      transformedResult.rank = 'Owner';
      transformedResult.overallGrade = 'SSS+';
      console.log("Returning Owner with role preserved:", transformedResult.role);
    }
    
    return transformedResult;
  } catch (error) {
    console.error('Error creating staff member:', error);
    throw error;
  }
};
