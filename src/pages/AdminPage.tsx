
import React, { useState, useEffect } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import { StaffMember } from '@/types/staff';
import StaffList from '@/components/admin/StaffList';
import StaffMetricsEditor from '@/components/admin/StaffMetricsEditor';
import AdminToolbar from '@/components/admin/AdminToolbar';
import LoadingState from '@/components/LoadingState';
import AddStaffForm from '@/components/admin/AddStaffForm';
import RemoveStaffDialog from '@/components/admin/RemoveStaffDialog';
import { CheckCircle, UserPlus, Database, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiTokenManager from '@/components/admin/ApiTokenManager';
import ActionWeightsManager from '@/components/admin/ActionWeightsManager';

const AdminPage: React.FC = () => {
  const { allStaff, updateStaffMember, removeStaffMember, loading, error, refreshStaffData } = useStaff();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('staff');
  
  useEffect(() => {
    // Apply filters to staff list
    let filtered = [...allStaff];
    
    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(staff => 
        staff.name.toLowerCase().includes(search) || 
        (staff.rank && staff.rank.toLowerCase().includes(search))
      );
    }
    
    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(staff => staff.role === filterRole);
    }
    
    setFilteredStaff(filtered);
  }, [allStaff, searchTerm, filterRole]);
  
  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
  };
  
  const handleScoreChange = (metricKey: string, newScore: number) => {
    if (!selectedStaff) return;
    
    setSelectedStaff(prevStaff => {
      if (!prevStaff) return null;
      
      const updatedMetrics = { ...prevStaff.metrics };
      if (metricKey in updatedMetrics) {
        (updatedMetrics as any)[metricKey] = { 
          ...(updatedMetrics as any)[metricKey],
          score: newScore
        };
      }
      
      return {
        ...prevStaff,
        metrics: updatedMetrics
      };
    });
  };
  
  const handleSaveChanges = async () => {
    if (!selectedStaff) return;
    
    await updateStaffMember(selectedStaff);
  };
  
  const handleCancelEdit = () => {
    if (selectedStaff) {
      // Reload the staff data to discard changes
      const originalStaff = allStaff.find(s => s.id === selectedStaff.id);
      if (originalStaff) {
        setSelectedStaff(originalStaff);
      }
    }
  };
  
  const handleRemoveStaff = () => {
    if (selectedStaff) {
      setShowRemoveDialog(true);
    }
  };
  
  const handleConfirmRemove = async () => {
    if (selectedStaff) {
      await removeStaffMember(selectedStaff.id, selectedStaff.role);
      setSelectedStaff(null);
      setShowRemoveDialog(false);
    }
  };
  
  const handleCancelRemove = () => {
    setShowRemoveDialog(false);
  };
  
  const handleAddStaffComplete = () => {
    setShowAddForm(false);
    refreshStaffData();
  };
  
  if (loading) {
    return <LoadingState message="Loading staff data..." />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="cyber-panel text-center p-8">
          <h2 className="text-2xl text-red-500 mb-2">Error</h2>
          <p className="text-white mb-4">Failed to load staff data. Please try again later.</p>
          <button 
            onClick={() => refreshStaffData()}
            className="cyber-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl cyber-text-glow font-digital text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/60 font-cyber">Manage staff, configure settings, and monitor system activity</p>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <CheckCircle size={16} /> Staff Management
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Database size={16} /> Action Weights
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key size={16} /> API Tokens
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="staff">
          <div className="flex justify-between items-center mb-6">
            <AdminToolbar 
              onSearch={setSearchTerm} 
              onFilterRole={setFilterRole}
              searchTerm={searchTerm}
              filterRole={filterRole}
            />
            <button 
              className="cyber-button flex items-center gap-2"
              onClick={() => setShowAddForm(true)}
            >
              <UserPlus size={16} />
              Add Staff
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StaffList 
              filteredStaff={filteredStaff} 
              selectedStaff={selectedStaff}
              onStaffSelect={handleStaffSelect}
            />
            <StaffMetricsEditor 
              selectedStaff={selectedStaff}
              onScoreChange={handleScoreChange}
              saveChanges={handleSaveChanges}
              onCancelEdit={handleCancelEdit}
              onRemoveStaff={handleRemoveStaff}
            />
          </div>
          
          {showAddForm && (
            <AddStaffForm 
              onClose={() => setShowAddForm(false)}
              onComplete={handleAddStaffComplete}
            />
          )}
          
          {showRemoveDialog && selectedStaff && (
            <RemoveStaffDialog
              staff={selectedStaff}
              onConfirm={handleConfirmRemove}
              onCancel={handleCancelRemove}
            />
          )}
        </TabsContent>
        
        <TabsContent value="actions">
          <ActionWeightsManager />
        </TabsContent>
        
        <TabsContent value="api">
          <ApiTokenManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
