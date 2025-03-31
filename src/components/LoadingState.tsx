
import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-t-4 border-cyber-cyan rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-4 border-cyber-pink rounded-full animate-spin animate-[spin_1.2s_linear_infinite]"></div>
        <div className="absolute inset-4 border-b-4 border-cyber-yellow rounded-full animate-spin animate-[spin_1.5s_linear_infinite]"></div>
      </div>
      <p className="mt-6 text-xl font-digital text-cyber-cyan cyber-text-glow">{message}</p>
    </div>
  );
};

export default LoadingState;
