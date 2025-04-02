
import React, { useState, useEffect } from 'react';
import { StaffMember, StaffRole } from '@/types/staff';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
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
    } else if (currentRole === 'Manager') {
      form.setValue('rank', 'Manager');
    }
  }, [currentRole, form]);
  
  // Initialize storage bucket when component mounts
  useEffect(() => {
    initializeStaffImageStorage();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };
  
  const handleSubmit = async (values: StaffFormValues) => {
    setIsSubmitting(true);
    
    try {
      let avatarUrl = '/placeholder.svg';
      
      if (avatarFile) {
        // Generate a temporary ID for the upload
        const tempId = `temp-${Date.now()}`;
        avatarUrl = await uploadStaffImage(avatarFile, tempId, values.role);
        
        if (!avatarUrl) {
          toast({
            title: "Warning",
            description: "Failed to upload image. Using placeholder instead.",
            variant: "destructive",
          });
          avatarUrl = '/placeholder.svg';
        }
      }
      
      const newStaffData: Omit<StaffMember, 'id'> = {
        name: values.name,
        role: values.role,
        rank: values.rank,
        avatar: avatarUrl,
        // Initialize metrics based on role
        metrics: {
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
          exterior: { id: 'exterior', name: 'Exterior', score: 7, letterGrade: 'B' },
          interior: { id: 'interior', name: 'Interior', score: 7, letterGrade: 'B' },
          decoration: { id: 'decoration', name: 'Decoration', score: 7, letterGrade: 'B' },
          effort: { id: 'effort', name: 'Effort', score: 7, letterGrade: 'B' },
          contribution: { id: 'contribution', name: 'Contribution', score: 7, letterGrade: 'B' },
          cooperativeness: { id: 'cooperativeness', name: 'Cooperativeness', score: 7, letterGrade: 'B' },
          creativity: { id: 'creativity', name: 'Creativity', score: 7, letterGrade: 'B' },
          consistency: { id: 'consistency', name: 'Consistency', score: 7, letterGrade: 'B' },
        },
        overallScore: 7,
        overallGrade: 'B',
      };
      
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
      setPreviewUrl(null);
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
                      
                      {currentRole === 'Manager' && (
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
