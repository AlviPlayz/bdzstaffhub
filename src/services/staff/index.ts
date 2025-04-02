
import { getAllStaff } from './staffQueries';
import { addStaffMember, updateStaffMember, removeStaffMember, createStaffMember, deleteStaffMember } from './staffMutations';
import { getStaffMemberById, calculateOverallScoreAndGrade } from './staffUtils';
import { uploadStaffImage, updateStaffAvatar, getStaffImageUrl, initializeStaffImageStorage } from './staffImageService';
import { subscribeToRealTimeUpdates } from './staffRealtimeService';
import { calculateLetterGrade } from './staffGrading';

export {
  // Queries
  getAllStaff,
  getStaffMemberById,
  
  // Mutations
  addStaffMember,
  updateStaffMember,
  removeStaffMember,
  createStaffMember,
  deleteStaffMember,
  
  // Image handling
  uploadStaffImage,
  updateStaffAvatar,
  getStaffImageUrl,
  initializeStaffImageStorage,
  
  // Utilities
  calculateLetterGrade,
  calculateOverallScoreAndGrade,
  
  // Realtime
  subscribeToRealTimeUpdates,
};
