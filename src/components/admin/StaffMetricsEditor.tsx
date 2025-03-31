
import React from 'react';
import { StaffMember, StaffRole, LetterGrade } from '@/types/staff';
import { Trash2, X, Check } from 'lucide-react';

interface StaffMetricsEditorProps {
  selectedStaff: StaffMember | null;
  onScoreChange: (metricKey: string, newScore: number) => void;
  saveChanges: () => void;
  onCancelEdit: () => void;
  onRemoveStaff: () => void;
}

const StaffMetricsEditor: React.FC<StaffMetricsEditorProps> = ({
  selectedStaff,
  onScoreChange,
  saveChanges,
  onCancelEdit,
  onRemoveStaff
}) => {
  
  const getStaffRoleLabel = (role: StaffRole): string => {
    switch (role) {
      case 'Moderator': return 'Moderator';
      case 'Builder': return 'Builder';
      case 'Manager': return 'Manager';
      case 'Owner': return 'Owner';
      default: return 'Unknown';
    }
  };
  
  if (!selectedStaff) {
    return (
      <div className="lg:col-span-2">
        <div className="cyber-panel h-[600px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-cyber-cyan font-digital text-xl mb-2">No Staff Selected</p>
            <p className="text-white/60 font-cyber">Select a staff member to edit their metrics</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="lg:col-span-2">
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
              <p className="text-cyber-cyan text-sm">{getStaffRoleLabel(selectedStaff.role)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onRemoveStaff}
              className="p-2 text-white hover:text-red-500"
              title="Remove Staff Member"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={onCancelEdit}
              className="p-2 text-white hover:text-cyber-cyan"
              title="Cancel Editing"
            >
              <X size={20} />
            </button>
            <button 
              onClick={saveChanges}
              className="cyber-button text-sm py-1 px-3 rounded flex items-center gap-1"
              title="Save Changes"
            >
              <Check size={16} />
              Save Changes
            </button>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2">
          {Object.entries(selectedStaff.metrics).map(([key, metric]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-cyber text-white">{metric.name}</label>
                <div className="text-cyber-cyan text-sm font-digital flex items-center gap-2">
                  <span className="text-white">Score: {metric.score.toFixed(1)}</span>
                  <span className={`letter-grade ${selectedStaff.role === 'Manager' || selectedStaff.role === 'Owner' ? 'grade-sss' : ''}`}>
                    {metric.letterGrade}
                  </span>
                </div>
              </div>
              
              {/* Only show sliders for non-manager/owner roles */}
              {(selectedStaff.role !== 'Manager' && selectedStaff.role !== 'Owner') && (
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={metric.score}
                  onChange={(e) => onScoreChange(key, parseFloat(e.target.value))}
                  className="w-full accent-cyber-cyan bg-cyber-darkpurple h-2 rounded-full appearance-none cursor-pointer"
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Overall Grade Display */}
        <div className="mt-6 border-t border-cyber-cyan/30 pt-4 flex justify-between items-center">
          <div className="text-lg font-digital text-white">
            Overall Performance:
          </div>
          <div className="flex items-center gap-4">
            <div className="text-cyber-cyan font-digital">
              Score: {selectedStaff.overallScore.toFixed(1)}
            </div>
            <div className={`letter-grade text-lg ${selectedStaff.role === 'Manager' || selectedStaff.role === 'Owner' ? 'grade-sss' : ''}`}>
              {selectedStaff.overallGrade}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffMetricsEditor;
