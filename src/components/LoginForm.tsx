
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

const LoginForm: React.FC = () => {
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
          description: accessCode === 'APV09' ? "Administrator privileges activated." : "Standard access enabled.",
        });
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with cyberpunk styling */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-digital text-cyber-cyan cyber-text-glow mb-2">BDZ STAFF HUB</h1>
          <p className="text-white/70 font-cyber text-sm">SECURE AUTHENTICATION REQUIRED</p>
        </div>
        
        {/* Login card with cyber styling */}
        <div className="cyber-panel">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-cyber text-cyber-cyan">
                ACCESS CODE
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full bg-cyber-black border border-cyber-cyan rounded px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
                  placeholder="Enter access code... (hint: APV09)"
                  required
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
              ) : (
                'ACCESS SYSTEM'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-xs text-center text-cyber-cyan/60 font-cyber">
            <p>USE ADMINISTRATOR CODE "APV09" FOR FULL ACCESS</p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="mt-8 flex justify-center">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
