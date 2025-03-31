
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StaffMember, StaffRole } from '@/types/staff';
import * as supabaseService from '@/services/supabaseService';
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
  const [moderators, setModerators] = useState<StaffMember[]>([]);
  const [builders, setBuilders] = useState<StaffMember[]>([]);
  const [managers, setManagers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch staff data from Supabase
  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      const allStaff = await supabaseService.getAllStaff();
      
      // Separate staff by role
      const mods: StaffMember[] = [];
      const builds: StaffMember[] = [];
      const mgrs: StaffMember[] = [];
      
      allStaff.forEach(staff => {
        if (staff.role === 'Moderator') {
          mods.push(staff);
        } else if (staff.role === 'Builder') {
          builds.push(staff);
        } else if (staff.role === 'Manager' || staff.role === 'Owner') {
          mgrs.push(staff);
        }
      });
      
      // Set states with the fetched data
      setModerators(mods);
      setBuilders(builds);
      setManagers(mgrs);
      setError(null);
    } catch (err) {
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

  // Refresh staff data
  const refreshStaffData = useCallback(async () => {
    await fetchStaffData();
  }, [fetchStaffData]);

  // Fetch staff data on component mount
  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Set up real-time subscriptions
  useEffect(() => {
    const unsubscribeModerators = supabaseService.subscribeToRealTimeUpdates('moderators', refreshStaffData);
    const unsubscribeBuilders = supabaseService.subscribeToRealTimeUpdates('builders', refreshStaffData);
    const unsubscribeManagers = supabaseService.subscribeToRealTimeUpdates('managers', refreshStaffData);
    
    // Clean up subscriptions when the component unmounts
    return () => {
      unsubscribeModerators();
      unsubscribeBuilders();
      unsubscribeManagers();
    };
  }, [refreshStaffData]);

  // Update a staff member
  const updateStaffMember = async (updatedMember: StaffMember) => {
    try {
      const result = await supabaseService.updateStaffMember(updatedMember);
      
      // Update the local state for immediate UI update
      if (updatedMember.role === 'Moderator') {
        setModerators(prev => prev.map(mod => mod.id === updatedMember.id ? updatedMember : mod));
      } else if (updatedMember.role === 'Builder') {
        setBuilders(prev => prev.map(builder => builder.id === updatedMember.id ? updatedMember : builder));
      } else if (updatedMember.role === 'Manager' || updatedMember.role === 'Owner') {
        setManagers(prev => prev.map(manager => manager.id === updatedMember.id ? updatedMember : manager));
      }

      toast({
        title: "Success",
        description: `${updatedMember.name}'s information has been updated.`,
      });
    } catch (err) {
      console.error('Error updating staff member:', err);
      toast({
        title: "Update Failed",
        description: "Failed to update staff member information.",
        variant: "destructive",
      });
    }
  };

  // Add a new staff member
  const addStaffMember = async (newMember: Omit<StaffMember, 'id'>) => {
    try {
      const result = await supabaseService.createStaffMember(newMember);
      if (result) {
        // Update the local state for immediate UI update
        if (result.role === 'Moderator') {
          setModerators(prev => [...prev, result]);
        } else if (result.role === 'Builder') {
          setBuilders(prev => [...prev, result]);
        } else if (result.role === 'Manager' || result.role === 'Owner') {
          setManagers(prev => [...prev, result]);
        }

        toast({
          title: "Success",
          description: `${result.name} has been added as a ${result.role}.`,
        });
      }
    } catch (err) {
      console.error('Error adding staff member:', err);
      toast({
        title: "Add Failed",
        description: "Failed to add new staff member.",
        variant: "destructive",
      });
    }
  };

  // Remove a staff member
  const removeStaffMember = async (id: string, role: StaffRole) => {
    try {
      const success = await supabaseService.deleteStaffMember(id, role);
      if (success) {
        // Update the local state for immediate UI update
        if (role === 'Moderator') {
          setModerators(prev => prev.filter(mod => mod.id !== id));
        } else if (role === 'Builder') {
          setBuilders(prev => prev.filter(builder => builder.id !== id));
        } else if (role === 'Manager' || role === 'Owner') {
          setManagers(prev => prev.filter(manager => manager.id !== id));
        }

        toast({
          title: "Success",
          description: "Staff member has been removed.",
        });
      }
    } catch (err) {
      console.error('Error removing staff member:', err);
      toast({
        title: "Remove Failed",
        description: "Failed to remove staff member.",
        variant: "destructive",
      });
    }
  };

  const getAllStaff = (): StaffMember[] => {
    return [...moderators, ...builders, ...managers];
  };

  return (
    <StaffContext.Provider
      value={{
        moderators,
        builders,
        managers,
        allStaff: getAllStaff(),
        loading,
        error,
        updateStaffMember,
        addStaffMember,
        removeStaffMember,
        refreshStaffData,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => useContext(StaffContext);
