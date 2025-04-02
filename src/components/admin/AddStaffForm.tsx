
import React, { useState, useEffect } from 'react';
import { StaffMember, StaffRole } from '@/types/staff';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { uploadStaffImage } from '@/services/staff/staffImageService';
import { toast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { initializeStaffImageStorage } from '@/services/staff/staffImageService';
import { createImmeasurableMetrics } from '@/services/staff/staffGrading';

// Define props interface for the component
interface AddStaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (newStaffData: Omit<StaffMember, 'id'>) => Promise<void>;
}

// Define form values interface
interface StaffFormValues {
  name: string;
  role: StaffRole;
  rank: string;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ isOpen, onClose, onAddStaff }) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<StaffFormValues>({
    defaultValues: {
      name: '',
      role: 'Moderator',
      rank: 'Trial Mod',
    }
  });
  
  const currentRole = form.watch('role');
  
  // Initialize the rank when role changes
  useEffect(() => {
    if (currentRole === 'Moderator') {
      form.setValue('rank', 'Trial Mod');
    } else if (currentRole === 'Builder') {
      form.setValue('rank', 'Trial Builder');
    } else if (currentRole === 'Manager' || currentRole === 'Owner') {
      form.setValue('rank', 'Manager');
    }
  }, [currentRole, form]);
  
  // Initialize storage bucket when component mounts
  useEffect(() => {
    initializeStaffImageStorage().catch(err => 
      console.error('Failed to initialize staff image storage:', err)
    );
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image file is too large. Maximum size is 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Selected file is not an image.",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      console.log("Image file selected:", file.name, file.type, file.size);
    }
  };
  
  const handleSubmit = async (values: StaffFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting form with values:", values);
    
    try {
      let avatarUrl = '/placeholder.svg';
      
      // Generate a temporary ID for the image upload
      const tempId = `temp-${Date.now()}`;
      
      if (avatarFile) {
        console.log("Uploading image for new staff member...");
        
        // Try to upload the image first
        const uploadedUrl = await uploadStaffImage(avatarFile, tempId, values.role);
        
        if (uploadedUrl) {
          console.log("Image uploaded successfully:", uploadedUrl);
          avatarUrl = uploadedUrl;
        } else {
          console.error("Image upload failed, using placeholder");
          toast({
            title: "Warning",
            description: "Failed to upload image. Using placeholder instead.",
            variant: "destructive",
          });
          avatarUrl = '/placeholder.svg';
        }
      } else {
        console.log("No image selected, using placeholder");
      }
      
      // Prepare metrics based on role
      let metrics;
      
      if (values.role === 'Manager' || values.role === 'Owner') {
        // Use special immeasurable metrics for Managers and Owners
        metrics = createImmeasurableMetrics(values.role);
        console.log("Created immeasurable metrics for Manager/Owner");
      } else if (values.role === 'Moderator') {
        // Define moderator metrics
        metrics = {
          responsiveness: { id: 'responsiveness', name: 'Responsiveness', score: 7, letterGrade: 'B' },
          fairness: { id: 'fairness', name: 'Fairness', score: 7, letterGrade: 'B' },
          communication: { id: 'communication', name: 'Communication', score: 7, letterGrade: 'B' },
          conflictResolution: { id: 'conflictResolution', name: 'Conflict Resolution', score: 7, letterGrade: 'B' },
          ruleEnforcement: { id: 'ruleEnforcement', name: 'Rule Enforcement', score: 7, letterGrade: 'B' },
          engagement: { id: 'engagement', name: 'Engagement', score: 7, letterGrade: 'B' },
          supportiveness: { id: 'supportiveness', name: 'Supportiveness', score: 7, letterGrade: 'B' },
          adaptability: { id: 'adaptability', name: 'Adaptability', score: 7, letterGrade: 'B' },
          objectivity: { id: 'objectivity', name: 'Objectivity', score: 7, letterGrade: 'B' },
          initiative: { id: 'initiative', name: 'Initiative', score: 7, letterGrade: 'B' },
        };
      } else if (values.role === 'Builder') {
        // Define builder metrics
        metrics = {
          exterior: { id: 'exterior', name: 'Exterior', score: 7, letterGrade: 'B' },
          interior: { id: 'interior', name: 'Interior', score: 7, letterGrade: 'B' },
          decoration: { id: 'decoration', name: 'Decoration', score: 7, letterGrade: 'B' },
          effort: { id: 'effort', name: 'Effort', score: 7, letterGrade: 'B' },
          contribution: { id: 'contribution', name: 'Contribution', score: 7, letterGrade: 'B' },
          communication: { id: 'communication', name: 'Communication', score: 7, letterGrade: 'B' },
          adaptability: { id: 'adaptability', name: 'Adaptability', score: 7, letterGrade: 'B' },
          cooperativeness: { id: 'cooperativeness', name: 'Cooperativeness', score: 7, letterGrade: 'B' },
          creativity: { id: 'creativity', name: 'Creativity', score: 7, letterGrade: 'B' },
          consistency: { id: 'consistency', name: 'Consistency', score: 7, letterGrade: 'B' },
        };
      }
      
      // Set overall score and grade
      const overallScore = values.role === 'Manager' || values.role === 'Owner' ? 10 : 7;
      const overallGrade = values.role === 'Manager' || values.role === 'Owner' ? 'SSS+' : 'B';
      
      // Create the new staff member object
      const newStaffData: Omit<StaffMember, 'id'> = {
        name: values.name,
        role: values.role,
        rank: values.rank,
        avatar: avatarUrl,
        metrics: metrics!,
        overallScore,
        overallGrade,
      };
      
      console.log("Adding new staff member with data:", {
        name: newStaffData.name,
        role: newStaffData.role,
        rank: newStaffData.rank,
        avatar: newStaffData.avatar.substring(0, 50) + '...',
      });
      
      // Submit the data
      await onAddStaff(newStaffData);
      
      // Reset form
      form.reset({
        name: '',
        role: 'Moderator',
        rank: 'Trial Mod',
      });
      setAvatarFile(null);
      setPreviewUrl(null);
      
      onClose();
    } catch (error) {
      console.error("Error adding staff:", error);
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Clean up preview URL when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setAvatarFile(null);
      form.reset({
        name: '',
        role: 'Moderator',
        rank: 'Trial Mod',
      });
    }
  }, [isOpen, form]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cyber-darkblue border border-cyber-cyan shadow-[0_0_15px_rgba(0,255,255,0.5)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="font-digital text-xl cyber-text-glow text-cyber-cyan">ADD NEW STAFF</span>
          </DialogTitle>
          <DialogDescription className="text-center text-cyber-cyan/70">
            Upload an image and set the staff member's details
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-cyber text-cyber-cyan">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
                      placeholder="Enter full name"
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-cyber text-cyber-cyan">
                    Role
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyber-cyan">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-cyber-black border border-cyber-cyan text-white">
                      <SelectItem value="Moderator">Moderator</SelectItem>
                      <SelectItem value="Builder">Builder</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-cyber text-cyber-cyan">
                    Rank
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyber-cyan">
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-cyber-black border border-cyber-cyan text-white">
                      {currentRole === 'Moderator' && (
                        <>
                          <SelectItem value="Sr. Mod">Sr. Mod</SelectItem>
                          <SelectItem value="Mod">Mod</SelectItem>
                          <SelectItem value="Jr. Mod">Jr. Mod</SelectItem>
                          <SelectItem value="Trial Mod">Trial Mod</SelectItem>
                        </>
                      )}
                      
                      {currentRole === 'Builder' && (
                        <>
                          <SelectItem value="Head Builder">Head Builder</SelectItem>
                          <SelectItem value="Builder">Builder</SelectItem>
                          <SelectItem value="Trial Builder">Trial Builder</SelectItem>
                        </>
                      )}
                      
                      {(currentRole === 'Manager' || currentRole === 'Owner') && (
                        <SelectItem value="Manager">Manager</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <div>
              <label className="block text-sm font-cyber text-cyber-cyan mb-2">
                Avatar Image
              </label>
              
              {previewUrl && (
                <div className="mb-3 flex justify-center">
                  <img 
                    src={previewUrl} 
                    alt="Avatar preview" 
                    className="w-24 h-24 object-cover rounded-full border-2 border-cyber-cyan"
                  />
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-cyber-cyan file:text-cyber-black
                      hover:file:bg-cyber-purple
                      cursor-pointer
                    "
              />
              
              <p className="mt-1 text-xs text-cyber-cyan/70">
                Max file size: 5MB. Supported formats: JPG, PNG, GIF.
              </p>
            </div>
            
            <div className="flex justify-between">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-white hover:text-cyber-cyan font-cyber border border-cyber-cyan/50 rounded hover:border-cyber-cyan transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cyber-button rounded px-4 py-2"
              >
                {isSubmitting ? 'Adding...' : 'Add Staff'}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffForm;
