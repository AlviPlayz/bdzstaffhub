
import React, { useState, useEffect } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import { useAuth } from '@/contexts/AuthContext';
import { StaffMember, StaffRole } from '@/types/staff';
import { toast } from '@/hooks/use-toast';
import LoadingState from '@/components/LoadingState';
import { useNavigate } from 'react-router-dom';

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
    setSelectedStaff(staff);
  };
  
  const handleScoreChange = (metricKey: string, newScore: number) => {
    if (!selectedStaff) return;
    
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
          letterGrade: calculateLetterGrade(safeScore)
        }
      }
    };
    
    // Update local state for immediate UI feedback
    setSelectedStaff(updatedStaff);
  };
  
  const saveChanges = () => {
    if (!selectedStaff) return;
    
    // Calculate the new overall score
    const metricValues = Object.values(selectedStaff.metrics);
    const totalScore = metricValues.reduce((sum, metric) => sum + metric.score, 0);
    const average = parseFloat((totalScore / metricValues.length).toFixed(1));
    
    // Determine the new overall grade
    const overallGrade = selectedStaff.role === 'Manager' || selectedStaff.role === 'Owner'
      ? 'SSS+' 
      : calculateLetterGrade(average);
    
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
  
  const calculateLetterGrade = (score: number): 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'E' | 'E-' | 'SSS+' | 'Immeasurable' => {
    if (score >= 9) return 'S+';
    if (score >= 8) return 'S';
    if (score >= 7.5) return 'A+';
    if (score >= 7) return 'A';
    if (score >= 6.5) return 'B+';
    if (score >= 6) return 'B';
    if (score >= 5) return 'C';
    if (score >= 4) return 'D';
    if (score >= 3) return 'E';
    return 'E-';
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
