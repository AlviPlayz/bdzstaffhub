
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
 * @returns Public URL of the uploaded image or null if failed
 */
export const uploadStaffImage = async (file: File, staffId: string): Promise<string | null> => {
  try {
    // Create a unique file path for this staff member with a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const filePath = `staff/${staffId}_${timestamp}`;
    
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
