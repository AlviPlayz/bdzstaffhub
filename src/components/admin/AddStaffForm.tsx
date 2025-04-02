
import React, { useState } from 'react';
import { StaffMember, StaffRole } from '@/types/staff';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { uploadStaffImage } from '@/services/supabaseService';

// Define props interface for the component
interface AddStaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (newStaffData: Omit<StaffMember, 'id'>) => Promise<void>;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ isOpen, onClose, onAddStaff }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('Moderator');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let avatarUrl = '';
      if (avatarFile) {
        // Generate a temporary ID for the upload
        const tempId = `temp-${Date.now()}`;
        avatarUrl = await uploadStaffImage(avatarFile, tempId, role);
      }
      
      const newStaffData: Omit<StaffMember, 'id'> = {
        name,
        role,
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
      onClose();
    } catch (error) {
      console.error("Error adding staff:", error);
      // Handle error appropriately (e.g., display an error message)
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cyber-darkblue border border-cyber-cyan shadow-[0_0_15px_rgba(0,255,255,0.5)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="font-digital text-xl cyber-text-glow text-cyber-cyan">ADD NEW STAFF</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-cyber text-cyber-cyan">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-cyber text-cyber-cyan">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
              required
            >
              <option value="Moderator">Moderator</option>
              <option value="Builder">Builder</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-cyber text-cyber-cyan">
              Avatar Image
            </label>
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
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffForm;
