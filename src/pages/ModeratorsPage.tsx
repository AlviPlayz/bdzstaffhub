
import React from 'react';
import { useStaff } from '@/contexts/StaffContext';
import StaffCard from '@/components/StaffCard';
import { Shield } from 'lucide-react';

const ModeratorsPage: React.FC = () => {
  const { moderators } = useStaff();
  
  // Sort moderators by overall score
  const sortedModerators = [...moderators].sort((a, b) => b.overallScore - a.overallScore);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <Shield size={24} className="text-cyber-cyan mr-3" />
        <div>
          <h1 className="text-3xl font-digital text-white mb-2">Moderators</h1>
          <p className="text-white/60 font-cyber">Performance rankings for all moderators</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedModerators.map(moderator => (
          <StaffCard key={moderator.id} staff={moderator} />
        ))}
      </div>
      
      {sortedModerators.length === 0 && (
        <div className="cyber-panel text-center py-12">
          <p className="text-cyber-cyan font-digital text-xl mb-2">No moderators found</p>
          <p className="text-white/60 font-cyber">No moderator data is currently available</p>
        </div>
      )}
    </div>
  );
};

export default ModeratorsPage;
