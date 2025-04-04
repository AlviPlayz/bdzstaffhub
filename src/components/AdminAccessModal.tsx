
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { Lock, X } from 'lucide-react';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFailure: () => void;
}

const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  onFailure
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const CORRECT_CODE = 'APV09';
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 60; // seconds
  
  // Reset attempts when the modal is opened
  useEffect(() => {
    if (isOpen) {
      // Don't reset attempts or countdown if we're currently in a lockout
      if (!isLocked) {
        setAccessCode('');
      }
    }
  }, [isOpen, isLocked]);
  
  // Countdown timer for locked state
  useEffect(() => {
    let timer: number | undefined;
    
    if (isLocked && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isLocked && countdown === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, countdown]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;
    
    if (accessCode === CORRECT_CODE) {
      toast({
        title: "Access Granted",
        description: "Admin access approved for this session.",
      });
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setCountdown(LOCKOUT_TIME);
        toast({
          title: "Access Locked",
          description: `Too many incorrect attempts. Try again in ${LOCKOUT_TIME} seconds.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Access Denied",
          description: `Incorrect code. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
          variant: "destructive",
        });
      }
      
      setAccessCode('');
    }
  };
  
  const handleCancel = () => {
    onFailure();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="bg-cyber-darkblue border border-cyber-cyan shadow-[0_0_15px_rgba(0,255,255,0.5)] max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Lock className="text-cyber-cyan" size={20} />
            <span className="font-digital text-xl cyber-text-glow text-cyber-cyan">ADMIN ACCESS REQUIRED</span>
          </DialogTitle>
          <DialogDescription className="text-center text-cyber-cyan/70">
            Enter the admin access code to continue
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
              placeholder="Enter access code"
              disabled={isLocked}
              autoFocus
            />
            
            {isLocked && (
              <p className="text-red-400 text-sm mt-2">
                Access locked for {countdown} seconds
              </p>
            )}
            
            {!isLocked && attempts > 0 && (
              <p className="text-yellow-400 text-sm mt-2">
                Attempts remaining: {MAX_ATTEMPTS - attempts}
              </p>
            )}
          </div>
          
          <DialogFooter className="flex gap-4 justify-between sm:justify-between">
            <button 
              type="button" 
              onClick={handleCancel}
              className="flex items-center gap-1 px-4 py-2 text-white hover:text-red-300 font-cyber border border-red-500/50 rounded hover:border-red-500 transition-all"
            >
              <X size={16} />
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLocked}
              className={`cyber-button rounded px-4 py-2 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Submit
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAccessModal;
