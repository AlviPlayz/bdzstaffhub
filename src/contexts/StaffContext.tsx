
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { StaffMember, StaffRole, ROLE_CONSTANTS, enforceRoleRankCombination } from '@/types/staff';
import * as staffService from '@/services/staff';
import { toast } from '@/hooks/use-toast';

interface StaffContextType {
  moderators: StaffMember[];
  builders: StaffMember[];
  managers: StaffMember[];
  allStaff: StaffMember[];
  loading: boolean;
  error: Error | null;
  updateStaffMember: (updatedMember: StaffMember) => Promise<void>;
  addStaffMember: (newMember: Omit<StaffMember, 'id'>) => Promise<void>;
  removeStaffMember: (id: string, role: StaffRole) => Promise<void>;
  refreshStaffData: () => Promise<void>;
}

const StaffContext = createContext<StaffContextType>({
  moderators: [],
  builders: [],
  managers: [],
  allStaff: [],
  loading: false,
  error: null,
  updateStaffMember: async () => {},
  addStaffMember: async () => {},
  removeStaffMember: async () => {},
  refreshStaffData: async () => {},
});

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffData, setStaffData] = useState<{
    moderators: StaffMember[];
    builders: StaffMember[];
    managers: StaffMember[];
  }>({
    moderators: [],
    builders: [],
    managers: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Initialize storage on component mount
  useEffect(() => {
    staffService.initializeStaffImageStorage().catch(console.error);
  }, []);

  // Function to fetch staff data from Supabase with caching
  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching staff data from Supabase...");
      
      const allStaff = await staffService.getAllStaff();
      console.log("Retrieved staff data:", allStaff.length, "members");
      
      // Separate staff by role
      const mods: StaffMember[] = [];
      const builds: StaffMember[] = [];
      const mgrs: StaffMember[] = [];
      
      allStaff.forEach(staff => {
        // Make sure avatar is set properly
        if (!staff.avatar || staff.avatar === '') {
          staff.avatar = '/placeholder.svg';
        }
        
        // Enforce role-rank combinations
        const enforcedStaff = enforceRoleRankCombination(staff) as StaffMember;
        
        // CRITICAL FIX: Ensure Owner role is properly identified and preserved during categorization
        if (enforcedStaff.role === 'Moderator') {
          mods.push(enforcedStaff);
        } else if (enforcedStaff.role === 'Builder') {
          builds.push(enforcedStaff);
        } else if (enforcedStaff.role === ROLE_CONSTANTS.MANAGER.ROLE || enforcedStaff.role === ROLE_CONSTANTS.OWNER.ROLE) {
          // If the role is Owner, ensure it remains Owner when added to managers list
          if (enforcedStaff.role === ROLE_CONSTANTS.OWNER.ROLE) {
            // Ensure the role stays as a valid StaffRole type
            enforcedStaff.rank = ROLE_CONSTANTS.OWNER.RANK;
            enforcedStaff.overallGrade = ROLE_CONSTANTS.OWNER.GRADE;
          }
          mgrs.push(enforcedStaff);
        }
      });
      
      // Set states with the fetched data
      setStaffData({
        moderators: mods,
        builders: builds,
        managers: mgrs
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching staff data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch staff data'));
      toast({
        title: "Error",
        description: "Failed to load staff data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh staff data by incrementing the trigger
  const refreshStaffData = useCallback(async () => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Fetch staff data when refresh trigger changes
  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData, refreshTrigger]);

  // Set up real-time subscriptions
  useEffect(() => {
    console.log("Setting up real-time subscriptions...");
    const unsubscribeModerators = staffService.subscribeToRealTimeUpdates('moderators', refreshStaffData);
    const unsubscribeBuilders = staffService.subscribeToRealTimeUpdates('builders', refreshStaffData);
    const unsubscribeManagers = staffService.subscribeToRealTimeUpdates('managers', refreshStaffData);
    
    // Clean up subscriptions when the component unmounts
    return () => {
      console.log("Cleaning up real-time subscriptions...");
      unsubscribeModerators();
      unsubscribeBuilders();
      unsubscribeManagers();
    };
  }, [refreshStaffData]);

  // Update a staff member
  const updateStaffMember = useCallback(async (updatedMember: StaffMember) => {
    try {
      // CRITICAL FIX: Preserve Owner role during update
      const isOwner = updatedMember.role === ROLE_CONSTANTS.OWNER.ROLE;
      
      // Apply role-rank enforcement
      const enforcedMember = enforceRoleRankCombination(updatedMember) as StaffMember;
      
      // Ensure the rank is properly set before updating
      if (!enforcedMember.rank) {
        if (enforcedMember.role === 'Moderator') {
          enforcedMember.rank = 'Trial Mod';
        } else if (enforcedMember.role === 'Builder') {
          enforcedMember.rank = 'Trial Builder';
        } else if (isOwner) {
          enforcedMember.rank = ROLE_CONSTANTS.OWNER.RANK;
        } else if (enforcedMember.role === ROLE_CONSTANTS.MANAGER.ROLE) {
          enforcedMember.rank = ROLE_CONSTANTS.MANAGER.RANK;
        }
      }
      
      // For Owner role, always ensure appropriate values
      if (isOwner) {
        enforcedMember.rank = ROLE_CONSTANTS.OWNER.RANK;
        enforcedMember.overallGrade = ROLE_CONSTANTS.OWNER.GRADE;
        enforcedMember.role = ROLE_CONSTANTS.OWNER.ROLE;
      }
      
      const result = await staffService.updateStaffMember(enforcedMember);
      
      // Optimistic UI update for better user experience
      setStaffData(prev => {
        const newData = { ...prev };
        
        if (enforcedMember.role === 'Moderator') {
          newData.moderators = prev.moderators.map(mod => 
            mod.id === enforcedMember.id ? enforcedMember : mod
          );
        } else if (enforcedMember.role === 'Builder') {
          newData.builders = prev.builders.map(builder => 
            builder.id === enforcedMember.id ? enforcedMember : builder
          );
        } else if (enforcedMember.role === ROLE_CONSTANTS.MANAGER.ROLE || isOwner) {
          // CRITICAL FIX: Ensure Owner role is not lost during state updates
          if (isOwner) {
            // Make sure we're updating with the Owner role preserved
            const ownerMember: StaffMember = {
              ...enforcedMember,
              role: ROLE_CONSTANTS.OWNER.ROLE,
              rank: ROLE_CONSTANTS.OWNER.RANK,
              overallGrade: ROLE_CONSTANTS.OWNER.GRADE
            };
            newData.managers = prev.managers.map(manager => 
              manager.id === enforcedMember.id ? ownerMember : manager
            );
          } else {
            newData.managers = prev.managers.map(manager => 
              manager.id === enforcedMember.id ? enforcedMember : manager
            );
          }
        }
        
        return newData;
      });

      toast({
        title: "Success",
        description: `${enforcedMember.name}'s information has been updated.`,
      });
      
      // Trigger a refresh after a short delay to ensure everything is in sync
      setTimeout(refreshStaffData, 1000);
    } catch (err) {
      console.error('Error updating staff member:', err);
      toast({
        title: "Update Failed",
        description: "Failed to update staff member information.",
        variant: "destructive",
      });
    }
  }, [refreshStaffData]);

  // Add a new staff member
  const addStaffMember = useCallback(async (newMember: Omit<StaffMember, 'id'>) => {
    try {
      console.log("Adding new staff member:", newMember.name, newMember.role);
      
      // Apply role-rank enforcement to ensure consistency
      const enforcedMember = enforceRoleRankCombination(newMember) as Omit<StaffMember, 'id'>;
      
      // CRITICAL FIX: Preserve Owner role during creation
      const isOwner = enforcedMember.role === ROLE_CONSTANTS.OWNER.ROLE;
      
      // Ensure rank is set
      if (!enforcedMember.rank) {
        if (enforcedMember.role === 'Moderator') {
          enforcedMember.rank = 'Trial Mod';
        } else if (enforcedMember.role === 'Builder') {
          enforcedMember.rank = 'Trial Builder';
        } else if (isOwner) {
          enforcedMember.rank = ROLE_CONSTANTS.OWNER.RANK;
        } else if (enforcedMember.role === ROLE_CONSTANTS.MANAGER.ROLE) {
          enforcedMember.rank = ROLE_CONSTANTS.MANAGER.RANK;
        }
      }
      
      // Special handling for Owner role
      if (isOwner) {
        enforcedMember.rank = ROLE_CONSTANTS.OWNER.RANK;
        // @ts-ignore - TypeScript won't allow setting overallGrade on Omit type
        enforcedMember.overallGrade = ROLE_CONSTANTS.OWNER.GRADE;
      }
      
      const result = await staffService.createStaffMember(enforcedMember);
      
      if (result) {
        // Optimistic UI update
        setStaffData(prev => {
          const newData = { ...prev };
          
          if (result.role === 'Moderator') {
            newData.moderators = [...prev.moderators, result];
          } else if (result.role === 'Builder') {
            newData.builders = [...prev.builders, result];
          } else if (result.role === ROLE_CONSTANTS.MANAGER.ROLE || result.role === ROLE_CONSTANTS.OWNER.ROLE) {
            // CRITICAL FIX: If Owner, ensure role is preserved in state
            if (result.role === ROLE_CONSTANTS.OWNER.ROLE) {
              // Make sure role, rank, and grade are set correctly
              const ownerResult: StaffMember = {
                ...result,
                role: ROLE_CONSTANTS.OWNER.ROLE,
                rank: ROLE_CONSTANTS.OWNER.RANK,
                overallGrade: ROLE_CONSTANTS.OWNER.GRADE
              };
              newData.managers = [...prev.managers, ownerResult];
            } else {
              newData.managers = [...prev.managers, result];
            }
          }
          
          return newData;
        });

        toast({
          title: "Success",
          description: `${result.name} has been added as a ${result.role}.`,
        });
        
        // Full refresh after a short delay to ensure everything is in sync
        setTimeout(refreshStaffData, 1000);
      }
    } catch (err) {
      console.error('Error adding staff member:', err);
      toast({
        title: "Add Failed",
        description: "Failed to add new staff member. Please check console for details.",
        variant: "destructive",
      });
    }
  }, [refreshStaffData]);

  // Remove a staff member
  const removeStaffMember = useCallback(async (id: string, role: StaffRole) => {
    try {
      const success = await staffService.deleteStaffMember(id, role);
      
      if (success) {
        // Optimistic UI update
        setStaffData(prev => {
          const newData = { ...prev };
          
          if (role === 'Moderator') {
            newData.moderators = prev.moderators.filter(mod => mod.id !== id);
          } else if (role === 'Builder') {
            newData.builders = prev.builders.filter(builder => builder.id !== id);
          } else if (role === 'Manager' || role === 'Owner') {
            newData.managers = prev.managers.filter(manager => manager.id !== id);
          }
          
          return newData;
        });

        toast({
          title: "Success",
          description: "Staff member has been removed.",
        });
        
        // Refresh after a short delay
        setTimeout(refreshStaffData, 1000);
      }
    } catch (err) {
      console.error('Error removing staff member:', err);
      toast({
        title: "Remove Failed",
        description: "Failed to remove staff member.",
        variant: "destructive",
      });
    }
  }, [refreshStaffData]);

  // Memoize all staff to avoid unnecessary recalculations
  const allStaff = useMemo(() => {
    return [
      ...staffData.moderators, 
      ...staffData.builders, 
      ...staffData.managers
    ];
  }, [staffData]);

  // Create a memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    moderators: staffData.moderators,
    builders: staffData.builders,
    managers: staffData.managers,
    allStaff,
    loading,
    error,
    updateStaffMember,
    addStaffMember,
    removeStaffMember,
    refreshStaffData,
  }), [
    staffData.moderators,
    staffData.builders,
    staffData.managers,
    allStaff,
    loading,
    error,
    updateStaffMember,
    addStaffMember,
    removeStaffMember,
    refreshStaffData,
  ]);

  return (
    <StaffContext.Provider value={contextValue}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => useContext(StaffContext);
