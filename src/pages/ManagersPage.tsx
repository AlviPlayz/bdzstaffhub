
import React from 'react';
import { useStaff } from '@/contexts/StaffContext';
import StaffCard from '@/components/StaffCard';
import { Trophy } from 'lucide-react';

const ManagersPage: React.FC = () => {
  const { managers } = useStaff();
  
  // Sort managers by overall score
  const sortedManagers = [...managers].sort((a, b) => b.overallScore - a.overallScore);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <Trophy size={24} className="text-cyber-cyan mr-3" />
        <div>
          <h1 className="text-3xl font-digital text-white mb-2">Managers</h1>
          <p className="text-white/60 font-cyber">Performance rankings for all managers</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedManagers.map(manager => (
          <StaffCard key={manager.id} staff={manager} />
        ))}
      </div>
      
      {sortedManagers.length === 0 && (
        <div className="cyber-panel text-center py-12">
          <p className="text-cyber-cyan font-digital text-xl mb-2">No managers found</p>
          <p className="text-white/60 font-cyber">No manager data is currently available</p>
        </div>
      )}
    </div>
  );
};

export default ManagersPage;
