
import React, { useEffect } from 'react';

const CyberBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Upload the BDZONE logo to public/uploads
  useEffect(() => {
    // This code runs client-side only
    console.log('CyberBackground component mounted');
  }, []);

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(0, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0, 255, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* BDZONE Logo with glow effect */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          background: 'url("/lovable-uploads/1b7c38ff-b138-48a0-a410-f92a9d338df1.png") no-repeat center center fixed',
          backgroundSize: '300px',
          filter: 'drop-shadow(0px 0px 15px rgba(0, 255, 0, 0.75))'
        }}
      />
      
      {/* Cyberpunk scan line effect */}
      <div className="scan-line" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-cyber-cyan/20 blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-cyber-purple-highlight/20 blur-[100px] animate-pulse-glow" />
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default CyberBackground;
