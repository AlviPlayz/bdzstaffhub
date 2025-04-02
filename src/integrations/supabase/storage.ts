
import { supabase } from './client';
import { 
  initializeStaffImageStorage, 
  uploadStaffImage, 
  getStaffImageUrl as getStaffImageUrlNew,
  cleanupPreviousImages as cleanupPreviousImagesNew
} from '@/services/staff/staffImageService';

// This file has been deprecated in favor of src/services/staff/staffImageService.ts
// Keeping this stub for backward compatibility until all references are updated

export const initializeStorage = async () => {
  console.warn('initializeStorage is deprecated. Use initializeStaffImageStorage from staffImageService.ts instead');
  // Forward to the new service
  return initializeStaffImageStorage();
};

export const storageUploadStaffImage = async (file: File, staffId: string, role: string): Promise<string> => {
  console.warn('storageUploadStaffImage is deprecated. Use uploadStaffImage from staffImageService.ts instead');
  // Forward to the new service
  return uploadStaffImage(file, staffId, role as any) || '/placeholder.svg';
};

export const getStaffImageUrl = async (staffId: string): Promise<string> => {
  console.warn('getStaffImageUrl is deprecated. Use getStaffImageUrl from staffImageService.ts instead');
  // Forward to the new service
  return getStaffImageUrlNew(staffId);
};

export const cleanupPreviousImages = async (staffId: string): Promise<void> => {
  console.warn('cleanupPreviousImages is deprecated. Use cleanupPreviousImages from staffImageService.ts instead');
  // Forward to the new service
  return cleanupPreviousImagesNew(staffId);
};
