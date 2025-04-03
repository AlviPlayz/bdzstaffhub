
import { supabase } from './client';
import { 
  initializeStaffImageStorage, 
  uploadStaffImage, 
  getStaffImageUrl as getStaffImageUrlNew,
  cleanupPreviousImages as cleanupPreviousImagesNew
} from '@/services/staff/staffImageService';

// This file redirects all storage operations to the new staffImageService module

export const initializeStorage = async () => {
  console.log('initializeStorage: Redirecting to staffImageService');
  try {
    return await initializeStaffImageStorage();
  } catch (error) {
    console.error('Storage initialization error:', error);
    // Don't throw the error - allow the application to continue even if bucket creation fails
  }
};

export const storageUploadStaffImage = async (file: File, staffId: string, role: string): Promise<string> => {
  console.log(`storageUploadStaffImage: Uploading image for ${staffId} (${role})`);
  try {
    const imageUrl = await uploadStaffImage(file, staffId, role as any);
    console.log(`storageUploadStaffImage: Successfully uploaded image to ${imageUrl}`);
    return imageUrl || '/placeholder.svg';
  } catch (error) {
    console.error('Image upload error:', error);
    return '/placeholder.svg';
  }
};

export const getStaffImageUrl = async (staffId: string): Promise<string> => {
  console.log(`getStaffImageUrl: Getting image URL for ${staffId}`);
  try {
    return await getStaffImageUrlNew(staffId);
  } catch (error) {
    console.error('Error getting image URL:', error);
    return '/placeholder.svg';
  }
};

export const cleanupPreviousImages = async (staffId: string): Promise<void> => {
  console.log(`cleanupPreviousImages: Cleaning up images for ${staffId}`);
  try {
    return await cleanupPreviousImagesNew(staffId);
  } catch (error) {
    console.error('Error cleaning up images:', error);
  }
};
