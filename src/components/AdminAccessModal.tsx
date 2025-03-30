
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Lock } from 'lucide-react';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { login } = useAuth();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    // Simulate network delay for dramatic effect
    setTimeout(() => {
      const success = login(accessCode);
      if (success) {
        toast({
          title: "Access Granted",
          description: "Administrator privileges activated."
        });
        onSuccess();
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid access code. Please try again.",
          variant: "destructive"
        });
      }
      setIsValidating(false);
    }, 800);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-cyber-darkblue border border-cyber-cyan shadow-[0_0_15px_rgba(0,255,255,0.5)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="text-cyber-cyan h-5 w-5" />
              <span className="font-digital text-xl cyber-text-glow text-cyber-cyan">ADMIN ACCESS REQUIRED</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center text-white/70 font-cyber text-sm">
            SECURE AUTHENTICATION REQUIRED
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-cyber text-cyber-cyan">
              ACCESS CODE
            </label>
            <div className="relative">
              <input 
                type="password" 
                value={accessCode} 
                onChange={e => setAccessCode(e.target.value)} 
                className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyber-cyan" 
                placeholder="Enter access code..." 
                required 
                autoFocus
              />
              <div className="absolute right-0 top-0 h-full w-12 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${accessCode ? 'bg-cyber-cyan animate-pulse-glow' : 'bg-gray-500'}`}></div>
              </div>
            </div>
          </div>
            
          <button 
            type="submit" 
            disabled={isValidating} 
            className="cyber-button w-full rounded"
          >
            {isValidating ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">VALIDATING</span>
                <div className="h-4 w-4 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin"></div>
              </span>
            ) : 'ACCESS SYSTEM'}
          </button>
        </form>
        
        <div className="mt-6 text-xs text-center text-cyber-cyan/60 font-cyber">
          <p>SECURITY PROTOCOL ACTIVE</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAccessModal;
