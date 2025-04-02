
import { supabase } from '@/integrations/supabase/client';
import { StaffRole } from '@/types/staff';

/**
 * Initialize storage bucket for staff images
 */
export const initializeStaffImageStorage = async (): Promise<void> => {
  try {
    console.log('Initializing staff image storage...');
    
    // Check if staff_images bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking storage buckets:', error.message);
      return;
    }
    
    // Create staff_images bucket if it doesn't exist
    if (!buckets.find(bucket => bucket.name === 'staff_images')) {
      try {
        console.log('Creating staff_images bucket...');
        const { error: createError } = await supabase.storage.createBucket('staff_images', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 5, // 5MB limit
        });
        
        if (createError) {
          console.error('Error creating staff_images bucket:', createError.message);
        } else {
          console.log('Created staff_images storage bucket successfully');
          
          // Set public policy for the bucket
          const { error: policyError } = await supabase.storage.from('staff_images')
            .createSignedUrl('dummy.txt', 60);
            
          if (policyError) {
            console.log('Note: Policy setup might require manual configuration in Supabase dashboard');
          }
        }
      } catch (bucketError) {
        console.error('Failed to create bucket:', bucketError);
      }
    } else {
      console.log('staff_images bucket already exists');
    }
  } catch (error) {
    console.error('Error initializing staff image storage:', error);
  }
};

/**
 * Handle staff image uploads and update profile image URL in database
 */
export const updateStaffAvatar = async (file: File, staffId: string, role: StaffRole): Promise<string | null> => {
  try {
    console.log(`Updating avatar for staff ${staffId} (${role})...`);
    
    // Upload the image to storage and get the URL
    const imageUrl = await uploadStaffImage(file, staffId, role);
    
    if (!imageUrl) {
      console.error('Failed to get image URL after upload');
      return null;
    }
    
    console.log(`Successfully uploaded image, URL: ${imageUrl}`);
    
    // Update the staff member's profile image in the database
    const tableName = getTableNameForRole(role);
    
    const { error } = await supabase
      .from(tableName)
      .update({ profile_image_url: imageUrl })
      .eq('id', staffId);
      
    if (error) {
      console.error(`Error updating ${role} avatar in database:`, error);
      return null;
    }
    
    console.log(`Successfully updated ${staffId} avatar in database`);
    
    // Cleanup previous images to save storage
    await cleanupPreviousImages(staffId);
    
    return imageUrl;
  } catch (error) {
    console.error('Error updating staff avatar:', error);
    return null;
  }
};

// Function to handle staff image uploads and save permanent URLs
export const uploadStaffImage = async (file: File, staffId: string, role: StaffRole): Promise<string | null> => {
  try {
    console.log(`uploadStaffImage: Uploading image for staff ${staffId} (${role})`);
    await initializeStaffImageStorage();
    
    // Create a unique file path with staff ID to ensure uniqueness
    const fileExt = file.name.split('.').pop();
    const fileName = `staff-${staffId}-${Date.now()}.${fileExt}`;
    const filePath = `${role.toLowerCase()}/${fileName}`;
    
    console.log(`Uploading to path: ${filePath}`);
    
    // Upload the image
    const { data, error } = await supabase.storage
      .from('staff_images')
      .upload(filePath, file, { 
        upsert: true,
        cacheControl: 'no-cache'
      });
    
    if (error) {
      console.error('Image upload failed:', error.message);
      return null;
    }
    
    console.log('Image upload successful, getting public URL');
    
    // Get the public URL with cache-busting parameter
    const timestamp = Date.now();
    const { data: publicUrlData } = supabase.storage
      .from('staff_images')
      .getPublicUrl(`${filePath}?t=${timestamp}`);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('Failed to get public URL');
      return null;
    }
    
    console.log(`Generated public URL: ${publicUrlData.publicUrl}`);
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
      .from('staff_images')
      .list('', {
        limit: 100,
        search: `staff-${staffId}`
      });
    
    if (error || !data || data.length === 0) {
      console.log(`No images found for staff ${staffId}, using placeholder`);
      return '/placeholder.svg';
    }
    
    // Get the latest file for this staff
    const latestFile = data
      .filter(file => file.name.includes(`staff-${staffId}`))
      .sort((a, b) => {
        // Sort by created_at in descending order (newest first)
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      })[0];
    
    if (!latestFile) {
      console.log(`No matching images found for staff ${staffId}, using placeholder`);
      return '/placeholder.svg';
    }
    
    // Get the public URL with a timestamp to prevent caching
    const timestamp = Date.now();
    const { data: publicUrlData } = supabase.storage
      .from('staff_images')
      .getPublicUrl(`${latestFile.name}?t=${timestamp}`);
    
    if (!publicUrlData.publicUrl) {
      return '/placeholder.svg';
    }
    
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
export const cleanupPreviousImages = async (staffId: string): Promise<void> => {
  try {
    // List all files with the staff ID prefix
    const { data, error } = await supabase.storage
      .from('staff_images')
      .list('', {
        search: `staff-${staffId}`
      });
    
    if (error || !data || data.length <= 1) {
      return; // No cleanup needed if 0 or 1 file
    }
    
    // Get paths of all files to delete (skipping the most recent one)
    const filesToDelete = data
      .filter(file => file.name.includes(`staff-${staffId}`))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(1) // Skip the most recent file
      .map(file => file.name);
    
    if (filesToDelete.length > 0) {
      console.log(`Cleaning up ${filesToDelete.length} previous images for staff ${staffId}`);
      const { error: deleteError } = await supabase.storage
        .from('staff_images')
        .remove(filesToDelete);
      
      if (deleteError) {
        console.error('Error cleaning up previous images:', deleteError.message);
      }
    }
  } catch (error) {
    console.error('Error in cleanup of staff images:', error);
  }
};

/**
 * Helper function to get the table name for a given role
 */
const getTableNameForRole = (role: StaffRole): string => {
  switch (role) {
    case 'Moderator':
      return 'moderators';
    case 'Builder':
      return 'builders';
    case 'Manager':
    case 'Owner':
      return 'managers';
    default:
      return 'moderators';
  }
};
