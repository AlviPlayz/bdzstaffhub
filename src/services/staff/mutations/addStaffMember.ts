
import { supabase } from '@/integrations/supabase/client';
import { StaffMember, StaffRole, LetterGrade, ModeratorMetrics, BuilderMetrics, ManagerMetrics, OwnerMetrics } from '@/types/staff';
import { transformToStaffMember, transformToDatabase } from '../transforms';
import { createImmeasurableMetrics } from '../staffGrading';

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
      // Replace metrics with immeasurable ones - properly cast to the correct type
      if (staffData.role === 'Manager') {
        // Use as unknown first to avoid TypeScript errors
        staffData.metrics = createImmeasurableMetrics(staffData.role) as unknown as ManagerMetrics;
      } else {
        // Use as unknown first to avoid TypeScript errors
        staffData.metrics = createImmeasurableMetrics(staffData.role) as unknown as OwnerMetrics;
      }
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
      // Cast to the proper type based on role
      if (staffData.role === 'Manager') {
        staffMember.metrics = createImmeasurableMetrics(staffData.role) as unknown as ManagerMetrics;
      } else {
        staffMember.metrics = createImmeasurableMetrics(staffData.role) as unknown as OwnerMetrics;
      }
      staffMember.overallGrade = 'SSS+';
    }
    
    return staffMember;
  } catch (error) {
    console.error('Error adding staff member:', error);
    throw error;
  }
};
