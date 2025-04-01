
import { supabase } from './client';

/**
 * Initialize storage buckets required by the application
 */
export const initializeStorage = async () => {
  try {
    // Check if staff-avatars bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking storage buckets:', error.message);
      return;
    }
    
    // Create staff-avatars bucket if it doesn't exist
    if (!buckets.find(bucket => bucket.name === 'staff-avatars')) {
      try {
        const { error: createError } = await supabase.storage.createBucket('staff-avatars', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 5, // 5MB limit
        });
        
        if (createError) {
          console.error('Error creating staff-avatars bucket:', createError.message);
          console.info('Using placeholder image as storage bucket not found');
        } else {
          console.log('Created staff-avatars storage bucket');
        }
      } catch (bucketError) {
        console.error('Failed to create bucket:', bucketError);
        console.info('Using placeholder image as storage bucket not found');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    console.info('Using placeholder image as storage bucket not found');
  }
};

/**
 * Upload a staff avatar image and get a public URL
 * @param file Image file to upload
 * @param staffId ID of the staff member
 * @param role Role of the staff member for organized storage
 * @returns Public URL of the uploaded image or null if failed
 */
export const uploadStaffImage = async (file: File, staffId: string, role: string): Promise<string | null> => {
  try {
    // Create a unique file path for this staff member with a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const filePath = `staff/${role.toLowerCase()}/${staffId}_${timestamp}`;
    
    // Upload the image
    const { data, error } = await supabase.storage
      .from('staff-avatars')
      .upload(filePath, file, { 
        upsert: true,
        cacheControl: 'no-cache'
      });
    
    if (error) {
      console.error('Image upload failed:', error.message);
      return null;
    }
    
    // Get the public URL with no-cache parameter
    const { data: publicUrlData } = supabase.storage
      .from('staff-avatars')
      .getPublicUrl(`${filePath}?t=${timestamp}`);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading staff image:', error);
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
        limit: 1,
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

/**
 * Delete all previous images for a staff member
 * This helps clean up storage when updating images
 * @param staffId ID of the staff member
 */
export const cleanupPreviousStaffImages = async (staffId: string): Promise<void> => {
  try {
    // List all files with the staff ID prefix
    const { data, error } = await supabase.storage
      .from('staff-avatars')
      .list('staff', {
        search: staffId
      });
    
    if (error || !data || data.length === 0) {
      return;
    }
    
    // Get paths of all files to delete (skipping the most recent one)
    const filesToDelete = data
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(1) // Skip the most recent file
      .map(file => `staff/${file.name}`);
    
    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('staff-avatars')
        .remove(filesToDelete);
      
      if (deleteError) {
        console.error('Error cleaning up previous images:', deleteError.message);
      }
    }
  } catch (error) {
    console.error('Error in cleanup of staff images:', error);
  }
};
