
import { getAllStaff } from './staffQueries';
import { 
  addStaffMember, 
  updateStaffMember, 
  removeStaffMember, 
  createStaffMember, 
  deleteStaffMember 
} from './mutations';
import { getStaffMemberById, calculateOverallScoreAndGrade } from './staffUtils';
import { uploadStaffImage, updateStaffAvatar, getStaffImageUrl, initializeStaffImageStorage } from './staffImageService';
import { subscribeToRealTimeUpdates } from './staffRealtimeService';
import { calculateLetterGrade } from './staffGrading';

// Import events services
import {
  createScoreEvent,
  getStaffScore,
  verifyApiToken,
  getActionWeight,
  subscribeToScoreEvents
} from './events';

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
  subscribeToScoreEvents,
  
  // Events system
  createScoreEvent,
  getStaffScore,
  verifyApiToken,
  getActionWeight
};
