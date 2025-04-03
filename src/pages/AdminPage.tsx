
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
  
  // Redirect non-admin users back to the homepage
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);
  
  // Filter and sort staff based on criteria
  useEffect(() => {
    if (loading) return;
    
    let filtered = [...allStaff];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply role filter
    if (filterRole !== 'All') {
      filtered = filtered.filter(staff => staff.role === filterRole);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return sortAsc 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'role') {
        return sortAsc 
          ? a.role.localeCompare(b.role) 
          : b.role.localeCompare(a.role);
      } else {
        // For manager/owner, always put them at top or bottom depending on sort direction
        if (a.role === 'Manager' || a.role === 'Owner') {
          return sortAsc ? 1 : -1;
        }
        if (b.role === 'Manager' || b.role === 'Owner') {
          return sortAsc ? -1 : 1;
        }
        return sortAsc 
          ? a.overallScore - b.overallScore 
          : b.overallScore - a.overallScore;
      }
    });
    
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
        overallGrade: 'SSS+' as LetterGrade
      };
      
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
      newStaffData.overallGrade = 'SSS+' as LetterGrade;
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
  
  if (loading) {
    return <LoadingState message="Loading admin panel..." />;
  }
  
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl cyber-text-glow font-digital text-white mb-6">Administrator Panel</h1>
      
      {/* Admin Tools */}
      <AdminToolbar 
        searchTerm={searchTerm}
        filterRole={filterRole}
        sortBy={sortBy}
        sortAsc={sortAsc}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterRole}
        onSortChange={setSortBy}
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
