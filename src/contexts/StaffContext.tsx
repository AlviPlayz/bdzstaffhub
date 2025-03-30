
import React, { createContext, useContext, useState } from 'react';
import { StaffMember, StaffRole } from '@/types/staff';
import { allModerators, allBuilders, allManagers, processStaffData } from '@/data/mockStaffData';
import { toast } from '@/hooks/use-toast';

interface StaffContextType {
  moderators: StaffMember[];
  builders: StaffMember[];
  managers: StaffMember[];
  allStaff: StaffMember[];
  updateStaffMember: (updatedMember: StaffMember) => void;
  addStaffMember: (newMember: Omit<StaffMember, 'id'>) => void;
  removeStaffMember: (id: string) => void;
}

const StaffContext = createContext<StaffContextType>({
  moderators: [],
  builders: [],
  managers: [],
  allStaff: [],
  updateStaffMember: () => {},
  addStaffMember: () => {},
  removeStaffMember: () => {},
});

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moderators, setModerators] = useState<StaffMember[]>(allModerators);
  const [builders, setBuilders] = useState<StaffMember[]>(allBuilders);
  const [managers, setManagers] = useState<StaffMember[]>(allManagers);

  const getAllStaff = (): StaffMember[] => {
    return [...moderators, ...builders, ...managers];
  };

  const updateStaffMember = (updatedMember: StaffMember) => {
    // First update in-memory, then would sync to Supabase in a real implementation
    const { role } = updatedMember;
    
    if (role === 'Moderator') {
      setModerators(prev => 
        processStaffData(prev.map(mod => mod.id === updatedMember.id ? updatedMember : mod))
      );
    } else if (role === 'Builder') {
      setBuilders(prev => 
        processStaffData(prev.map(builder => builder.id === updatedMember.id ? updatedMember : builder))
      );
    } else if (role === 'Manager') {
      setManagers(prev => 
        processStaffData(prev.map(manager => manager.id === updatedMember.id ? updatedMember : manager))
      );
    }
    
    toast({
      title: "Staff Updated",
      description: `${updatedMember.name}'s information has been updated.`,
    });
  };

  const addStaffMember = (newMember: Omit<StaffMember, 'id'>) => {
    const staffMember: StaffMember = {
      ...newMember,
      id: `${newMember.role.toLowerCase()}-${Date.now()}`,
    };
    
    const processedMember = processStaffData([staffMember])[0];
    
    if (processedMember.role === 'Moderator') {
      setModerators(prev => [...prev, processedMember]);
    } else if (processedMember.role === 'Builder') {
      setBuilders(prev => [...prev, processedMember]);
    } else if (processedMember.role === 'Manager') {
      setManagers(prev => [...prev, processedMember]);
    }
    
    toast({
      title: "Staff Added",
      description: `${processedMember.name} has been added as a ${processedMember.role}.`,
    });
  };

  const removeStaffMember = (id: string) => {
    const staffMember = getAllStaff().find(staff => staff.id === id);
    
    if (!staffMember) return;
    
    if (staffMember.role === 'Moderator') {
      setModerators(prev => prev.filter(mod => mod.id !== id));
    } else if (staffMember.role === 'Builder') {
      setBuilders(prev => prev.filter(builder => builder.id !== id));
    } else if (staffMember.role === 'Manager') {
      setManagers(prev => prev.filter(manager => manager.id !== id));
    }
    
    toast({
      title: "Staff Removed",
      description: `${staffMember.name} has been removed.`,
    });
  };

  return (
    <StaffContext.Provider
      value={{
        moderators,
        builders,
        managers,
        allStaff: getAllStaff(),
        updateStaffMember,
        addStaffMember,
        removeStaffMember,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => useContext(StaffContext);
