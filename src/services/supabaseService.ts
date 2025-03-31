// src/services/supabaseService.ts
import { supabase } from '../supabaseClient';
import { StaffMember, StaffRole, LetterGrade } from '../types/staff';

// Function to fetch all staff members
export const getAllStaff = async (): Promise<StaffMember[]> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*');

    if (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }

    return data as StaffMember[];
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    throw error;
  }
};

// Function to add a new staff member
export const addStaffMember = async (data: any) => {
  try {
    // For safety, ensure rank exists with a default value if needed
    const staffData = {
      ...data,
      rank: data.rank || 'Trial' // Provide a default rank if not present
    };
    
    const { data: newStaff, error } = await supabase
      .from('staff')
      .insert([staffData])
      .select();

    if (error) {
      console.error('Error adding staff member:', error);
      throw error;
    }

    return newStaff;
  } catch (error) {
    console.error('Error adding staff member:', error);
    throw error;
  }
};

// Function to update an existing staff member
export const updateStaffMember = async (staff: StaffMember) => {
  try {
    const { error } = await supabase
      .from('staff')
      .update(staff)
      .eq('id', staff.id);

    if (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating staff member:', error);
    throw error;
  }
};

// Function to remove a staff member
export const removeStaffMember = async (staffId: string, role: StaffRole) => {
  try {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', staffId);

    if (error) {
      console.error('Error removing staff member:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error removing staff member:', error);
    throw error;
  }
};

// Function to get staff member by ID
export const getStaffMemberById = async (staffId: string): Promise<StaffMember | null> => {
    try {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .eq('id', staffId)
            .single();

        if (error) {
            console.error('Error fetching staff member by ID:', error);
            throw error;
        }

        return data as StaffMember;
    } catch (error) {
        console.error('Error in getStaffMemberById:', error);
        return null;
    }
};

// Function to calculate overall score and grade
export const calculateOverallScoreAndGrade = (staff: StaffMember): { overallScore: number; overallGrade: LetterGrade } => {
    const metricValues = Object.values(staff.metrics);
    const totalScore = metricValues.reduce((sum, metric) => sum + metric.score, 0);
    const average = parseFloat((totalScore / metricValues.length).toFixed(1));

    let overallGrade: LetterGrade;
    if (staff.role === 'Manager' || staff.role === 'Owner') {
        overallGrade = 'SSS+';
    } else {
        overallGrade = calculateLetterGrade(average);
    }

    return { overallScore: average, overallGrade };
};

// Function to calculate letter grade based on score
export const calculateLetterGrade = (score: number): LetterGrade => {
    if (score >= 9) return 'S+';
    if (score >= 8) return 'S';
    if (score >= 7.5) return 'A+';
    if (score >= 7) return 'A';
    if (score >= 6.5) return 'B+';
    if (score >= 6) return 'B';
    if (score >= 5) return 'C';
    if (score >= 4) return 'D';
    if (score >= 3) return 'E';
    return 'E-';
};
