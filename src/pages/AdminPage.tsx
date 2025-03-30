
import React, { useState, useEffect } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import { User, Search, Check, X, Plus, Trash2, Filter, SortDesc } from 'lucide-react';
import { StaffMember, StaffRole } from '@/types/staff';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import LoadingState from '@/components/LoadingState';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { calculateLetterGrade } from '@/utils/gradeUtils';

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { allStaff, updateStaffMember, addStaffMember, removeStaffMember, loading } = useStaff();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [filterRole, setFilterRole] = useState<StaffRole | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'score'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();
  
  // New staff state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('Moderator');
  const [newStaffAvatar, setNewStaffAvatar] = useState('https://i.pravatar.cc/150');
  
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
  
  const handleAddStaff = () => {
    // Basic validation
    if (!newStaffName.trim()) {
      toast({
        title: "Validation Error",
        description: "Staff name is required.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate initial metrics based on role
    let metrics: any = {};
    
    if (newStaffRole === 'Moderator') {
      metrics = {
        responsiveness: { id: 'responsiveness', name: 'Responsiveness', score: 5, letterGrade: 'B+' },
        fairness: { id: 'fairness', name: 'Fairness', score: 5, letterGrade: 'B+' },
        communication: { id: 'communication', name: 'Communication', score: 5, letterGrade: 'B+' },
        conflictResolution: { id: 'conflictResolution', name: 'Conflict Resolution', score: 5, letterGrade: 'B+' },
        ruleEnforcement: { id: 'ruleEnforcement', name: 'Rule Enforcement', score: 5, letterGrade: 'B+' },
        engagement: { id: 'engagement', name: 'Engagement', score: 5, letterGrade: 'B+' },
        supportiveness: { id: 'supportiveness', name: 'Supportiveness', score: 5, letterGrade: 'B+' },
        adaptability: { id: 'adaptability', name: 'Adaptability', score: 5, letterGrade: 'B+' },
        objectivity: { id: 'objectivity', name: 'Objectivity', score: 5, letterGrade: 'B+' },
        initiative: { id: 'initiative', name: 'Initiative', score: 5, letterGrade: 'B+' }
      };
    } else if (newStaffRole === 'Builder') {
      metrics = {
        exterior: { id: 'exterior', name: 'Exterior', score: 5, letterGrade: 'B+' },
        interior: { id: 'interior', name: 'Interior', score: 5, letterGrade: 'B+' },
        decoration: { id: 'decoration', name: 'Decoration', score: 5, letterGrade: 'B+' },
        effort: { id: 'effort', name: 'Effort', score: 5, letterGrade: 'B+' },
        contribution: { id: 'contribution', name: 'Contribution', score: 5, letterGrade: 'B+' },
        communication: { id: 'communication', name: 'Communication', score: 5, letterGrade: 'B+' },
        adaptability: { id: 'adaptability', name: 'Adaptability', score: 5, letterGrade: 'B+' },
        cooperativeness: { id: 'cooperativeness', name: 'Cooperativeness', score: 5, letterGrade: 'B+' },
        creativity: { id: 'creativity', name: 'Creativity', score: 5, letterGrade: 'B+' },
        consistency: { id: 'consistency', name: 'Consistency', score: 5, letterGrade: 'B+' }
      };
    } else {
      // Manager or Owner
      metrics = {
        // Moderator metrics
        responsiveness: { id: 'responsiveness', name: 'Responsiveness', score: 10, letterGrade: 'Immeasurable' },
        fairness: { id: 'fairness', name: 'Fairness', score: 10, letterGrade: 'Immeasurable' },
        communication: { id: 'communication', name: 'Communication', score: 10, letterGrade: 'Immeasurable' },
        conflictResolution: { id: 'conflictResolution', name: 'Conflict Resolution', score: 10, letterGrade: 'Immeasurable' },
        ruleEnforcement: { id: 'ruleEnforcement', name: 'Rule Enforcement', score: 10, letterGrade: 'Immeasurable' },
        engagement: { id: 'engagement', name: 'Engagement', score: 10, letterGrade: 'Immeasurable' },
        supportiveness: { id: 'supportiveness', name: 'Supportiveness', score: 10, letterGrade: 'Immeasurable' },
        adaptability: { id: 'adaptability', name: 'Adaptability', score: 10, letterGrade: 'Immeasurable' },
        objectivity: { id: 'objectivity', name: 'Objectivity', score: 10, letterGrade: 'Immeasurable' },
        initiative: { id: 'initiative', name: 'Initiative', score: 10, letterGrade: 'Immeasurable' },
        // Builder metrics
        exterior: { id: 'exterior', name: 'Exterior', score: 10, letterGrade: 'Immeasurable' },
        interior: { id: 'interior', name: 'Interior', score: 10, letterGrade: 'Immeasurable' },
        decoration: { id: 'decoration', name: 'Decoration', score: 10, letterGrade: 'Immeasurable' },
        effort: { id: 'effort', name: 'Effort', score: 10, letterGrade: 'Immeasurable' },
        contribution: { id: 'contribution', name: 'Contribution', score: 10, letterGrade: 'Immeasurable' },
        cooperativeness: { id: 'cooperativeness', name: 'Cooperativeness', score: 10, letterGrade: 'Immeasurable' },
        creativity: { id: 'creativity', name: 'Creativity', score: 10, letterGrade: 'Immeasurable' },
        consistency: { id: 'consistency', name: 'Consistency', score: 10, letterGrade: 'Immeasurable' }
      };
    }
    
    // Create the new staff member
    const newStaff = {
      name: newStaffName,
      role: newStaffRole,
      avatar: newStaffAvatar,
      metrics,
      overallScore: newStaffRole === 'Manager' || newStaffRole === 'Owner' ? 10 : 5,
      overallGrade: newStaffRole === 'Manager' || newStaffRole === 'Owner' ? 'SSS+' : 'B+'
    };
    
    addStaffMember(newStaff);
    
    // Reset form and close modal
    setNewStaffName('');
    setNewStaffRole('Moderator');
    setNewStaffAvatar('https://i.pravatar.cc/150');
    setShowAddStaffModal(false);
    
    toast({
      title: "Staff Added",
      description: `${newStaffName} has been added as a ${newStaffRole}.`,
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
  
  if (loading) return <LoadingState />;
  
  if (!isAdmin) {
    return null; // The useEffect will handle the redirect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <User size={24} className="text-cyber-cyan mr-3" />
        <div>
          <h1 className="text-3xl font-digital text-white mb-2">Administrator Panel</h1>
          <p className="text-white/60 font-cyber">Manage staff performance metrics</p>
        </div>
      </div>
      
      {/* Filters & Sort Controls */}
      <div className="mb-6 cyber-panel p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-cyan" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-cyber-black border border-cyber-cyan rounded pl-10 pr-4 py-2 text-white font-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
            />
          </div>
          
          {/* Role Filter */}
          <div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-cyber-cyan" />
              <label className="text-white font-cyber text-sm">Filter Role:</label>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as StaffRole | 'All')}
              className="w-full bg-cyber-black border border-cyber-cyan rounded px-3 py-2 text-white font-cyber mt-1 focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
            >
              <option value="All">All Roles</option>
              <option value="Moderator">Moderators</option>
              <option value="Builder">Builders</option>
              <option value="Manager">Managers</option>
              <option value="Owner">Owner</option>
            </select>
          </div>
          
          {/* Sort Controls */}
          <div>
            <div className="flex items-center gap-2">
              <SortDesc size={18} className="text-cyber-cyan" />
              <label className="text-white font-cyber text-sm">Sort By:</label>
            </div>
            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => toggleSort('name')}
                className={`px-3 py-1 text-sm font-cyber rounded border ${sortBy === 'name' ? 'bg-cyber-cyan/20 border-cyber-cyan' : 'border-white/20 hover:border-cyber-cyan'}`}
              >
                Name {sortBy === 'name' && (sortAsc ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => toggleSort('role')}
                className={`px-3 py-1 text-sm font-cyber rounded border ${sortBy === 'role' ? 'bg-cyber-cyan/20 border-cyber-cyan' : 'border-white/20 hover:border-cyber-cyan'}`}
              >
                Role {sortBy === 'role' && (sortAsc ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => toggleSort('score')}
                className={`px-3 py-1 text-sm font-cyber rounded border ${sortBy === 'score' ? 'bg-cyber-cyan/20 border-cyber-cyan' : 'border-white/20 hover:border-cyber-cyan'}`}
              >
                Score {sortBy === 'score' && (sortAsc ? '↑' : '↓')}
              </button>
            </div>
          </div>
          
          {/* Add Staff Button */}
          <div className="flex items-end">
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="cyber-button w-full flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add New Staff
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1">
          <div className="cyber-panel h-[600px] overflow-y-auto">
            <h2 className="text-lg font-digital text-white mb-4">Staff Members ({filteredStaff.length})</h2>
            <div className="space-y-3">
              {filteredStaff.map(staff => (
                <div 
                  key={staff.id}
                  onClick={() => handleStaffSelect(staff)}
                  className={`flex items-center p-3 rounded transition-all cursor-pointer
                    ${selectedStaff?.id === staff.id 
                      ? 'bg-cyber-cyan/20 border border-cyber-cyan' 
                      : 'hover:bg-cyber-darkpurple'}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={staff.avatar} 
                      alt={staff.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-cyber">{staff.name}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-cyber-cyan text-sm">{staff.role}</p>
                      <p className="text-sm text-white">{staff.overallGrade}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredStaff.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/60 font-cyber">No staff members found</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Staff Metrics Editor */}
        <div className="lg:col-span-2">
          {selectedStaff ? (
            <div className="cyber-panel">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={selectedStaff.avatar} 
                      alt={selectedStaff.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-digital text-white">{selectedStaff.name}</h2>
                    <p className="text-cyber-cyan text-sm">{selectedStaff.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowRemoveConfirmation(true)}
                    className="p-2 text-white hover:text-red-500"
                    title="Remove Staff Member"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedStaff(null)}
                    className="p-2 text-white hover:text-cyber-cyan"
                    title="Cancel Editing"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={saveChanges}
                    className="cyber-button text-sm py-1 px-3 rounded flex items-center gap-1"
                    title="Save Changes"
                  >
                    <Check size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2">
                {Object.entries(selectedStaff.metrics).map(([key, metric]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-cyber text-white">{metric.name}</label>
                      <div className="text-cyber-cyan text-sm font-digital flex items-center gap-2">
                        <span className="text-white">Score: {metric.score.toFixed(1)}</span>
                        <span className={`letter-grade ${selectedStaff.role === 'Manager' || selectedStaff.role === 'Owner' ? 'grade-sss' : ''}`}>
                          {metric.letterGrade}
                        </span>
                      </div>
                    </div>
                    
                    {/* Only show sliders for non-manager/owner roles or if empty */}
                    {(selectedStaff.role !== 'Manager' && selectedStaff.role !== 'Owner') && (
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={metric.score}
                        onChange={(e) => handleScoreChange(key, parseFloat(e.target.value))}
                        className="w-full accent-cyber-cyan bg-cyber-darkpurple h-2 rounded-full appearance-none cursor-pointer"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Overall Grade Display */}
              <div className="mt-6 border-t border-cyber-cyan/30 pt-4 flex justify-between items-center">
                <div className="text-lg font-digital text-white">
                  Overall Performance:
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-cyber-cyan font-digital">
                    Score: {selectedStaff.overallScore.toFixed(1)}
                  </div>
                  <div className={`letter-grade text-lg ${selectedStaff.role === 'Manager' || selectedStaff.role === 'Owner' ? 'grade-sss' : ''}`}>
                    {selectedStaff.overallGrade}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="cyber-panel h-[600px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-cyber-cyan font-digital text-xl mb-2">No Staff Selected</p>
                <p className="text-white/60 font-cyber">Select a staff member to edit their metrics</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Staff Modal */}
      <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
        <DialogContent className="bg-cyber-darkblue border border-cyber-cyan shadow-[0_0_15px_rgba(0,255,255,0.5)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="font-digital text-xl cyber-text-glow text-cyber-cyan">ADD NEW STAFF MEMBER</span>
            </DialogTitle>
            <DialogDescription className="text-center text-white/70 font-cyber text-sm">
              Enter details for the new staff member
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => { e.preventDefault(); handleAddStaff(); }} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-cyber text-cyber-cyan">
                Staff Name
              </label>
              <input 
                type="text" 
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan" 
                placeholder="Enter staff name" 
                required 
              />
            </div>
            
            {/* Role Field */}
            <div className="space-y-2">
              <label className="block text-sm font-cyber text-cyber-cyan">
                Staff Role
              </label>
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                className="w-full bg-cyber-black border border-cyber-cyan rounded px-3 py-2 text-white font-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
              >
                <option value="Moderator">Moderator</option>
                <option value="Builder">Builder</option>
                <option value="Manager">Manager</option>
                <option value="Owner">Owner</option>
              </select>
            </div>
            
            {/* Avatar URL Field */}
            <div className="space-y-2">
              <label className="block text-sm font-cyber text-cyber-cyan">
                Profile Image URL
              </label>
              <input 
                type="text" 
                value={newStaffAvatar}
                onChange={(e) => setNewStaffAvatar(e.target.value)}
                className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan" 
                placeholder="https://example.com/image.jpg" 
              />
              <div className="flex justify-center mt-2">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-cyber-cyan">
                  <img src={newStaffAvatar} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
              
            <div className="flex justify-end gap-2 mt-6">
              <button 
                type="button" 
                onClick={() => setShowAddStaffModal(false)}
                className="px-4 py-2 text-white hover:text-cyber-cyan font-cyber border border-cyber-cyan/50 rounded hover:border-cyber-cyan transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="cyber-button rounded"
              >
                Add Staff
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Remove Staff Confirmation Dialog */}
      <Dialog open={showRemoveConfirmation} onOpenChange={setShowRemoveConfirmation}>
        <DialogContent className="bg-cyber-darkblue border border-cyber-cyan shadow-[0_0_15px_rgba(0,255,255,0.5)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="font-digital text-xl cyber-text-glow text-red-500">CONFIRM REMOVAL</span>
            </DialogTitle>
            <DialogDescription className="text-center text-white/70 font-cyber text-sm">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <p className="text-white font-cyber">
              Are you sure you want to remove <span className="text-cyber-cyan">{selectedStaff?.name}</span>?
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setShowRemoveConfirmation(false)}
              className="px-4 py-2 text-white hover:text-cyber-cyan font-cyber border border-cyber-cyan/50 rounded hover:border-cyber-cyan transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleRemoveStaff}
              className="px-4 py-2 text-white bg-red-900/50 hover:bg-red-900 font-cyber border border-red-500 rounded transition-all"
            >
              Remove
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
