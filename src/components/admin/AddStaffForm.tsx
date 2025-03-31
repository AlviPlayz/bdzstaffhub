import React, { useState, useRef, useEffect } from 'react';
import { StaffRole, LetterGrade } from '@/types/staff';
import { Camera, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { calculateLetterGrade } from '@/utils/gradeUtils';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

// Form schema for adding/editing staff
const staffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.enum(['Moderator', 'Builder', 'Manager', 'Owner']),
  rank: z.string().optional(),
  description: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

// Type definitions for staff ranks
type ModeratorRank = 'Sr.Mod' | 'Mod' | 'Jr.Mod' | 'Trial';
type BuilderRank = 'HeadBuilder' | 'Builder' | 'Trial Builder';
type ManagerRank = 'Manager';
type OwnerRank = 'Owner';

interface AddStaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (staff: any) => Promise<void>;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ isOpen, onClose, onAddStaff }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showEvaluationSheet, setShowEvaluationSheet] = useState(false);
  const [staffMetrics, setStaffMetrics] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: '',
      role: 'Moderator',
      rank: 'Trial',
      description: '',
    }
  });
  
  const watchedRole = form.watch('role');

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setImagePreview(null);
      setStaffMetrics({});
    }
  }, [isOpen, form]);
  
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleImageFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleImageFile(e.target.files[0]);
    }
  };
  
  const handleImageFile = async (file: File) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!file.type.match('image/jpeg|image/png|image/webp')) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG and WebP images are supported",
        variant: "destructive"
      });
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload to Supabase storage
    try {
      setUploadingImage(true);
      
      // First, check if the bucket exists, if not we'll use a placeholder image
      const { data: bucketExists } = await supabase.storage.getBucket('staff-avatars');
      
      let imageUrl = '';
      
      if (bucketExists) {
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('staff-avatars')
          .upload(fileName, file);
        
        if (error) {
          console.error('Error uploading image:', error);
          // Fallback to a placeholder if upload fails
          imageUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
          setImagePreview(imageUrl);
        } else {
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('staff-avatars')
            .getPublicUrl(fileName);
            
          imageUrl = urlData.publicUrl;
          setImagePreview(imageUrl);
        }
      } else {
        // Use placeholder if bucket doesn't exist
        imageUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
        setImagePreview(imageUrl);
        console.log('Using placeholder image as storage bucket not found');
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      // Fallback to a placeholder in case of any error
      const placeholderUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
      setImagePreview(placeholderUrl);
      
      // Don't show error to user since we're using a fallback
      toast({
        title: "Image Preview Ready",
        description: "Using a default avatar as fallback.",
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const getAvailableRanks = () => {
    switch (watchedRole) {
      case 'Moderator':
        return ['Sr.Mod', 'Mod', 'Jr.Mod', 'Trial'];
      case 'Builder':
        return ['HeadBuilder', 'Builder', 'Trial Builder'];
      case 'Manager':
        return ['Manager'];
      case 'Owner':
        return ['Owner'];
      default:
        return [];
    }
  };
  
  const handleMetricChange = (key: string, value: number) => {
    setStaffMetrics(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const getGroupedMetrics = () => {
    if (watchedRole === 'Moderator') {
      return {
        'Moderation Skills': [
          { key: 'responsiveness', name: 'Responsiveness' },
          { key: 'fairness', name: 'Fairness' },
          { key: 'communication', name: 'Communication' },
          { key: 'conflictResolution', name: 'Conflict Resolution' },
          { key: 'ruleEnforcement', name: 'Rule Enforcement' }
        ],
        'Team Qualities': [
          { key: 'engagement', name: 'Engagement' },
          { key: 'supportiveness', name: 'Supportiveness' },
          { key: 'adaptability', name: 'Adaptability' },
          { key: 'objectivity', name: 'Objectivity' },
          { key: 'initiative', name: 'Initiative' }
        ]
      };
    } else if (watchedRole === 'Builder') {
      return {
        'Building Skills': [
          { key: 'exterior', name: 'Exterior' },
          { key: 'interior', name: 'Interior' },
          { key: 'decoration', name: 'Decoration' },
          { key: 'creativity', name: 'Creativity' },
          { key: 'consistency', name: 'Consistency' }
        ],
        'Team Qualities': [
          { key: 'effort', name: 'Effort' },
          { key: 'contribution', name: 'Contribution' },
          { key: 'communication', name: 'Communication' },
          { key: 'adaptability', name: 'Adaptability' },
          { key: 'cooperativeness', name: 'Cooperativeness' }
        ]
      };
    } else {
      // Manager or Owner gets all metrics
      return {
        'Moderation Skills': [
          { key: 'responsiveness', name: 'Responsiveness' },
          { key: 'fairness', name: 'Fairness' },
          { key: 'communication', name: 'Communication' },
          { key: 'conflictResolution', name: 'Conflict Resolution' },
          { key: 'ruleEnforcement', name: 'Rule Enforcement' }
        ],
        'Team Qualities': [
          { key: 'engagement', name: 'Engagement' },
          { key: 'supportiveness', name: 'Supportiveness' },
          { key: 'adaptability', name: 'Adaptability' },
          { key: 'objectivity', name: 'Objectivity' },
          { key: 'initiative', name: 'Initiative' }
        ],
        'Building Skills': [
          { key: 'exterior', name: 'Exterior' },
          { key: 'interior', name: 'Interior' },
          { key: 'decoration', name: 'Decoration' },
          { key: 'creativity', name: 'Creativity' },
          { key: 'consistency', name: 'Consistency' }
        ],
        'Builder Team Qualities': [
          { key: 'effort', name: 'Effort' },
          { key: 'contribution', name: 'Contribution' },
          { key: 'cooperativeness', name: 'Cooperativeness' }
        ]
      };
    }
  };
  
  const calculateOverallScore = (): number => {
    if (watchedRole === 'Manager' || watchedRole === 'Owner') {
      return 10;
    }
    
    const metrics = Object.values(staffMetrics);
    if (metrics.length === 0) return 5; // Default score
    
    const total = metrics.reduce((sum, score) => sum + score, 0);
    return parseFloat((total / metrics.length).toFixed(1));
  };
  
  const onSubmit = async (values: StaffFormValues) => {
    if (!imagePreview) {
      toast({
        title: "Image required",
        description: "Please upload a profile image",
        variant: "destructive"
      });
      return;
    }
    
    // Generate metrics based on role
    let metrics: any = {};
    let overallGrade: LetterGrade = 'B+';
    
    if (values.role === 'Moderator') {
      metrics = {
        responsiveness: { id: 'responsiveness', name: 'Responsiveness', score: staffMetrics.responsiveness || 5, letterGrade: calculateLetterGrade(staffMetrics.responsiveness || 5) as LetterGrade },
        fairness: { id: 'fairness', name: 'Fairness', score: staffMetrics.fairness || 5, letterGrade: calculateLetterGrade(staffMetrics.fairness || 5) as LetterGrade },
        communication: { id: 'communication', name: 'Communication', score: staffMetrics.communication || 5, letterGrade: calculateLetterGrade(staffMetrics.communication || 5) as LetterGrade },
        conflictResolution: { id: 'conflictResolution', name: 'Conflict Resolution', score: staffMetrics.conflictResolution || 5, letterGrade: calculateLetterGrade(staffMetrics.conflictResolution || 5) as LetterGrade },
        ruleEnforcement: { id: 'ruleEnforcement', name: 'Rule Enforcement', score: staffMetrics.ruleEnforcement || 5, letterGrade: calculateLetterGrade(staffMetrics.ruleEnforcement || 5) as LetterGrade },
        engagement: { id: 'engagement', name: 'Engagement', score: staffMetrics.engagement || 5, letterGrade: calculateLetterGrade(staffMetrics.engagement || 5) as LetterGrade },
        supportiveness: { id: 'supportiveness', name: 'Supportiveness', score: staffMetrics.supportiveness || 5, letterGrade: calculateLetterGrade(staffMetrics.supportiveness || 5) as LetterGrade },
        adaptability: { id: 'adaptability', name: 'Adaptability', score: staffMetrics.adaptability || 5, letterGrade: calculateLetterGrade(staffMetrics.adaptability || 5) as LetterGrade },
        objectivity: { id: 'objectivity', name: 'Objectivity', score: staffMetrics.objectivity || 5, letterGrade: calculateLetterGrade(staffMetrics.objectivity || 5) as LetterGrade },
        initiative: { id: 'initiative', name: 'Initiative', score: staffMetrics.initiative || 5, letterGrade: calculateLetterGrade(staffMetrics.initiative || 5) as LetterGrade }
      };
    } else if (values.role === 'Builder') {
      metrics = {
        exterior: { id: 'exterior', name: 'Exterior', score: staffMetrics.exterior || 5, letterGrade: calculateLetterGrade(staffMetrics.exterior || 5) as LetterGrade },
        interior: { id: 'interior', name: 'Interior', score: staffMetrics.interior || 5, letterGrade: calculateLetterGrade(staffMetrics.interior || 5) as LetterGrade },
        decoration: { id: 'decoration', name: 'Decoration', score: staffMetrics.decoration || 5, letterGrade: calculateLetterGrade(staffMetrics.decoration || 5) as LetterGrade },
        effort: { id: 'effort', name: 'Effort', score: staffMetrics.effort || 5, letterGrade: calculateLetterGrade(staffMetrics.effort || 5) as LetterGrade },
        contribution: { id: 'contribution', name: 'Contribution', score: staffMetrics.contribution || 5, letterGrade: calculateLetterGrade(staffMetrics.contribution || 5) as LetterGrade },
        communication: { id: 'communication', name: 'Communication', score: staffMetrics.communication || 5, letterGrade: calculateLetterGrade(staffMetrics.communication || 5) as LetterGrade },
        adaptability: { id: 'adaptability', name: 'Adaptability', score: staffMetrics.adaptability || 5, letterGrade: calculateLetterGrade(staffMetrics.adaptability || 5) as LetterGrade },
        cooperativeness: { id: 'cooperativeness', name: 'Cooperativeness', score: staffMetrics.cooperativeness || 5, letterGrade: calculateLetterGrade(staffMetrics.cooperativeness || 5) as LetterGrade },
        creativity: { id: 'creativity', name: 'Creativity', score: staffMetrics.creativity || 5, letterGrade: calculateLetterGrade(staffMetrics.creativity || 5) as LetterGrade },
        consistency: { id: 'consistency', name: 'Consistency', score: staffMetrics.consistency || 5, letterGrade: calculateLetterGrade(staffMetrics.consistency || 5) as LetterGrade }
      };
    } else {
      // Manager or Owner
      overallGrade = 'SSS+' as LetterGrade;
      metrics = {
        // All metrics set to immeasurable
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
    
    // Create new staff object
    const newStaff = {
      name: values.name,
      role: values.role as StaffRole,
      rank: values.rank,
      description: values.description || '',
      avatar: imagePreview,
      metrics,
      overallScore: calculateOverallScore(),
      overallGrade
    };
    
    try {
      setUploadingImage(true); // Show loading state
      await onAddStaff(newStaff);
      
      // Reset states after successful submission
      form.reset();
      setImagePreview(null);
      setStaffMetrics({});
      onClose();
      
      toast({
        title: "Staff Added",
        description: `${values.name} has been added as a ${values.role}`,
      });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({
        title: "Failed to add staff",
        description: "An error occurred while saving staff information",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const renderEvaluationSheet = () => {
    return (
      <Sheet open={showEvaluationSheet} onOpenChange={setShowEvaluationSheet}>
        <SheetContent side="right" className="bg-cyber-darkblue border-l border-cyber-cyan w-full sm:max-w-md max-h-screen overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-center font-digital text-xl text-cyber-cyan">
              Staff Performance Metrics
            </SheetTitle>
            <SheetDescription className="text-center text-white/70">
              Set scores from 0-10 for each performance category
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6 overflow-y-auto pr-2">
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
          
          <div className="mt-8 pt-4 border-t border-cyber-cyan/30 sticky bottom-0 bg-cyber-darkblue pb-2">
            <Button
              type="button"
              onClick={() => setShowEvaluationSheet(false)}
              className="w-full cyber-button"
            >
              Save & Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          // Reset form on close
          form.reset();
          setImagePreview(null);
          setStaffMetrics({});
        }
        onClose();
      }}>
        <DialogContent className="bg-cyber-darkblue border border-cyber-cyan shadow-[0_0_15px_rgba(0,255,255,0.5)] max-w-lg max-h-[90vh] overflow-y-auto">
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
                  className={`relative w-32 h-32 rounded-full overflow-hidden border-2 ${
                    isDragging ? 'border-cyber-cyan border-dashed bg-cyber-darkpurple/50' : 'border-cyber-cyan/30'
                  } cursor-pointer transition-all duration-200 mb-2 hover:border-cyber-cyan`}
                  onClick={openFileDialog}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload size={24} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/60 p-2">
                      <Camera size={28} className="mb-1 text-cyber-cyan/60" />
                      <span className="text-xs text-center">
                        {isDragging ? 'Drop image here' : 'Click or drag image here'}
                      </span>
                    </div>
                  )}
                  
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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
                <div className="text-xs text-white/50 flex flex-col items-center">
                  <span>JPG, PNG or WebP (max. 5MB)</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={openFileDialog}
                    className="text-cyber-cyan hover:text-cyber-cyan/80 p-0 h-auto mt-1"
                  >
                    Browse files
                  </Button>
                </div>
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowEvaluationSheet(true)}
                    className="text-sm text-cyber-cyan hover:text-cyber-cyan/80 hover:bg-transparent p-0 h-auto"
                  >
                    Set Scores <span className="text-xs">(0-10)</span>
                  </Button>
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
              
              <DialogFooter className="flex justify-end gap-2 mt-6 pt-2 border-t border-cyber-cyan/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Reset form on cancel
                    form.reset();
                    setImagePreview(null);
                    setStaffMetrics({});
                    onClose();
                  }}
                  className="border-cyber-cyan/50 text-white hover:text-cyber-cyan hover:border-cyber-cyan"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploadingImage}
                  className="cyber-button rounded bg-cyber-cyan hover:bg-cyber-cyan/80 text-black font-medium"
                >
                  {uploadingImage ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </div>
                  ) : "Add Staff"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Sheet for evaluation metrics */}
      {renderEvaluationSheet && renderEvaluationSheet()}
    </>
  );
};

export default AddStaffForm;
