
import React from 'react';
import { StaffMember, StaffRole, LetterGrade } from '@/types/staff';
import { Avatar } from '@/components/ui/avatar';

interface StaffListProps {
  filteredStaff: StaffMember[];
  selectedStaff: StaffMember | null;
  onStaffSelect: (staff: StaffMember) => void;
}

const StaffList: React.FC<StaffListProps> = ({ 
  filteredStaff, 
  selectedStaff, 
  onStaffSelect 
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
  
  const getLetterGradeClassName = (grade: LetterGrade): string => {
    switch (grade) {
      case 'S+': return 'text-green-500';
      case 'S': return 'text-green-400';
      case 'A+': return 'text-lime-500';
      case 'A': return 'text-lime-400';
      case 'B+': return 'text-yellow-500';
      case 'B': return 'text-yellow-400';
      case 'C': return 'text-orange-500';
      case 'D': return 'text-orange-400';
      case 'E': return 'text-red-500';
      case 'E-': return 'text-red-400';
      case 'SSS+': return 'text-fuchsia-400';
      case 'Immeasurable': return 'text-fuchsia-400';
      default: return 'text-gray-400';
    }
  };
  
  return (
    <div className="lg:col-span-1">
      <div className="cyber-panel h-[600px] overflow-y-auto">
        <h2 className="text-lg font-digital text-white mb-4">Staff Members ({filteredStaff.length})</h2>
        <div className="space-y-3">
          {filteredStaff.map(staff => (
            <div 
              key={staff.id}
              onClick={() => onStaffSelect(staff)}
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
              <div className="flex-1">
                <h3 className="text-white font-cyber">{staff.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-cyber-cyan text-sm">{getStaffRoleLabel(staff.role)}</p>
                  <p className={`text-sm text-white ${getLetterGradeClassName(staff.overallGrade)}`}>{staff.overallGrade}</p>
                </div>
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
  );
};

export default StaffList;
