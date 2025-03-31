import React, { useState, useEffect, useRef } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import { User, Search, Check, X, Plus, Trash2, Filter, SortDesc, Upload, Camera } from 'lucide-react';
import { StaffMember, StaffRole, LetterGrade } from '@/types/staff';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import LoadingState from '@/components/LoadingState';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { calculateLetterGrade } from '@/utils/gradeUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

// Type definitions for staff ranks
type ModeratorRank = 'Sr.Mod' | 'Mod' | 'Jr.Mod' | 'Trial';
type BuilderRank = 'HeadBuilder' | 'Builder' | 'Trial Builder';
type ManagerRank = 'Manager';
type OwnerRank = 'Owner';

// Form schema for adding/editing staff
const staffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.enum(['Moderator', 'Builder', 'Manager', 'Owner']),
  rank: z.string().optional(),
  description: z.string().optional(),
  // Metrics will be handled separately
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

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
    let overallGrade: LetterGrade = 'B+';
    
    if (newStaffRole === 'Moderator') {
      metrics = {
        responsiveness: { id: 'responsiveness', name: 'Responsiveness', score: 5, letterGrade: 'B+' as LetterGrade },
        fairness: { id: 'fairness', name: 'Fairness', score: 5, letterGrade: 'B+' as LetterGrade },
        communication: { id: 'communication', name: 'Communication', score: 5, letterGrade: 'B+' as LetterGrade },
        conflictResolution: { id: 'conflictResolution', name: 'Conflict Resolution', score: 5, letterGrade: 'B+' as LetterGrade },
        ruleEnforcement: { id: 'ruleEnforcement', name: 'Rule Enforcement', score: 5, letterGrade: 'B+' as LetterGrade },
        engagement: { id: 'engagement', name: 'Engagement', score: 5, letterGrade: 'B+' as LetterGrade },
        supportiveness: { id: 'supportiveness', name: 'Supportiveness', score: 5, letterGrade: 'B+' as LetterGrade },
        adaptability: { id: 'adaptability', name: 'Adaptability', score: 5, letterGrade: 'B+' as LetterGrade },
        objectivity: { id: 'objectivity', name: 'Objectivity', score: 5, letterGrade: 'B+' as LetterGrade },
        initiative: { id: 'initiative', name: 'Initiative', score: 5, letterGrade: 'B+' as LetterGrade }
      };
    } else if (newStaffRole === 'Builder') {
      metrics = {
        exterior: { id: 'exterior', name: 'Exterior', score: 5, letterGrade: 'B+' as LetterGrade },
        interior: { id: 'interior', name: 'Interior', score: 5, letterGrade: 'B+' as LetterGrade },
        decoration: { id: 'decoration', name: 'Decoration', score: 5, letterGrade: 'B+' as LetterGrade },
        effort: { id: 'effort', name: 'Effort', score: 5, letterGrade: 'B+' as LetterGrade },
        contribution: { id: 'contribution', name: 'Contribution', score: 5, letterGrade: 'B+' as LetterGrade },
        communication: { id: 'communication', name: 'Communication', score: 5, letterGrade: 'B+' as LetterGrade },
        adaptability: { id: 'adaptability', name: 'Adaptability', score: 5, letterGrade: 'B+' as LetterGrade },
        cooperativeness: { id: 'cooperativeness', name: 'Cooperativeness', score: 5, letterGrade: 'B+' as LetterGrade },
        creativity: { id: 'creativity', name: 'Creativity', score: 5, letterGrade: 'B+' as LetterGrade },
        consistency: { id: 'consistency', name: 'Consistency', score: 5, letterGrade: 'B+' as LetterGrade }
      };
    } else {
      // Manager or Owner
      overallGrade = 'SSS+' as LetterGrade;
      metrics = {
        // Moderator metrics
        responsiveness: { id: 'responsiveness', name: 'Responsiveness', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        fairness: { id: 'fairness', name: 'Fairness', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        communication: { id: 'communication', name: 'Communication', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        conflictResolution: { id: 'conflictResolution', name: 'Conflict Resolution', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        ruleEnforcement: { id: 'ruleEnforcement', name: 'Rule Enforcement', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        engagement: { id: 'engagement', name: 'Engagement', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        supportiveness: { id: 'supportiveness', name: 'Supportiveness', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        adaptability: { id: 'adaptability', name: 'Adaptability', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        objectivity: { id: 'objectivity', name: 'Objectivity', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        initiative: { id: 'initiative', name: 'Initiative', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        // Builder metrics
        exterior: { id: 'exterior', name: 'Exterior', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        interior: { id: 'interior', name: 'Interior', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        decoration: { id: 'decoration', name: 'Decoration', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        effort: { id: 'effort', name: 'Effort', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        contribution: { id: 'contribution', name: 'Contribution', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        cooperativeness: { id: 'cooperativeness', name: 'Cooperativeness', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        creativity: { id: 'creativity', name: 'Creativity', score: 10, letterGrade: 'Immeasurable' as LetterGrade },
        consistency: { id: 'consistency', name: 'Consistency', score: 10, letterGrade: 'Immeasurable' as LetterGrade }
      };
    }
    
    // Create the new staff member
    const newStaff = {
      name: newStaffName,
      role: newStaffRole,
      avatar: newStaffAvatar,
      metrics,
      overallScore: newStaffRole === 'Manager' || newStaffRole === 'Owner' ? 10 : 5,
      overallGrade: overallGrade // Now using the LetterGrade type
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
  
  const getStaffRoleLabel = (role: StaffRole): string => {
    switch (role) {
      case 'Moderator': return 'Moderator';
      case 'Builder': return 'Builder';
      case 'Manager': return 'Manager';
      case 'Owner': return 'Owner';
      default: return 'Unknown';
    }
  };
  
  const getLetterGradeClassName = (grade: LetterGrade): string => {
    switch (grade) {
      case 'S+': return 'text-green-500';
      case 'S': return 'text-green-400';
      case 'A+': return 'text-lime-500';
      case 'A': return 'text-lime-400';
      case 'B+': return 'text-yellow-500';
      case 'B': return 'text-yellow-400';
      case 'C': return 'text-orange-500';
      case 'D': return 'text-orange-400';
      case 'E': return 'text-red-500';
      case 'E-': return 'text-red-400';
      case 'SSS+': return 'text-fuchsia-400';
      case 'Immeasurable': return 'text-fuchsia-400';
      default: return 'text-gray-400';
    }
  };
  
  const renderStaffList = () => (
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
                  <p className="text-cyber-cyan text-sm">{getStaffRoleLabel(staff.role)}</p>
                  <p className={`text-sm text-white ${getLetterGradeClassName(staff.overallGrade)}`}>{staff.overallGrade}</p>
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
  );
  
  const renderStaffMetricsEditor = () => (
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
                <p className="text-cyber-cyan text-sm">{getStaffRoleLabel(selectedStaff.role)}</p>
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
  );
  
  
  // Enhanced Add Staff Modal
  const renderAddStaffModal = () => {
    return (
      <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
        <DialogContent className="bg-cyber-darkblue border border-cyber-cyan shadow-[0_0_15px_rgba(0,255,255,0.5)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="font-digital text-xl cyber-text-glow text-cyber-cyan">ADD NEW STAFF MEMBER</span>
            </DialogTitle>
            <DialogDescription className="text-center text-white/70 font-cyber text-sm">
              Enter details for the new staff member
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className={`relative w-28 h-28 rounded-full overflow-hidden border-2 ${
                    isDragging ? 'border-cyber-cyan/80 bg-cyber-darkpurple/50' : 'border-cyber-cyan/30'
                  } cursor-pointer transition-all duration-200 mb-2`}
                  onClick={openFileDialog}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/60 p-2">
                      <Camera size={28} className="mb-1 text-cyber-cyan/60" />
                      <span className="text-xs text-center">
                        {isDragging ? 'Drop image here' : 'Click or drag image here'}
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileSelect}
                />
                <span className="text-xs text-white/50">
                  JPG, PNG or WebP (max. 5MB)
                </span>
              </div>
              
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-cyber text-cyber-cyan">
                      Staff Name
                    </FormLabel>
                    <FormControl>
                      <input 
                        {...field}
                        className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan" 
                        placeholder="Enter staff name" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Role Field */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-cyber text-cyber-cyan">
                      Staff Role
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full bg-cyber-black border border-cyber-cyan rounded px-3 py-2 text-white font-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
                      >
                        <option value="Moderator">Moderator</option>
                        <option value="Builder">Builder</option>
                        <option value="Manager">Manager</option>
                        <option value="Owner">Owner</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Rank Field */}
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-cyber text-cyber-cyan">
                      Staff Rank
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full bg-cyber-black border border-cyber-cyan rounded px-3 py-2 text-white font-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
                      >
                        {getAvailableRanks().map(rank => (
                          <option key={rank} value={rank}>{rank}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Description Field (Optional) */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-cyber text-cyber-cyan">
                      Description (Optional)
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan h-20 resize-none"
                        placeholder="Add notes about this staff member..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Evaluation Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-cyber">Performance Evaluation</h3>
                  <button
                    type="button"
                    onClick={() => setShowEvaluationSheet(true)}
                    className="text-sm text-cyber-cyan hover:underline flex items-center gap-1"
                  >
                    Set Scores <span className="text-xs">(0-10)</span>
                  </button>
                </div>
                
                <div className="bg-cyber-black/50 p-3 rounded border border-cyber-cyan/30">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-cyber">Overall Score:</span>
                    <span className="text-lg font-digital text-cyber-cyan">
                      {calculateOverallScore().toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-white font-cyber">Overall Grade:</span>
                    <span className={`text-lg font-digital ${watchedRole === 'Manager' || watchedRole === 'Owner' ? 'text-fuchsia-400' : 'text-amber-400'}`}>
                      {watchedRole === 'Manager' || watchedRole === 'Owner' 
                        ? 'SSS+' 
                        : calculateLetterGrade(calculateOverallScore())}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-xs text-white/60 italic">
                    {watchedRole === 'Manager' || watchedRole === 'Owner'
                      ? "Managers and Owners receive Immeasurable scores by default."
                      : "Click 'Set Scores' to adjust performance metrics."}
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
          </Form>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Sheet for setting evaluation metrics
  const renderEvaluationSheet = () => {
    return (
      <Sheet open={showEvaluationSheet} onOpenChange={setShowEvaluationSheet}>
        <SheetContent side="right" className="bg-cyber-darkblue border-l border-cyber-cyan w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-center font-digital text-xl text-cyber-cyan">
              Staff Performance Metrics
            </SheetTitle>
            <SheetDescription className="text-center text-white/70">
              Set scores from 0-10 for each performance category
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-8 mt-8 max-h-[calc(100vh-220px)] overflow-y-auto pr-4">
            {Object.entries(getGroupedMetrics()).map(([group, metrics]) => (
              <div key={group} className="space-y-4">
                <h3 className="text-lg font-digital text-white border-b border-cyber-cyan/30 pb-1">
                  {group}
                </h3>
                
                {metrics.map(({ key, name }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-cyber text-white">{name}</label>
                      <div className="text-cyber-cyan text-sm font-digital flex items-center gap-2">
                        <span className="text-white">Score: {staffMetrics[key] || 0}</span>
                        <span className={`letter-grade ${
                          watchedRole === 'Manager' || watchedRole === 'Owner' 
                            ? 'grade-sss' 
                            : ''
                        }`}>
                          {(watchedRole === 'Manager' || watchedRole === 'Owner')
                            ? 'Immeasurable'
                            : calculateLetterGrade(staffMetrics[key] || 0)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Only show editable sliders for non-manager/owner roles */}
                    {(watchedRole !== 'Manager' && watchedRole !== 'Owner') && (
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={staffMetrics[key] || 0}
                        onChange={(e) => handleMetricChange(key, parseFloat(e.target.value))}
                        className="w-full accent-cyber-cyan bg-cyber-darkpurple h-2 rounded-full appearance-none cursor-pointer"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-4 border-t border-cyber-cyan/30">
            <button
              type="button"
              onClick={() => setShowEvaluationSheet(false)}
              className="w-full cyber-button"
            >
              Save & Close
            </button>
          </div>
        </SheetContent>
      </Sheet>
    );
  };
  
  const renderRemoveStaffConfirmationDialog = () => (
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
