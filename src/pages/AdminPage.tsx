
import React, { useState } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import { User, Search, Check, X } from 'lucide-react';
import { StaffMember } from '@/types/staff';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { allStaff, updateStaffMember } = useStaff();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="cyber-panel max-w-md mx-auto">
          <p className="text-cyber-cyan font-digital text-xl mb-2">Access Denied</p>
          <p className="text-white/60 font-cyber">Administrator privileges required to access this page</p>
        </div>
      </div>
    );
  }
  
  const filteredStaff = allStaff.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
  };
  
  const handleScoreChange = (metricKey: string, newScore: number) => {
    if (!selectedStaff) return;
    
    // Create a safe score between 0 and 10
    const safeScore = Math.min(Math.max(0, newScore), 10);
    
    // Create a deep copy of the staff member
    const updatedStaff = {
      ...selectedStaff,
      metrics: {
        ...selectedStaff.metrics,
        [metricKey]: {
          ...selectedStaff.metrics[metricKey as keyof typeof selectedStaff.metrics],
          score: safeScore
        }
      }
    };
    
    setSelectedStaff(updatedStaff);
  };
  
  const saveChanges = () => {
    if (!selectedStaff) return;
    
    updateStaffMember(selectedStaff);
    toast({
      title: "Changes Saved",
      description: `${selectedStaff.name}'s performance metrics have been updated.`,
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <User size={24} className="text-cyber-cyan mr-3" />
        <div>
          <h1 className="text-3xl font-digital text-white mb-2">Administrator Panel</h1>
          <p className="text-white/60 font-cyber">Manage staff performance metrics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1">
          <div className="cyber-panel mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-cyan" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-cyber-black border border-cyber-cyan rounded pl-10 pr-4 py-2 text-white font-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
              />
            </div>
          </div>
          
          <div className="cyber-panel h-[600px] overflow-y-auto">
            <h2 className="text-lg font-digital text-white mb-4">Staff Members</h2>
            <div className="space-y-3">
              {filteredStaff.map(staff => (
                <div 
                  key={staff.id}
                  onClick={() => handleStaffSelect(staff)}
                  className={`flex items-center p-3 rounded transition-all cursor-pointer
                    ${selectedStaff?.id === staff.id 
                      ? 'bg-cyber-cyan/20 border border-cyber-cyan' 
                      : 'hover:bg-cyber-darkpurple'}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={staff.avatar} 
                      alt={staff.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-cyber">{staff.name}</h3>
                    <p className="text-cyber-cyan text-sm">{staff.role}</p>
                  </div>
                </div>
              ))}
              
              {filteredStaff.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/60 font-cyber">No staff members found</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Staff Metrics Editor */}
        <div className="lg:col-span-2">
          {selectedStaff ? (
            <div className="cyber-panel">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={selectedStaff.avatar} 
                      alt={selectedStaff.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-digital text-white">{selectedStaff.name}</h2>
                    <p className="text-cyber-cyan text-sm">{selectedStaff.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedStaff(null)}
                    className="p-2 text-white hover:text-cyber-cyan"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={saveChanges}
                    className="cyber-button text-sm py-1 px-3 rounded flex items-center gap-1"
                  >
                    <Check size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2">
                {Object.entries(selectedStaff.metrics).map(([key, metric]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-cyber text-white">{metric.name}</label>
                      <div className="text-cyber-cyan text-sm font-digital">
                        Score: {metric.score.toFixed(1)}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={metric.score}
                      onChange={(e) => handleScoreChange(key, parseFloat(e.target.value))}
                      className="w-full accent-cyber-cyan bg-cyber-darkpurple h-2 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cyber-panel h-[600px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-cyber-cyan font-digital text-xl mb-2">No Staff Selected</p>
                <p className="text-white/60 font-cyber">Select a staff member to edit their metrics</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
