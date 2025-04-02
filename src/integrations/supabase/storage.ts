import { supabase } from './client';

// This file has been deprecated in favor of src/services/staff/staffImageService.ts
// Keeping this stub for backward compatibility until all references are updated

export const initializeStorage = async () => {
  console.warn('initializeStorage is deprecated. Use initializeStaffImageStorage from staffImageService.ts instead');
  // This is now handled by staffImageService
};

export const storageUploadStaffImage = async (file: File, staffId: string, role: string): Promise<string> => {
  console.warn('storageUploadStaffImage is deprecated. Use uploadStaffImage from staffImageService.ts instead');
  return '/placeholder.svg';
};

export const getStaffImageUrl = async (staffId: string): Promise<string> => {
  console.warn('getStaffImageUrl is deprecated. Use getStaffImageUrl from staffImageService.ts instead');
  return '/placeholder.svg';
};

export const cleanupPreviousImages = async (staffId: string): Promise<void> => {
  console.warn('cleanupPreviousImages is deprecated. Use cleanupPreviousImages from staffImageService.ts instead');
};
