
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="size-16 relative">
        <div className="absolute inset-0 border-4 border-cyber-cyan rounded-full opacity-20 animate-ping"></div>
        <div className="absolute inset-0 border-4 border-t-transparent border-cyber-cyan rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-cyber-cyan font-digital animate-pulse">LOADING DATA</p>
    </div>
  );
};

export default LoadingState;
