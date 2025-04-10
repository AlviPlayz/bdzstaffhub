
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
    
    // Create staff_images bucket if it doesn't exist (this will likely not be needed anymore after SQL migration)
    const bucketExists = buckets.find(bucket => bucket.name === 'staff_images');
    
    if (!bucketExists) {
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
    
    // Try to initialize storage - don't wait for it to complete
    initializeStaffImageStorage().catch(err => console.error('Storage init error during upload:', err));
    
    // Create a unique file path with staff ID to ensure uniqueness
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `staff-${staffId}-${timestamp}.${fileExt}`;
    const filePath = `${role.toLowerCase()}/${fileName}`;
    
    console.log(`Uploading to path: ${filePath}`);
    
    // Upload the image - retry mechanism with better error handling
    let uploadResult;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        uploadResult = await supabase.storage
          .from('staff_images')
          .upload(filePath, file, { 
            upsert: true,
            cacheControl: '3600'
          });
        
        if (!uploadResult.error) break;
        
        console.error(`Upload attempt ${retries + 1} failed:`, uploadResult.error);
        retries++;
        
        if (retries >= maxRetries) {
          throw new Error(`Upload failed after ${maxRetries} attempts: ${uploadResult.error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait longer between retries
      } catch (uploadError) {
        console.error(`Upload attempt ${retries + 1} error:`, uploadError);
        retries++;
        if (retries >= maxRetries) throw uploadError;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (uploadResult?.error) {
      console.error('Image upload failed after retries:', uploadResult.error.message);
      return null;
    }
    
    console.log('Image upload successful, getting public URL');
    
    // Get the public URL with stronger cache busting
    const { data: publicUrlData } = supabase.storage
      .from('staff_images')
      .getPublicUrl(filePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('Failed to get public URL');
      return null;
    }
    
    // Add a cache-busting parameter with timestamp
    const publicUrl = new URL(publicUrlData.publicUrl);
    publicUrl.searchParams.set('t', timestamp.toString());
    
    const finalUrl = publicUrl.toString();
    console.log(`Generated public URL: ${finalUrl}`);
    
    // Test the URL accessibility
    try {
      const testFetch = await fetch(finalUrl, { method: 'HEAD' });
      if (!testFetch.ok) {
        console.warn(`Image URL test failed with status ${testFetch.status}. URL might not be accessible.`);
      } else {
        console.log('Image URL is accessible');
      }
    } catch (fetchError) {
      console.warn('Could not verify image URL accessibility:', fetchError);
    }
    
    return finalUrl;
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
    console.log(`getStaffImageUrl: Searching for images for staff ${staffId}`);
    
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
    
    // Get directory the file is in, if any
    const pathParts = latestFile.name.split('/');
    let filePath = latestFile.name;
    
    // If file is in a directory within bucket
    if (latestFile.id && latestFile.id.includes('/')) {
      filePath = latestFile.id;
    }
    
    // Get the public URL with strong cache busting
    const timestamp = Date.now();
    const { data: publicUrlData } = supabase.storage
      .from('staff_images')
      .getPublicUrl(filePath);
    
    if (!publicUrlData.publicUrl) {
      return '/placeholder.svg';
    }
    
    // Add cache-busting parameter
    const publicUrl = new URL(publicUrlData.publicUrl);
    publicUrl.searchParams.set('t', timestamp.toString());
    
    console.log(`Found image for staff ${staffId}: ${publicUrl.toString()}`);
    return publicUrl.toString();
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
    console.log(`cleanupPreviousImages: Looking for old images for staff ${staffId}`);
    
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
