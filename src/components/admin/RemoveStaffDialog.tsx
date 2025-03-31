
import React from 'react';
import { StaffMember } from '@/types/staff';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface RemoveStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: () => void;
  staff: StaffMember | null;
}

const RemoveStaffDialog: React.FC<RemoveStaffDialogProps> = ({
  isOpen,
  onClose,
  onRemove,
  staff
}) => {
  if (!staff) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            Are you sure you want to remove <span className="text-cyber-cyan">{staff.name}</span>?
          </p>
        </div>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-white hover:text-cyber-cyan font-cyber border border-cyber-cyan/50 rounded hover:border-cyber-cyan transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onRemove}
            className="px-4 py-2 bg-red-500 text-white font-cyber rounded hover:bg-red-600 transition-all"
          >
            Remove
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveStaffDialog;
