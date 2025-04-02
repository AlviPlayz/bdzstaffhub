
import { supabase } from '@/integrations/supabase/client';
import { StaffRole } from '@/types/staff';
import { storageUploadStaffImage, cleanupPreviousImages } from '@/integrations/supabase/storage';

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
