
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
      const { error: createError } = await supabase.storage.createBucket('staff-avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 5, // 5MB limit
      });
      
      if (createError) {
        console.error('Error creating staff-avatars bucket:', createError.message);
      } else {
        console.log('Created staff-avatars storage bucket');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};
