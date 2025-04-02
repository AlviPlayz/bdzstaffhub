import { supabase } from '@/integrations/supabase/client';
import { StaffMember, StaffRole, LetterGrade, ModeratorMetrics, BuilderMetrics, ManagerMetrics, PerformanceMetric } from '@/types/staff';
import { StaffTableName } from '@/types/database';
import { cleanupPreviousImages, uploadStaffImage as storageUploadStaffImage } from '@/integrations/supabase/storage';

// Function to create a performance metric
const createMetric = (name: string, score: number): PerformanceMetric => {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    score,
    letterGrade: calculateLetterGrade(score)
  };
};

// Helper function to transform database row to StaffMember
const transformToStaffMember = (row: any, role: StaffRole): StaffMember => {
  let metrics: any = {};
  
  // Get the avatar URL, use placeholder if not available
  let avatar = row.profile_image_url || '/placeholder.svg';
  
  // Create metrics based on role
  if (role === 'Moderator') {
    metrics = {
      responsiveness: createMetric('Responsiveness', row.responsiveness || 0),
      fairness: createMetric('Fairness', row.fairness || 0),
      communication: createMetric('Communication', row.communication || 0),
      conflictResolution: createMetric('Conflict Resolution', row.conflict_resolution || 0),
      ruleEnforcement: createMetric('Rule Enforcement', row.rule_enforcement || 0),
      engagement: createMetric('Engagement', row.engagement || 0),
      supportiveness: createMetric('Supportiveness', row.supportiveness || 0),
      adaptability: createMetric('Adaptability', row.adaptability || 0),
      objectivity: createMetric('Objectivity', row.objectivity || 0),
      initiative: createMetric('Initiative', row.initiative || 0)
    };
  } else if (role === 'Builder') {
    metrics = {
      exterior: createMetric('Exterior', row.exterior || 0),
      interior: createMetric('Interior', row.interior || 0),
      decoration: createMetric('Decoration', row.decoration || 0),
      effort: createMetric('Effort', row.effort || 0),
      contribution: createMetric('Contribution', row.contribution || 0),
      communication: createMetric('Communication', row.communication || 0),
      adaptability: createMetric('Adaptability', row.adaptability || 0),
      cooperativeness: createMetric('Cooperativeness', row.cooperativeness || 0),
      // Check if these exist, otherwise use defaults
      creativity: createMetric('Creativity', typeof row.creativity !== 'undefined' ? row.creativity : 0),
      consistency: createMetric('Consistency', typeof row.consistency !== 'undefined' ? row.consistency : 0)
    };
  } else if (role === 'Manager' || role === 'Owner') {
    metrics = {
      // Moderator metrics
      responsiveness: createMetric('Responsiveness', row.responsiveness || 10),
      fairness: createMetric('Fairness', row.fairness || 10),
      communication: createMetric('Communication', row.communication || 10),
      conflictResolution: createMetric('Conflict Resolution', row.conflict_resolution || 10),
      ruleEnforcement: createMetric('Rule Enforcement', row.rule_enforcement || 10),
      engagement: createMetric('Engagement', row.engagement || 10),
      supportiveness: createMetric('Supportiveness', row.supportiveness || 10),
      adaptability: createMetric('Adaptability', row.adaptability || 10),
      objectivity: createMetric('Objectivity', row.objectivity || 10),
      initiative: createMetric('Initiative', row.initiative || 10),
      // Builder metrics
      exterior: createMetric('Exterior', row.exterior || 10),
      interior: createMetric('Interior', row.interior || 10),
      decoration: createMetric('Decoration', row.decoration || 10),
      effort: createMetric('Effort', row.effort || 10),
      contribution: createMetric('Contribution', row.contribution || 10),
      cooperativeness: createMetric('Cooperativeness', row.cooperativeness || 10),
      creativity: createMetric('Creativity', typeof row.creativity !== 'undefined' ? row.creativity : 10),
      consistency: createMetric('Consistency', typeof row.consistency !== 'undefined' ? row.consistency : 10)
    };
  }
  
  // Calculate overall score
  const metricEntries = Object.values(metrics);
  // Use typed values with proper type guard
  const scores = metricEntries.map(metric => {
    const typedMetric = metric as PerformanceMetric;
    return typeof typedMetric.score === 'number' ? typedMetric.score : 0;
  });
  
  const overallScore = scores.length > 0 
    ? parseFloat((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
    : 0;
  
  return {
    id: row.id,
    name: row.name,
    role: role,
    avatar: avatar,
    metrics: metrics,
    overallScore: overallScore,
    overallGrade: row.overall_grade || calculateLetterGrade(overallScore)
  };
};

// Helper function to transform StaffMember to database format
const transformToDatabase = (staff: StaffMember): any => {
  // Common fields
  const dbObject: any = {
    name: staff.name,
    rank: 'Senior', // Default rank if not specified
    profile_image_url: staff.avatar
  };

  // Set overall_grade
  dbObject.overall_grade = staff.overallGrade;

  // Add metrics based on role
  if (staff.role === 'Moderator') {
    const metrics = staff.metrics as ModeratorMetrics;
    dbObject.responsiveness = metrics.responsiveness.score;
    dbObject.fairness = metrics.fairness.score;
    dbObject.communication = metrics.communication.score;
    dbObject.conflict_resolution = metrics.conflictResolution.score;
    dbObject.rule_enforcement = metrics.ruleEnforcement.score;
    dbObject.engagement = metrics.engagement.score;
    dbObject.supportiveness = metrics.supportiveness.score;
    dbObject.adaptability = metrics.adaptability.score;
    dbObject.objectivity = metrics.objectivity ? metrics.objectivity.score : 0;
    dbObject.initiative = metrics.initiative ? metrics.initiative.score : 0;
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
  } else if (staff.role === 'Builder') {
    const metrics = staff.metrics as BuilderMetrics;
    dbObject.exterior = metrics.exterior.score;
    dbObject.interior = metrics.interior.score;
    dbObject.decoration = metrics.decoration.score;
    dbObject.effort = metrics.effort.score;
    dbObject.contribution = metrics.contribution.score;
    dbObject.communication = metrics.communication.score;
    dbObject.adaptability = metrics.adaptability.score;
    dbObject.cooperativeness = metrics.cooperativeness.score;
    // Only add these if they exist in the database schema
    if (metrics.creativity) dbObject.creativity = metrics.creativity.score;
    if (metrics.consistency) dbObject.consistency = metrics.consistency.score;
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
  } else if (staff.role === 'Manager' || staff.role === 'Owner') {
    const metrics = staff.metrics as ManagerMetrics;
    // Moderator metrics
    dbObject.responsiveness = metrics.responsiveness.score;
    dbObject.fairness = metrics.fairness.score;
    dbObject.communication = metrics.communication.score;
    dbObject.conflict_resolution = metrics.conflictResolution.score;
    dbObject.rule_enforcement = metrics.ruleEnforcement.score;
    dbObject.engagement = metrics.engagement.score;
    dbObject.supportiveness = metrics.supportiveness.score;
    dbObject.adaptability = metrics.adaptability.score;
    dbObject.objectivity = metrics.objectivity ? metrics.objectivity.score : 0;
    dbObject.initiative = metrics.initiative ? metrics.initiative.score : 0;
    // Builder metrics
    dbObject.exterior = metrics.exterior.score;
    dbObject.interior = metrics.interior.score;
    dbObject.decoration = metrics.decoration.score;
    dbObject.effort = metrics.effort.score;
    dbObject.contribution = metrics.contribution.score;
    dbObject.cooperativeness = metrics.cooperativeness.score;
    // Only add these if they exist in the metrics
    if (metrics.creativity) dbObject.creativity = metrics.creativity.score;
    if (metrics.consistency) dbObject.consistency = metrics.consistency.score;
    // Add staff_id if not present
    if (!dbObject.staff_id) {
      dbObject.staff_id = `BDZ-${Math.floor(100 + Math.random() * 900)}`;
    }
  }

  return dbObject;
};

// Function to fetch all staff members
export const getAllStaff = async (): Promise<StaffMember[]> => {
  try {
    console.log("getAllStaff: Fetching staff data from Supabase");
    
    // Fetch moderators
    const { data: moderators, error: modError } = await supabase
      .from('moderators')
      .select('*');

    // Fetch builders
    const { data: builders, error: buildError } = await supabase
      .from('builders')
      .select('*');

    // Fetch managers
    const { data: managers, error: mgrError } = await supabase
      .from('managers')
      .select('*');

    if (modError || buildError || mgrError) {
      console.error('Error fetching staff:', modError || buildError || mgrError);
      throw modError || buildError || mgrError;
    }

    // Transform each row to StaffMember
    const modStaff = (moderators || []).map(row => transformToStaffMember(row, 'Moderator'));
    const buildStaff = (builders || []).map(row => transformToStaffMember(row, 'Builder'));
    const mgrStaff = (managers || []).map(row => transformToStaffMember(row, 'Manager'));
    
    console.log(`getAllStaff: Found ${modStaff.length} moderators, ${buildStaff.length} builders, ${mgrStaff.length} managers`);

    // Combine all staff
    return [...modStaff, ...buildStaff, ...mgrStaff];
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
    return transformToStaffMember(result[0], staffData.role);
  } catch (error) {
    console.error('Error adding staff member:', error);
    throw error;
  }
};

// Function to update an existing staff member
export const updateStaffMember = async (staff: StaffMember) => {
  try {
    console.log(`updateStaffMember: Updating staff member ${staff.id} (${staff.name})`);
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
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing staff member:', error);
    throw error;
    return false;
  }
};

// Function to get staff member by ID
export const getStaffMemberById = async (staffId: string): Promise<StaffMember | null> => {
  try {
    // Try to find in moderators
    const { data: modData, error: modError } = await supabase
      .from('moderators')
      .select('*')
      .eq('id', staffId)
      .maybeSingle();
    
    if (modData) {
      return transformToStaffMember(modData, 'Moderator');
    }
    
    // Try to find in builders
    const { data: buildData, error: buildError } = await supabase
      .from('builders')
      .select('*')
      .eq('id', staffId)
      .maybeSingle();
    
    if (buildData) {
      return transformToStaffMember(buildData, 'Builder');
    }
    
    // Try to find in managers
    const { data: mgrData, error: mgrError } = await supabase
      .from('managers')
      .select('*')
      .eq('id', staffId)
      .maybeSingle();
    
    if (mgrData) {
      return transformToStaffMember(mgrData, 'Manager');
    }
    
    return null;
  } catch (error) {
    console.error('Error in getStaffMemberById:', error);
    return null;
  }
};

// Function to handle staff image uploads and save permanent URLs
export const uploadStaffImage = async (file: File, staffId: string, role: StaffRole): Promise<string | null> => {
  try {
    console.log(`uploadStaffImage: Uploading image for staff ${staffId} (${role})`);
    
    // Upload the image using the storage service
    const avatarUrl = await storageUploadStaffImage(file, staffId, role);
    
    if (!avatarUrl) {
      console.error('uploadStaffImage: Failed to upload image');
      return null;
    }
    
    console.log("uploadStaffImage: Image uploaded successfully, URL:", avatarUrl);
    
    return avatarUrl;
  } catch (error) {
    console.error('Error uploading staff image:', error);
    return null;
  }
};

// Function to calculate letter grade based on score
export const calculateLetterGrade = (score: number): LetterGrade => {
  // For Managers and Owners, always return SSS+
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

// Function to calculate overall score and grade
export const calculateOverallScoreAndGrade = (staff: StaffMember): { overallScore: number; overallGrade: LetterGrade } => {
  // Special case for Managers and Owners
  if (staff.role === 'Manager' || staff.role === 'Owner') {
    return { overallScore: 10, overallGrade: 'SSS+' };
  }

  const metricValues = Object.values(staff.metrics);
  
  // Calculate overall score with type safety
  let totalScore = 0;
  let validMetrics = 0;
  
  metricValues.forEach(metric => {
    const typedMetric = metric as PerformanceMetric;
    if (typeof typedMetric.score === 'number') {
      totalScore += typedMetric.score;
      validMetrics++;
    }
  });
  
  const average = validMetrics > 0 ? parseFloat((totalScore / validMetrics).toFixed(1)) : 0;
  const overallGrade = calculateLetterGrade(average);

  return { overallScore: average, overallGrade };
};

// Function to subscribe to real-time updates
export const subscribeToRealTimeUpdates = (table: string, callback: () => void) => {
  console.log(`subscribeToRealTimeUpdates: Setting up subscription for table ${table}`);
  
  const channel = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      console.log(`Real-time update received for ${table}:`, payload.eventType);
      callback();
    })
    .subscribe();

  return () => {
    console.log(`Removing subscription for table ${table}`);
    supabase.removeChannel(channel);
  };
};

// Function to create a new staff member
export const createStaffMember = async (data: Omit<StaffMember, 'id'>) => {
  try {
    console.log(`createStaffMember: Adding new ${data.role} - ${data.name}`);
    
    const staffData = data as StaffMember;
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
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting staff member:', error);
    throw error;
    return false;
  }
};

/**
 * Handle staff image uploads and update profile image URL in database
 */
export const updateStaffAvatar = async (file: File, staffId: string, role: StaffRole): Promise<string | null> => {
  try {
    // Upload the image to storage and get the URL
    const imageUrl = await uploadStaffImage(file, staffId, role);
    
    if (!imageUrl) {
      return null;
    }
    
    // Update the staff member's profile image in the database
    if (role === 'Moderator') {
      await supabase
        .from('moderators')
        .update({ profile_image_url: imageUrl })
        .eq('id', staffId);
    } else if (role === 'Builder') {
      await supabase
        .from('builders')
        .update({ profile_image_url: imageUrl })
        .eq('id', staffId);
    } else if (role === 'Manager' || role === 'Owner') {
      await supabase
        .from('managers')
        .update({ profile_image_url: imageUrl })
        .eq('id', staffId);
    }
    
    // Cleanup previous images to save storage
    await cleanupPreviousImages(staffId);
    
    return imageUrl;
  } catch (error) {
    console.error('Error updating staff avatar:', error);
    return null;
  }
};

/**
 * Get a staff member's avatar URL
 * If the image doesn't exist, returns a placeholder
 * @param staffId ID of the staff member
 * @returns Public URL of the image or a placeholder
 */
export const getStaffImageUrl = async (staffId: string): Promise<string> => {
  try {
    // Try to find the image by listing the files with the staff ID prefix
    const { data, error } = await supabase.storage
      .from('staff-avatars')
      .list('staff', {
        limit: 100,
        search: staffId
      });
    
    if (error || !data || data.length === 0) {
      return '/placeholder.svg';
    }
    
    // Get the latest file for this staff
    const latestFile = data.sort((a, b) => {
      // Sort by created_at in descending order (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })[0];
    
    // Get the public URL with a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const { data: publicUrlData } = supabase.storage
      .from('staff-avatars')
      .getPublicUrl(`staff/${latestFile.name}?t=${timestamp}`);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error getting staff image:', error);
    return '/placeholder.svg';
  }
};
