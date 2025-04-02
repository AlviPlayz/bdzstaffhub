
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { StaffMember, StaffRole } from '@/types/staff';
import * as supabaseService from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';
import { initializeStorage } from '@/integrations/supabase/storage';

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
    initializeStorage().catch(console.error);
  }, []);

  // Function to fetch staff data from Supabase with caching
  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching staff data from Supabase...");
      
      const allStaff = await supabaseService.getAllStaff();
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
        
        if (staff.role === 'Moderator') {
          mods.push(staff);
        } else if (staff.role === 'Builder') {
          builds.push(staff);
        } else if (staff.role === 'Manager' || staff.role === 'Owner') {
          mgrs.push(staff);
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
    const unsubscribeModerators = supabaseService.subscribeToRealTimeUpdates('moderators', refreshStaffData);
    const unsubscribeBuilders = supabaseService.subscribeToRealTimeUpdates('builders', refreshStaffData);
    const unsubscribeManagers = supabaseService.subscribeToRealTimeUpdates('managers', refreshStaffData);
    
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
      const result = await supabaseService.updateStaffMember(updatedMember);
      
      // Optimistic UI update for better user experience
      setStaffData(prev => {
        const newData = { ...prev };
        
        if (updatedMember.role === 'Moderator') {
          newData.moderators = prev.moderators.map(mod => 
            mod.id === updatedMember.id ? updatedMember : mod
          );
        } else if (updatedMember.role === 'Builder') {
          newData.builders = prev.builders.map(builder => 
            builder.id === updatedMember.id ? updatedMember : builder
          );
        } else if (updatedMember.role === 'Manager' || updatedMember.role === 'Owner') {
          newData.managers = prev.managers.map(manager => 
            manager.id === updatedMember.id ? updatedMember : manager
          );
        }
        
        return newData;
      });

      toast({
        title: "Success",
        description: `${updatedMember.name}'s information has been updated.`,
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
      const result = await supabaseService.createStaffMember(newMember);
      
      if (result) {
        // Optimistic UI update
        setStaffData(prev => {
          const newData = { ...prev };
          
          if (result.role === 'Moderator') {
            newData.moderators = [...prev.moderators, result];
          } else if (result.role === 'Builder') {
            newData.builders = [...prev.builders, result];
          } else if (result.role === 'Manager' || result.role === 'Owner') {
            newData.managers = [...prev.managers, result];
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
      const success = await supabaseService.deleteStaffMember(id, role);
      
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
