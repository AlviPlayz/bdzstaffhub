
import React from 'react';

const CyberBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
