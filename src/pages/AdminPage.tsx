import React, { useState, useEffect } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import { useAuth } from '@/contexts/AuthContext';
import { StaffMember, StaffRole, LetterGrade } from '@/types/staff';
import { toast } from '@/hooks/use-toast';
import LoadingState from '@/components/LoadingState';
import { useNavigate } from 'react-router-dom';
import { calculateLetterGrade } from '@/services/staff/staffGrading';

// Import refactored components
import StaffList from '@/components/admin/StaffList';
import StaffMetricsEditor from '@/components/admin/StaffMetricsEditor';
import AdminToolbar from '@/components/admin/AdminToolbar';
import AddStaffForm from '@/components/admin/AddStaffForm';
import RemoveStaffDialog from '@/components/admin/RemoveStaffDialog';
import AdminAccessModal from '@/components/AdminAccessModal';

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { allStaff, updateStaffMember, addStaffMember, removeStaffMember, loading } = useStaff();
  const navigate = useNavigate();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [filterRole, setFilterRole] = useState<StaffRole | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'score'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showAdminAccessModal, setShowAdminAccessModal] = useState(true);
  
  // Check for admin access on initial load using sessionStorage
  useEffect(() => {
    const adminAccess = sessionStorage.getItem('adminAccess') === 'true';
    setHasAdminAccess(adminAccess);
    
    // If they already have access, don't show the login modal
    if (adminAccess) {
      setShowAdminAccessModal(false);
    }
  }, []);
  
  // Redirect non-admin users back to the homepage if they close the modal without entering code
  useEffect(() => {
    if (!hasAdminAccess && !showAdminAccessModal) {
      navigate('/');
    }
  }, [hasAdminAccess, navigate, showAdminAccessModal]);
  
  // Add a new helper function to determine display in the dashboard
  const sortStaffWithOwnerFirst = (a: StaffMember, b: StaffMember) => {
    // Always keep Owner at the top
    if (a.role === 'Owner' && b.role !== 'Owner') return -1;
    if (a.role !== 'Owner' && b.role === 'Owner') return 1;
    
    // Then sort Managers next if not already sorted by role
    if (a.role === 'Manager' && b.role !== 'Manager') return -1;
    if (a.role !== 'Manager' && b.role === 'Manager') return 1;
    
    // Then apply regular sorting criteria
    if (sortBy === 'name') {
      return sortAsc 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'role') {
      return sortAsc 
        ? a.role.localeCompare(b.role) 
        : b.role.localeCompare(a.role);
    } else {
      return sortAsc 
        ? a.overallScore - b.overallScore 
        : b.overallScore - a.overallScore;
    }
  };
  
  // Modify the useEffect that filters staff
  useEffect(() => {
    if (loading) return;
    
    let filtered = [...allStaff];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply role filter, with special handling for Owner
    if (filterRole !== 'All') {
      filtered = filtered.filter(staff => {
        // When filtering for Manager, exclude Owner
        if (filterRole === 'Manager') {
          return staff.role === 'Manager';
        }
        // Otherwise apply normal filter
        return staff.role === filterRole;
      });
    }
    
    // Apply sorting with Owner always at top
    filtered.sort(sortStaffWithOwnerFirst);
    
    setFilteredStaff(filtered);
  }, [allStaff, searchTerm, filterRole, sortBy, sortAsc, loading]);
  
  const toggleSort = (newSortBy: 'name' | 'role' | 'score') => {
    if (sortBy === newSortBy) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(newSortBy);
      setSortAsc(true);
    }
  };
  
  const handleStaffSelect = (staff: StaffMember) => {
    console.log("Selected staff:", staff.name, staff.role, staff.avatar);
    setSelectedStaff(staff);
  };
  
  const handleScoreChange = (metricKey: string, newScore: number) => {
    if (!selectedStaff) return;
    
    // Skip score changes for Managers and Owners
    if (selectedStaff.role === 'Manager' || selectedStaff.role === 'Owner') {
      console.log("Managers/Owners have fixed scores - not changing");
      return;
    }
    
    // Create a safe score between 0 and 10
    const safeScore = Math.min(Math.max(0, newScore), 10);
    
    // Create a deep copy of the staff member
    const updatedStaff = {
      ...selectedStaff,
      metrics: {
        ...selectedStaff.metrics,
        [metricKey]: {
          ...selectedStaff.metrics[metricKey as keyof typeof selectedStaff.metrics],
          score: safeScore,
          letterGrade: calculateLetterGrade(safeScore, selectedStaff.role)
        }
      }
    };
    
    // Update local state for immediate UI feedback
    setSelectedStaff(updatedStaff);
  };
  
  const saveChanges = () => {
    if (!selectedStaff) return;
    
    // Special handling for Managers and Owners
    if (selectedStaff.role === 'Manager' || selectedStaff.role === 'Owner') {
      const staffToSave = {
        ...selectedStaff,
        overallScore: 10,
        overallGrade: 'SSS+' as LetterGrade // Always SSS+ for Manager and Owner
      };
      
      // For Owner, ensure rank is always "Owner"
      if (selectedStaff.role === 'Owner') {
        staffToSave.rank = 'Owner';
      }
      
      updateStaffMember(staffToSave);
      toast({
        title: "Changes Saved",
        description: `${selectedStaff.name}'s information has been updated.`,
      });
      return;
    }
    
    // Calculate the new overall score for other roles
    const metricValues = Object.values(selectedStaff.metrics);
    const totalScore = metricValues.reduce((sum, metric) => sum + metric.score, 0);
    const average = parseFloat((totalScore / metricValues.length).toFixed(1));
    
    // Determine the new overall grade
    const overallGrade = calculateLetterGrade(average, selectedStaff.role);
    
    // Create the final staff object to save
    const staffToSave = {
      ...selectedStaff,
      overallScore: average,
      overallGrade
    };
    
    updateStaffMember(staffToSave);
    toast({
      title: "Changes Saved",
      description: `${selectedStaff.name}'s performance metrics have been updated.`,
    });
  };
  
  const handleAddStaff = async (newStaffData: Omit<StaffMember, 'id'>) => {
    console.log("Adding new staff member:", newStaffData.name, newStaffData.role);
    
    // Ensure avatar URL is set
    if (!newStaffData.avatar || newStaffData.avatar === '') {
      newStaffData.avatar = '/placeholder.svg';
    }
    
    // Special handling for Managers and Owners
    if (newStaffData.role === 'Manager' || newStaffData.role === 'Owner') {
      newStaffData.overallScore = 10;
      newStaffData.overallGrade = 'SSS+' as LetterGrade; // Always SSS+ for Manager and Owner
    }
    
    // For Owner role, ensure rank is "Owner"
    if (newStaffData.role === 'Owner') {
      newStaffData.rank = 'Owner';
    }
    
    await addStaffMember(newStaffData);
    
    toast({
      title: "Staff Added",
      description: `${newStaffData.name} has been added as a ${newStaffData.role}.`,
    });
  };
  
  const handleRemoveStaff = () => {
    if (!selectedStaff) return;
    
    removeStaffMember(selectedStaff.id, selectedStaff.role);
    setSelectedStaff(null);
    setShowRemoveConfirmation(false);
    
    toast({
      title: "Staff Removed",
      description: `${selectedStaff.name} has been removed from the system.`,
    });
  };
  
  const handleAdminAccess = (accessGranted: boolean) => {
    setHasAdminAccess(accessGranted);
    setShowAdminAccessModal(false);
    
    if (accessGranted) {
      // Store the access flag in sessionStorage (cleared on tab close/refresh)
      sessionStorage.setItem('adminAccess', 'true');
      toast({
        title: "Access Granted",
        description: "You now have admin access for this session.",
      });
    } else {
      // If access denied, navigate back to home
      navigate('/');
    }
  };
  
  const handleLogout = () => {
    // Clear admin access
    sessionStorage.removeItem('adminAccess');
    setHasAdminAccess(false);
    
    // Navigate back to home
    navigate('/');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel.",
    });
  };
  
  if (loading) {
    return <LoadingState message="Loading admin panel..." />;
  }
  
  if (!hasAdminAccess) {
    return (
      <AdminAccessModal 
        isOpen={showAdminAccessModal} 
        onClose={() => setShowAdminAccessModal(false)}
        onSuccess={() => handleAdminAccess(true)}
        onFailure={() => handleAdminAccess(false)}
      />
    );
  }
  
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl cyber-text-glow font-digital text-white">Administrator Panel</h1>
        <button 
          onClick={handleLogout}
          className="cyber-button-danger py-1 px-3 text-sm"
        >
          Logout
        </button>
      </div>
      
      {/* Admin Tools */}
      <AdminToolbar 
        searchTerm={searchTerm}
        filterRole={filterRole}
        sortBy={sortBy}
        sortAsc={sortAsc}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterRole}
        onSortChange={toggleSort}
        onSortDirectionChange={() => setSortAsc(!sortAsc)}
        onAddStaffClick={() => setShowAddStaffModal(true)}
      />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StaffList 
          filteredStaff={filteredStaff}
          selectedStaff={selectedStaff}
          onStaffSelect={handleStaffSelect}
        />
        
        <StaffMetricsEditor 
          selectedStaff={selectedStaff}
          onScoreChange={handleScoreChange}
          saveChanges={saveChanges}
          onCancelEdit={() => setSelectedStaff(null)}
          onRemoveStaff={() => setShowRemoveConfirmation(true)}
        />
      </div>
      
      {/* Add Staff Modal */}
      <AddStaffForm 
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        onAddStaff={handleAddStaff}
      />
      
      {/* Remove Staff Confirmation */}
      <RemoveStaffDialog 
        isOpen={showRemoveConfirmation}
        onClose={() => setShowRemoveConfirmation(false)}
        onRemove={handleRemoveStaff}
        staff={selectedStaff}
      />
    </div>
  );
};

export default AdminPage;
